import cron from "cron";
import { gameConfigs } from "sc-base-database";
import { BaseEventPublishers } from "sc-game-base";
import appConfigs from "../app-configs.js";
import constants from "../constants.js";
import { settleGameRound } from "../event-consumers/index.js";
import storage from "../game-data.js";
import { addBots, resetBots } from "./bot.js";
import { logger } from "sc-common";

const runningRoundInfoPublisher = new BaseEventPublishers.RunningRoundInfoPublisher(storage, appConfigs.gameName);
const gameStatusPublisher = new BaseEventPublishers.GameStatusPublisher(storage, appConfigs.gameName);

const runGame = (gameData) => new cron.CronJob("* * * * * *", () => proceed(gameData).catch(logger.logError), null, true);

const proceed = async (gameData) => {
    if (gameData.remainingTime == constants.roundDuration) {
        await checkGameStatus(gameData);
    }

    if (!gameData.disabled) {
        gameData.remainingTime--;
    }

    if (gameData.remainingTime == 34) {
        resetForNewRound(gameData);
    }

    if (gameData.remainingTime < constants.placingBetDuration) {
        if (gameData.remainingTime < 1) {
            gameData.remainingTime = constants.roundDuration;

            await settleGameRound(gameData);
            await resetBots();
        } else {
            await addBots(gameData.remainingTime, gameData.roundId);

            runningRoundInfoPublisher.publish(gameData);
        }
    }
};

const checkGameStatus = async (gameData) => {
    const seDieConfigs = await gameConfigs.findOne({ name: appConfigs.gameName });
    storage.gameConfigs = seDieConfigs;
    const previouslyDisabled = gameData.disabled;
    gameData.disabled = seDieConfigs === null || !seDieConfigs.enabled;

    if (gameData.disabled) {
        gameData.remainingTime = constants.roundDuration;
        gameStatusPublisher.publishDisableGameStatus(seDieConfigs);
        await gameConfigs.updateOne({ name: appConfigs.gameName }, { disabledround: gameData.roundId });
    } else if (previouslyDisabled) {
        gameStatusPublisher.publishPreviousDisableGameStatus({ gameData, gameConfigs: seDieConfigs });
    } else {
        gameStatusPublisher.publishStartGame(gameData);
    }
};

const resetForNewRound = (gameData) => {
    gameData.winClients = {};
    gameData.usersData = {};
    gameData.totalBets = { ...constants.resetTotalBets };
};

export default runGame;
