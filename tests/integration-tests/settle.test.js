import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import gameSettings from "./_stubs/game-settings";
import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, getTimeOutToPlacingBetTime, initUserSession, checkConnect } from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("when settle", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    it("should return settled status data", (done) => {
        // Arrange
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
        client.handleSignedInEvent(() => {
            client.sendInGameEvent();
        });
        let receivedRemainingTime = false;

        // Act
        client.on(socketOptions.gameName, (inGameData) => {
            if (inGameData.remainingTime && !receivedRemainingTime) {
                receivedRemainingTime = true;
                setTimeout(() => {
                    client.emit(eventTypes.bet, { betChoice: "even", amount: 100 });
                }, getTimeOutToPlacingBetTime(inGameData.remainingTime, gameSettings.durations) * 1000);
            }
        });

        // Assert
        client.on(socketOptions.gameName, (data) => {
            if (data.status) {
                expect(data.status.bet).toBeGreaterThan(0);

                client.close();
                done();
            }
        });
    });

    it("should return settled finish data and hashResult with rawValue", (done) => {
        // Arrange & Act
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
        client.handleSignedInEvent(() => {
            client.sendInGameEvent();
        });

        // Assert
        client.on(socketOptions.gameName, (data) => {
            if (data.finish && data.resultHash) {
                expect(data.resultHash.rawValue).not.toBeEmpty();

                client.close();
                done();
            }
        });
    });

    it("should return resultHash at start placingBet time", (done) => {
        // Arrange & Act
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));

        // Assert
        let startTime = new Date();
        client.on(socketOptions.gameName, (data) => {
            if (data.remainingTime && data.remainingTime === gameSettings.durations.wholeRound) {
                startTime = new Date();
            }

            if (data.resultHash) {
                let endTime = new Date();
                expect(data.resultHash.hashValue).not.toBeEmpty();
                expect(Math.round((endTime - startTime) / 1000)).toEqual(
                    gameSettings.durations.wholeRound - gameSettings.durations.placingBets - 1
                );

                client.close();
                done();
            }
        });
    });
});
