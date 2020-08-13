import { endGame } from "sc-base-apis";
import appConfigs from "../app-configs.js";
import { updateBotBalance } from "../cron/bot.js";
import { SedieRoundResultPublisher, SedieUserBetResultPublisher } from "../event-publishers/index.js";
import seDieBetLogs from "../models/sedie-betlogs.js";
import seDieTempBetLogs from "../models/sedie-temp-betlogs.js";
import seDieRounds from "../models/sedie-rounds.js";
import seDieUsers from "../models/sedie-users.js";
import storage from "../storage.js";
import { logger } from "sc-common";
import { generateResult, getSettlementResult } from "./result-helper.js";

const roundResultPublisher = new SedieRoundResultPublisher(storage, appConfigs.gameName);
const userBetResultPublisher = new SedieUserBetResultPublisher(storage, appConfigs.gameName);

export default async (gameData) => {
    try {
        const result = generateResult();
        const settlementResult = getSettlementResult(result);
        const newRound = await seDieRounds.create({ ...result, time: new Date() });

        if (!!newRound) {
            const roundResult = {
                result,
                settlementResult,
                roundId: newRound.id,
                time: newRound.time,
            };
            gameData.roundId = newRound.id + 1;

            await settleBets(gameData, roundResult);
        }
    } catch (ex) {
        console.log(ex);
    }
};

const settleBets = async (gameData, { result, settlementResult, roundId, time }) => {
    const realPlayerBets = await seDieBetLogs.find({ phien: roundId }).exec();
    const botBets = await seDieTempBetLogs.find({ phien: roundId }).exec();
    const allBets = realPlayerBets.concat(botBets);

    if (allBets && allBets.length) {
        const { odds } = storage.gameConfigs;

        Promise.all(
            allBets.map(async (bet) => {
                const betResult = calculateBetResult(settlementResult, bet, odds);

                bet.thanhtoan = true;
                bet.betwin = betResult.totalWin;
                await bet.save();

                const settlementInfo = { redPlay: betResult.totalBetAmount };
                const userUpdate = { redPlay: betResult.totalBetAmount };

                if (betResult.totalWin > 0) {
                    settlementInfo.red = betResult.totalWin;
                }

                if (betResult.netWin > 0) {
                    settlementInfo.redWin = betResult.netWin;
                    userUpdate.red = betResult.netWin;
                }

                if (betResult.totalLost > 0) {
                    settlementInfo.redLost = betResult.totalLost;
                    userUpdate.red_Lost = betResult.totalLost;
                }

                let gameInfo = {
                    gameId: appConfigs.gameId,
                    gameRoundId: roundId,
                    memberId: bet.memberId,
                    siteId: bet.siteId,
                    time,
                };

                const apiResult = await endGame(bet.uid, gameInfo, settlementInfo);

                if (apiResult.isOk) {
                    await seDieUsers.updateOne({ uid: bet.uid }, { $inc: userUpdate });

                    const status = { winningByChoices: betResult.winningByChoices };

                    if (betResult.totalWin > 0) {
                        status.win = true;
                        status.bet = betResult.totalWin;
                        gameData.winClients[bet.uid] = status;

                        if (gameData.usersAndBots[bet.uid]) {
                            gameData.usersAndBots[bet.uid].red += betResult.totalWin;

                            updateBotBalance(bet.uid, gameData.usersAndBots[bet.uid].red);
                        }
                    } else {
                        status.win = false;
                        status.bet = betResult.totalLost;
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
                roundResultPublisher.publishRoundResult({ result, settlementResult, roundId, winClients: gameData.winClients });
            })
            .catch(logger.logError);
    } else {
        roundResultPublisher.publishRoundResult({ result, settlementResult, roundId, winClients: gameData.winClients });
    }
};

const calculateBetResult = (settlementResult, bet, odds) => {
    const betResult = Object.entries(settlementResult).reduce(
        (result, [choice, win]) => {
            const betAmount = bet[convertBetChoiceName(choice)];
            const winAmount = win ? betAmount * (odds[choice] || 1) : 0;

            result.totalBetAmount += betAmount;
            result.totalWin += winAmount;
            result.winningByChoices[choice] = winAmount;

            if (winAmount > 0) {
                result.netWin += winAmount - betAmount;
            } else {
                result.totalLost += betAmount;
            }

            return result;
        },
        {
            totalBetAmount: 0,
            totalWin: 0,
            netWin: 0,
            totalLost: 0,
            winningByChoices: {},
        }
    );

    betResult.totalWin = parseFloat(betResult.totalWin.toFixed(2));
    betResult.netWin = parseFloat(betResult.netWin.toFixed(2));

    return betResult;
};

const convertBetChoiceName = (name) => {
    switch (name) {
        case "chan":
            return "even";
        case "le":
            return "odd";
        default:
            return name;
    }
};
