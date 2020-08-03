import { placeBet } from 'sc-base-apis';
import { helpers, logger } from 'sc-common';
import appConfigs from '../app-configs.js';
import constants from '../constants.js';
import { SediePlaceBetPublisher } from '../event-publishers/index.js';
import sedieBetLogs from '../models/sedie-betlogs.js';
import storage from '../storage.js';

const choiceMapper = {
    chan: 1,
    le: 2,
    red3: 3,
    red4: 4,
    white3: 5,
    white4: 6,
};

const placeBetPublisher = new SediePlaceBetPublisher(storage, appConfigs.gameName);

export default async (user, payload, storage) => {
    const betAmount = payload.cuoc >> 0;
    const betChoice = payload.box;
    const gameData = storage.gameData;
    let userData = gameData.usersData[user.UID];
    const maxBetPerChoice =
        storage.gameConfigs.choices_maxbet[helpers.configHelper.convertBetChoiceName(betChoice)] || 0;
    const { betTracks } = userData || { betTracks: {} };
    const totalAmount = constants.choices.reduce((total, choice) => total + (betTracks[choice] || 0), 0) + betAmount;

    if (gameData.remainingTime >= 31 && gameData.remainingTime <= 33) {
        placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.cannotPlaceBet });
        return;
    }

    if (gameData.remainingTime < 6 || gameData.remainingTime > 33) {
        placeBetPublisher.publishGameFailedBet(user.UID, { notice: helpers.noticeHelper.placeBetNextRound });
        return;
    }

    if (betAmount < storage.gameConfigs.minbet) {
        placeBetPublisher.publishGameFailedBet(user.UID, {
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
        placeBetPublisher.publishGameFailedBet(user.UID, {
            notice: helpers.noticeHelper.maxBet(storage.gameConfigs.maxbet),
        });
        return;
    }

    if (userData && userData.betTracks) {
        userData.betTracks[betChoice] += betAmount;
    } else {
        const newUserData = {
            name: user.profile.name,
            betTracks: { ...constants.resetTotalBets },
        };

        newUserData.betTracks[betChoice] = betAmount;
        gameData.usersData[user.UID] = newUserData;
        userData = newUserData;
    }

    return await proceedBet(user, payload, gameData, userData);
};

const proceedBet = async (user, payload, gameData, userData) => {
    try {
        const betAmount = payload.cuoc >> 0;
        const betChoice = payload.box;

        const betInfo = {
            cuoc: betAmount,
            gameId: appConfigs.gameId,
            gameRoundId: gameData.roundId,
            choiceId: choiceMapper[betChoice],
        };

        const apiResult = await placeBet({ id: user.UID, session: user.session }, betInfo);

        if (apiResult.isOk) {
            await handleSuccessBet(user, userData, gameData, apiResult.response.red, betChoice, betAmount);
        } else {
            const notice = apiResult.response.inSufficientBalance
                ? helpers.noticeHelper.notEnoughMoney
                : apiResult.response;

            await handleFailedBet(user, userData, betChoice, betAmount, notice);
        }
    } catch (error) {
        logger.logError(error);
    }
};

const handleSuccessBet = async (user, userData, gameData, userBalance, betChoice, betAmount) => {
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

    const result = generatePlacingBetResult(gameData, user, userData, userBalance, betChoice, betAmount);
    placeBetPublisher.publishSuccessBet(result);
};

const handleFailedBet = (user, userData, betChoice, betAmount, notice) => {
    userData.betTracks[betChoice] -= betAmount;

    if (notice.apiError) {
        placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, apiError: notice.apiError });
    } else if (notice.kickedOut) {
        placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, kickedOut: notice.kickedOut });
    } else {
        placeBetPublisher.publishGameFailedBet(user.UID, { endBet: -1, notice });
    }
};

const generatePlacingBetResult = (gameData, user, userData, userBalance, betChoice, betAmount) => {
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
};
