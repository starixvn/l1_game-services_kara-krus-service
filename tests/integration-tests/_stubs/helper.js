import fs from "fs";
import appConfigs from "../../../src/app-configs.IGT";
import { currencyData, socketOptionsFunc } from "./test-data";
import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";

export const checkConnect = (processId, callback) => {
    const appConfigs = buildConfigs(processId);
    const socketOptions = socketOptionsFunc(appConfigs.hostingPort);
    const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
    normalUserClientDriver.on(eventTypes.connectError, () => {
        setTimeout(() => {
            checkConnect(callback);
        }, 1000);
    });
    normalUserClientDriver.on(eventTypes.connect, () => {
        setTimeout(callback, 2000);
    });
};

export const getProcessId = (testFileName) => {
    const filePaths = fs
        .readdirSync("./tests/integration-tests", { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.includes(".test."))
        .map((file) => file.name)
        .sort();

    const processId = filePaths.indexOf(testFileName) + 1;

    return processId;
};

export const buildConfigs = (processId) => {
    const copyConfigs = JSON.parse(JSON.stringify(appConfigs));
    copyConfigs.database.options.dbName = `game-service-test-db-${processId}`;
    copyConfigs.hostingPort = 5000 + parseInt(processId);

    return copyConfigs;
};

export const getTimeOutToPlacingBetTime = (remainingTime, durations) => {
    let timeout = 0;
    if (remainingTime <= durations.lockingBet) {
        timeout = remainingTime + durations.wholeRound - durations.placingBets + 1;
    } else if (remainingTime >= durations.placingBets) {
        timeout = remainingTime - durations.placingBets + 1;
    }

    return timeout;
};

export const getTimeOutToSettleTime = (remainingTime, durations) => {
    let timeout = 0;
    if (remainingTime <= durations.placingBets) {
        timeout = remainingTime + 1.5;
    }

    return timeout;
};

export const getTimeOutToBetInvalid = (remainingTime, durations) => {
    let timeout = 0;
    if (remainingTime >= durations.lockingBet && remainingTime <= durations.placingBets) {
        timeout = remainingTime - durations.lockingBet + 1;
    }

    return timeout;
};

export const initUserSession = (user) => {
    return {
        session: `${user.playerId}-session-id`,
        ss: `${user.playerId}-session-id`,
        currency: currencyData.name,
        username: `${user.playerId}_${user.playerName}`,
        browserUserAgent: "browser-user-agent",
    };
};
