import { GameClientDriver, normalUser, eventTypes, errorUser, internalServerErrorUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "../../src/game-settings";

export const placeBetTest = () => {
    describe("place bet", () => {
        const getTimeOutToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 4;
            } else if (remainingTime > durations.placingBets) {
                timeout = durations.wholeRound - durations.placingBets + 4;
            }

            return timeout;
        };

        const getTimeOutToBetInvalid = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime >= durations.lockingBet && remainingTime <= durations.placingBets) {
                timeout = remainingTime - durations.lockingBet + 1;
            }

            return timeout;
        };

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
                        }, getTimeOutToBet(inGameData.remainingTime, gameSettings.durations) * 1000);
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

        xdescribe("when get error response from api", () => {
            it("should return api error", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(errorUser));
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
                    if (data.endBet) {
                        expect(data.endBet).toBe(-1);
                        expect(data.betChoice).toEqual("even");
                        expect(data.apiError.errorCode).toEqual(3002);
                        expect(data.apiError.isPlaceBetFailed).toEqual(true);

                        client.close();
                        done();
                    }
                });
            });
        });

        xdescribe("when API internal server error", () => {
            it("should return api error", (done) => {
                // Arrange
                const client = new GameClientDriver(socketOptions, initUserSession(internalServerErrorUser));
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
                    if (data.endBet) {
                        expect(data.betChoice).toEqual("even");
                        expect(data.apiError.errorCode).toEqual("SB1900");
                        expect(data.apiError.isPlaceBetFailed).toEqual(true);

                        client.close();
                        done();
                    }
                });
            });
        });
    });
};
