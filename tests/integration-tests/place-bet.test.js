import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import gameSettings from "./_stubs/game-settings";
import { startService } from "./_stubs/test-jobs";
import {
    getProcessId,
    buildConfigs,
    getTimeOutToBetInvalid,
    getTimeOutToPlacingBetTime,
    initUserSession,
    checkConnect,
} from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("place bet", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    describe("when place bet in placing bet time", () => {
        it("should return own bet data", (done) => {
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
                if (data.endBet) {
                    expect(data.betChoice).toBe("even");
                    expect(data.endBet).toBe(100);
                    expect(data.ownBets).toEqual({ even: 100 });
                    expect(data.ownChip).toEqual({ betChoice: "even", amount: 100 });

                    client.close();
                    done();
                }
            });
        });
    });

    describe("when place bet NOT in placing bet time", () => {
        it("should return invalid", (done) => {
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
                    }, getTimeOutToBetInvalid(inGameData.remainingTime, gameSettings.durations) * 1000);
                }
            });

            // Assert
            client.on(socketOptions.gameName, (data) => {
                if (data.endBet) {
                    expect(data.endBet).toBe(-1);

                    client.close();
                    done();
                }
            });
        });
    });
});
