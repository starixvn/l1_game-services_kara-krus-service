import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "../../src/game-settings";

export const settleTest = () => {
    describe("when settle", () => {
        const getTimeOutToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 4;
            } else if (remainingTime > durations.placingBets) {
                timeout = durations.wholeRound - durations.placingBets + 4;
            }

            return timeout;
        };

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
                    }, getTimeOutToBet(inGameData.remainingTime, gameSettings.durations) * 1000);
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
};
