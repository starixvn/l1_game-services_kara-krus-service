import { placeBet } from "sc-base-apis";
import { helpers, logger } from "sc-common";
import { BaseEventConsumers } from "sc-game-base";
import appConfigs from "../app-configs.js";
import constants from "../constants.js";
import { SediePlaceBetPublisher } from "../event-publishers/index.js";
import sedieBetLogs from "../models/sedie-betlogs.js";

export default class SediePlaceBetConsumer extends BaseEventConsumers.PlaceBetConsumer {
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
    constructor(storage, placeBetPublisher) {
        super();
        this.storage = storage;
        this.gameData = storage.gameData;
        this.placeBetPublisher = placeBetPublisher ?? new SediePlaceBetPublisher(storage, appConfigs.gameName);
    }

    async placeBet(user, payload) {
        if (!user) {
            return;
        }

        const userData = this.gameData.usersData[user.UID];

        if (userData && userData.betTracks) {
            userData.betQueue.push({ user, payload });
        } else {
            const newUserData = {
                name: user.profile.name,
                betQueue: [{ user, payload }],
                betTracks: { ...constants.resetTotalBets },
            };

            this.gameData.usersData[user.UID] = newUserData;
        }
    }

    async proceedBet(user, payload, userData) {
        try {
            if (!this.validateBetRequest(user, payload)) {
                return;
            }

            const betAmount = payload.cuoc >> 0;
            const betChoice = payload.box;

            const betInfo = {
                cuoc: betAmount,
                gameId: appConfigs.gameId,
                gameRoundId: this.gameData.roundId,
                choiceId: this.choiceMapper[betChoice],
            };

            const apiResult = await placeBet({ id: user.UID, session: user.session }, betInfo);

            if (apiResult.isOk) {
                await this.handleSuccessBet(user, userData, apiResult.response.red, betChoice, betAmount);
            } else {
                const notice = apiResult.response.inSufficientBalance ? helpers.noticeHelper.notEnoughMoney : apiResult.response;

                await this.handleFailedBet(user, userData, betChoice, betAmount, notice);
            }
        } catch (error) {
            console.log(error);
            logger.logError(error);
        }
    }

    validateBetRequest(user, payload) {
        let userData = this.gameData.usersData[user.UID];
        const betAmount = payload.cuoc >> 0;
        const betChoice = payload.box;
        const maxBetPerChoice = this.storage.gameConfigs.choices_maxbet[helpers.configHelper.convertBetChoiceName(betChoice)] || 0;
        const { betTracks } = userData || { betTracks: {} };
        const totalAmount = constants.choices.reduce((total, choice) => total + (betTracks[choice] || 0), 0) + betAmount;

        if (this.gameData.remainingTime >= 31 && this.gameData.remainingTime <= 33) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.cannotPlaceBet });
            return false;
        }

        if (this.gameData.remainingTime < 6 || this.gameData.remainingTime > 33) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.placeBetNextRound });
            return false;
        }

        if (betAmount < this.storage.gameConfigs.minbet) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.minBet(this.storage.gameConfigs.minbet),
            });
            return false;
        }

        if (betAmount > maxBetPerChoice || (betTracks && betTracks[betChoice] + betAmount > maxBetPerChoice)) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.maxBetForChoice(maxBetPerChoice),
            });
            return false;
        }

        if (totalAmount > this.storage.gameConfigs.maxbet) {
            this.placeBetPublisher.publishGameFailedBet(user.UID, {
                notice: helpers.noticeHelper.maxBet(this.storage.gameConfigs.maxbet),
            });
            return false;
        }

        this.gameData.usersData[user.UID].betTracks[betChoice] += betAmount;

        return true;
    }

    async handleSuccessBet(user, userData, userBalance, betChoice, betAmount) {
        const existingBetFilter = { uid: user.UID, phien: this.gameData.roundId };
        const existingBet = await sedieBetLogs.findOne(existingBetFilter);

        if (existingBet) {
            existingBet[betChoice] += betAmount;
            await existingBet.save();
        } else {
            let newBet = {
                uid: user.UID,
                name: user.profile.name,
                phien: this.gameData.roundId,
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

        const result = this.generatePlacingBetResult(user, userData, userBalance, betChoice, betAmount);
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

    generatePlacingBetResult(user, userData, userBalance, betChoice, betAmount) {
        this.gameData.totalBets[betChoice] += betAmount;

        if (this.gameData.usersAndBots[user.UID]) {
            this.gameData.usersAndBots[user.UID].red = userBalance;
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
