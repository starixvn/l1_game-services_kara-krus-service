import { endGame } from 'sc-base-apis';
import appConfigs from '../app-configs.js';
import { updateBotBalance } from '../cron/bot.js';
import { SedieRoundResultPublisher, SedieUserBetResultPublisher } from '../event-publishers/index.js';
import seDieBetLogs from '../models/sedie-betlogs.js';
import seDieTempBetLogs from '../models/sedie-temp-betlogs.js';
import seDieRounds from '../models/sedie-rounds.js';
import seDieUsers from '../models/sedie-users.js';
import storage from '../storage.js';
import { logger } from 'sc-common';

const roundResultPublisher = new SedieRoundResultPublisher(storage, appConfigs.gameName);
const userBetResultPublisher = new SedieUserBetResultPublisher(storage, appConfigs.gameName);

export default async (gameData) => {
    const result = generateResult();
    const newRound = await seDieRounds.create({ ...result, time: new Date() });

    if (!!newRound) {
        const roundResult = {
            result,
            roundId: newRound.id,
            time: newRound.time,
        };
        gameData.roundId = newRound.id + 1;

        await settleBets(gameData, roundResult);
    }
};

const settleBets = async (gameData, { result, roundId, time }) => {
    let red = 0;

    Object.values(result).forEach((dot) => {
        if (dot) {
            red++;
        }
    });

    const gameChan = !(red % 2);

    const realPlayerBets = await seDieBetLogs.find({ phien: roundId }).exec();
    const botBets = await seDieTempBetLogs.find({ phien: roundId }).exec();
    const allBets = realPlayerBets.concat(botBets);

    if (allBets && allBets.length) {
        const odds = storage.gameConfigs.odds;

        Promise.all(
            allBets.map(async (bet) => {
                const totalBet = bet.chan + bet.le + bet.red3 + bet.red4 + bet.white3 + bet.white4;
                let TienThang = 0;
                let TongThua = 0;
                let TongThang = 0;
                let boxes = {};

                if (bet.chan > 0) {
                    boxes['main'] = true;
                    if (gameChan) {
                        const winRed = bet.chan * odds.even;
                        TongThang += winRed;
                        TienThang += winRed - bet.chan;
                    } else {
                        TongThua += bet.chan;
                    }
                }
                if (bet.le > 0) {
                    boxes['main'] = true;
                    if (!gameChan) {
                        const winRed = bet.le * odds.odd;
                        TongThang += winRed;
                        TienThang += winRed - bet.le;
                    } else {
                        TongThua += bet.le;
                    }
                }
                if (bet.red3 > 0) {
                    boxes['sub'] = true;
                    if (red == 3) {
                        const winRed = bet.red3 * odds.red3;
                        TongThang += winRed;
                        TienThang += winRed - bet.red3;
                    } else {
                        TongThua += bet.red3;
                    }
                }
                if (bet.red4 > 0) {
                    boxes['sub'] = true;
                    if (red == 4) {
                        const winRed = bet.red4 * odds.red4;
                        TongThang += winRed;
                        TienThang += winRed - bet.red4;
                    } else {
                        TongThua += bet.red4;
                    }
                }
                if (bet.white3 > 0) {
                    boxes['sub'] = true;
                    if (red == 1) {
                        const winRed = bet.white3 * odds.white3;
                        TongThang += winRed;
                        TienThang += winRed - bet.white3;
                    } else {
                        TongThua += bet.white3;
                    }
                }
                if (bet.white4 > 0) {
                    boxes['sub'] = true;
                    if (red == 0) {
                        const winRed = bet.white4 * odds.white4;
                        TongThang += winRed;
                        TienThang += winRed - bet.white4;
                    } else {
                        TongThua += bet.white4;
                    }
                }

                let update = {};
                let updateGame = {};

                TongThang = parseFloat(TongThang.toFixed(2));
                TienThang = parseFloat(TienThang.toFixed(2));

                bet.thanhtoan = true;
                bet.betwin = TongThang;
                await bet.save();

                if (TongThang > 0) {
                    update['red'] = TongThang;
                }
                if (TienThang > 0) {
                    update['redWin'] = updateGame['red'] = TienThang;
                }
                if (TongThua > 0) {
                    update['redLost'] = updateGame['red_lost'] = TongThua;
                }

                update['redPlay'] = updateGame['redPlay'] = totalBet;

                let gameInfo = {
                    gameId: appConfigs.gameId,
                    gameRoundId: roundId,
                    memberId: bet.memberId,
                    siteId: bet.siteId,
                    time,
                };

                const apiResult = await endGame(bet.uid, gameInfo, update);

                if (apiResult.isOk) {
                    await seDieUsers.updateOne({ uid: bet.uid }, { $inc: updateGame });

                    let status = {};

                    if (TongThang > 0) {
                        status = { win: true, bet: TongThang };
                        status.boxs = boxes;
                        gameData.winClients[bet.uid] = status;

                        if (gameData.usersAndBots[bet.uid]) {
                            gameData.usersAndBots[bet.uid].red += TongThang;

                            updateBotBalance(bet.uid, gameData.usersAndBots[bet.uid].red);
                        }
                    } else {
                        status = { win: false, bet: TongThua };
                    }

                    userBetResultPublisher.publish({ bet, betResult: status });
                } else {
                    userBetResultPublisher.publishEndGameError(bet.uid, apiResult.response);
                }

                // TODO: Update user coin
                //     if (status.win && void 0 !== self.io.users[bet.uid]) {
                //         self.io.users[bet.uid].forEach(function (client) {
                //             User.updateCoint(client);
                //         });
                //     }
            })
        )
            .then(() => {
                roundResultPublisher.publishRoundResult({ result, roundId, winClients: gameData.winClients });
            })
            .catch(logger.logError);
    } else {
        roundResultPublisher.publishRoundResult({ result, roundId, winClients: gameData.winClients });
    }
};

const generateResult = () => {
    let red1 = (Math.random() * 2) >> 0;
    let red2 = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3 <= 10;
    let red3 =
        (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3) % 2 == 0;
    let red4 = (Math.floor(Math.random() * 10000) + 1) % 2 != 0;

    return { red1, red2, red3, red4 };
};
