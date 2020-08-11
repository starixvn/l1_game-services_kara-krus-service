import { placeBet } from 'sc-base-apis';
import { helpers, logger } from 'sc-common';
import appConfigs from '../app-configs.js';
import constants from '../constants.js';
import { SediePlaceBetPublisher } from '../event-publishers/index.js';
import sedieBetLogs from '../models/sedie-betlogs.js';
import storage from '../storage.js';

export default class SediePlaceBetConsumer {
    choiceMapper = {
        chan: 1,
        le: 2,
        red3: 3,
        red4: 4,
        white3: 5,
        white4: 6,
    };

    /**
     * @param {SediePlaceBetPublisher} placeBetPublisher
     */
    constructor(placeBetPublisher) {
        this.placeBetPublisher = placeBetPublisher ?? new SediePlaceBetPublisher(storage, appConfigs.gameName);
    }

    async placeBet(user, payload, storage) {
        const betAmount = payload.cuoc >> 0;
        const betChoice = payload.box;
        const gameData = storage.gameData;
        let userData = gameData.usersData[user.UID];
        const maxBetPerChoice =
            storage.gameConfigs.choices_maxbet[helpers.configHelper.convertBetChoiceName(betChoice)] || 0;
        const { betTracks } = userData || { betTracks: {} };
        const totalAmount =
            constants.choices.reduce((total, choice) => total + (betTracks[choice] || 0), 0) + betAmount;

        if (gameData.remainingTime >= 31 && gameData.remainingTime <= 33) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.cannotPlaceBet });
            return;
        }

        if (gameData.remainingTime < 6 || gameData.remainingTime > 33) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.placeBetNextRound });
            return;
        }

        if (betAmount < storage.gameConfigs.minbet) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.minBet(storage.gameConfigs.minbet),
            });
            return;
        }

        if (betAmount > maxBetPerChoice || (betTracks && betTracks[betChoice] + betAmount > maxBetPerChoice)) {
            placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.maxBetForChoice(maxBetPerChoice),
            });
            return;
        }

        if (totalAmount > storage.gameConfigs.maxbet) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.maxBet(storage.gameConfigs.maxbet),
            });
            return;
        }

        if (userData && userData.betTracks) {
            userData.betTracks[betChoice] += betAmount;
            userData.betQueue.push({ user, payload, gameData });
        } else {
            const newUserData = {
                name: user.profile.name,
                betTracks: { ...constants.resetTotalBets },
                betQueue: [{ user, payload, gameData }],
            };

            newUserData.betTracks[betChoice] = betAmount;
            gameData.usersData[user.UID] = newUserData;
            userData = newUserData;
        }
        // return await proceedBet(user, payload, gameData, userData);
    }

    async proceedBet(user, payload, gameData, userData) {
        try {
            const betAmount = payload.cuoc >> 0;
            const betChoice = payload.box;

            const betInfo = {
                cuoc: betAmount,
                gameId: appConfigs.gameId,
                gameRoundId: gameData.roundId,
                choiceId: this.choiceMapper[betChoice],
            };

            const apiResult = await placeBet({ id: user.UID, session: user.session }, betInfo);

            if (apiResult.isOk) {
                await this.handleSuccessBet(user, userData, gameData, apiResult.response.red, betChoice, betAmount);
            } else {
                const notice = apiResult.response.inSufficientBalance
                    ? helpers.noticeHelper.notEnoughMoney
                    : apiResult.response;

                await this.handleFailedBet(user, userData, betChoice, betAmount, notice);
            }
        } catch (error) {
            console.log(error);
            logger.logError(error);
        }
    }

    async handleSuccessBet(user, userData, gameData, userBalance, betChoice, betAmount) {
        const existingBetFilter = { uid: user.UID, phien: gameData.roundId };
        const existingBet = await sedieBetLogs.findOne(existingBetFilter);

        if (existingBet) {
            existingBet[betChoice] += betAmount;
            await existingBet.save();
        } else {
            let newBet = {
                uid: user.UID,
                name: user.profile.name,
                phien: gameData.roundId,
                red: userBalance,
                time: new Date(),
            };

            if (user.session) {
                newBet.memberId = user.session.memberId;
                newBet.siteId = user.session.siteId;
            }

            const existingBetIncrement = { [betChoice]: betAmount };

            await sedieBetLogs.updateOne(
                existingBetFilter,
                { $inc: existingBetIncrement, $setOnInsert: newBet },
                { upsert: true, setDefaultsOnInsert: true }
            );
        }

        const result = this.generatePlacingBetResult(gameData, user, userData, userBalance, betChoice, betAmount);
        this.placeBetPublisher.publishSuccessBet(result);
    }

    handleFailedBet(user, userData, betChoice, betAmount, notice) {
        userData.betTracks[betChoice] -= betAmount;

        if (notice.apiError) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, apiError: notice.apiError });
        } else if (notice.kickedOut) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, kickedOut: notice.kickedOut });
        } else {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, notice });
        }
    }

    generatePlacingBetResult(gameData, user, userData, userBalance, betChoice, betAmount) {
        gameData.totalBets[betChoice] += betAmount;

        if (gameData.usersAndBots[user.UID]) {
            gameData.usersAndBots[user.UID].red = userBalance;
        }

        return {
            userId: user.UID,
            otherUsers: { chip: { playerId: user.UID, box: betChoice, cuoc: betAmount, red: userBalance } },
            currentUser: {
                endBet: betAmount,
                mechip: { box: betChoice, cuoc: betAmount },
                me: { red: userData.betTracks },
                user: { red: userBalance },
            },
        };
    }
}
