import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import gameSettings from "./_stubs/game-settings";
import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, getTimeOutToSettleTime, initUserSession, checkConnect } from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const overrideConfigs = { enabledBoostedOdds: false };
const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId, overrideConfigs);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("when user joins game", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    it("should return game configs", async () => {
        // Arrange
        const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await normalUserClientDriver.handleSignedInEvent();
        normalUserClientDriver.sendInGameEvent();

        // Act
        const inGameData = await normalUserClientDriver.handleGameEvent((inGameData) => inGameData?.gameConfigs);

        // Assert
        expect(inGameData.gameConfigs.minBet).toEqual(1);
        expect(inGameData.gameConfigs.maxBet).toEqual(3000);
        expect(inGameData.gameConfigs.maxBetPerChoices).toStrictEqual({
            even: 3000,
            odd: 3000,
            red2: 3000,
            red3: 3000,
            red4: 1000,
            white3: 3000,
            white4: 1000,
        });
        expect(inGameData.gameConfigs.odds).toStrictEqual({
            even: 1.97,
            odd: 1.97,
            red2: 2.5,
            red3: 3.76,
            red4: 14.5,
            white3: 3.76,
            white4: 14.5,
        });

        normalUserClientDriver.close();
    });

    it("should return user info", async () => {
        // Arrange
        const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await normalUserClientDriver.handleSignedInEvent();
        normalUserClientDriver.sendInGameEvent();

        // Act
        const inGameData = await normalUserClientDriver.handleGameEvent((inGameData) => inGameData?.user?.UID);

        // Assert
        expect(inGameData.user).toStrictEqual({
            UID: 1,
            avatarId: 1,
            currency: "$US",
            name: "NormalUser",
            rate: 1,
            red: 25000,
            type: false,
        });

        normalUserClientDriver.close();
    });

    it("should return round history", async () => {
        // Arrange
        const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await normalUserClientDriver.handleSignedInEvent();
        normalUserClientDriver.sendInGameEvent();

        // Act
        const inGameData = await normalUserClientDriver.handleGameEvent((inGameData) => inGameData?.roundHistory);

        // Assert
        expect(inGameData.roundHistory.length).toBeGreaterThan(0);
        normalUserClientDriver.close();
    });

    describe("when join game in placing bet time", () => {
        it("should return resultHash with hashValue", async (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await normalUserClientDriver.handleGameEvent((gameData) => gameData.spb);

            setTimeout(async () => {
                normalUserClientDriver.sendInGameEvent();

                // Act
                const inGameData = await normalUserClientDriver.handleGameEvent(
                    (inGameData) => inGameData.gameConfigs && inGameData.resultHash
                );

                // Assert
                expect(inGameData.resultHash.hashValue).not.toBeEmpty();
                normalUserClientDriver.close();
                done();
            }, 1000);
        });
    });

    describe("when join game in settle time", () => {
        it("should return resultHash with rawValue", async (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const gameData = await normalUserClientDriver.handleGameEvent((gameData) => gameData.remainingTime);
            const timeout = getTimeOutToSettleTime(gameData.remainingTime, gameSettings.durations) * 1000;

            setTimeout(async () => {
                normalUserClientDriver.sendInGameEvent();
                // Act
                const inGameData = await normalUserClientDriver.handleGameEvent(
                    (inGameData) => inGameData.gameConfigs && inGameData.resultHash
                );

                // Assert
                expect(inGameData.resultHash.rawValue).not.toBeEmpty();

                normalUserClientDriver.close();
                done();
            }, timeout);
        });
    });
});
