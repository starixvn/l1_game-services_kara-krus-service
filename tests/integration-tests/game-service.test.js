import {
    endGameErrorUser,
    errorUser,
    GameClientDriver,
    internalServerErrorUser,
    normalUser,
} from "sc-game-service-integration-utils";

import { currencyData, socketOptions } from "./stubs/test-data";

const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 70000;
const WAITING_END_GAME_TIMEOUT = 30000;

describe("SeDie Service", () => {
    beforeAll(() => {
        // set timeout for jest, waiting for socket response
        jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
    });

    describe("Happy Path Cases", () => {
        let gameClientDriver;
        beforeAll(() => {
            // Arrange
            gameClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
        });

        afterAll(() => {
            gameClientDriver.close();
        });

        it("when sign in successful, should receive signed in response", (done) => {
            // Assert
            gameClientDriver.handleSignedInEvent(() => {
                done();
            });
        });

        describe("User joins game", () => {
            // Arrange
            const expectedGameConfigs = {
                minBet: 1,
                maxBet: 3000,
                maxBetPerChoices: {
                    even: 3000,
                    odd: 3000,
                    red2: 3000,
                    red3: 3000,
                    red4: 1000,
                    white3: 3000,
                    white4: 1000,
                },
                odds: {
                    even: 1.97,
                    odd: 1.97,
                    red2: 2.5,
                    red3: 3.76,
                    red4: 14.5,
                    white3: 3.76,
                    white4: 14.5,
                },
            };
            const expectedUser = {
                UID: 1,
                avatarId: 1,
                currency: "$US",
                name: "NormalUser",
                rate: 1,
                red: 25000,
            };

            const expectedRoundHistory = [
                {
                    roundId: 1190117,
                    result: { red1: true, red2: false, red3: false, red4: true },
                    settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
                },
                {
                    roundId: 1190118,
                    result: { red1: false, red2: true, red3: true, red4: false },
                    settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
                },
                {
                    roundId: 1190119,
                    result: { red1: false, red2: false, red3: true, red4: true },
                    settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
                },
            ];

            beforeAll(() => {
                // Act
                gameClientDriver.sendInGameEvent();
            });

            it("should return game configuration (odds, min bet, max bet)", (done) => {
                // Assert
                gameClientDriver.handleInGameEvent((inGameData) => {
                    if (inGameData?.gameConfigs) {
                        if (inGameData.gameConfigs) {
                            expect(inGameData.gameConfigs.minBet).toEqual(expectedGameConfigs.minBet);
                            expect(inGameData.gameConfigs.maxBet).toEqual(expectedGameConfigs.maxBet);
                            expect(inGameData.gameConfigs.maxBetPerChoices).toStrictEqual(expectedGameConfigs.maxBetPerChoices);
                            expect(inGameData.gameConfigs.odds).toStrictEqual(expectedGameConfigs.odds);

                            done();
                        }
                    }
                });
            });

            it("should return user information", () => {
                // Assert
                gameClientDriver.handleInGameEvent((inGameData) => {
                    if (inGameData?.user?.UID) {
                        expect(inGameData.user).toStrictEqual(expectedUser);

                        done();
                    }
                });
            });

            it("should return old round history", () => {
                // Assert
                gameClientDriver.handleInGameEvent((inGameData) => {
                    if (inGameData?.roundHistory) {
                        expect(inGameData.roundHistory).toStrictEqual(expectedRoundHistory);
                        done();
                    }
                });
            });
        });

        describe("User placing bet", () => {
            it("should return current user ticket result", (done) => {
                // Arrange
                const betChoice = "even";
                const amount = 100;

                const expectedEndBetResponse = {
                    ownBets: { even: 100 },
                    endBet: 100,
                    betChoice: "even",
                    freeBet: false,
                    user: { maxBet: 2000, minBet: 1, red: 24250, scoins: 0 },
                    ownChip: { betChoice: "even", amount: 100 },
                };

                // Act
                gameClientDriver.sendBetEvent(betChoice, amount);

                // Assert
                gameClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet) {
                        expect(endBetData).toStrictEqual(expectedEndBetResponse);
                        done();
                    }
                });
            });
        });

        describe("Get user bet history", () => {
            it("should return bet history", async (done) => {
                // Arrange
                await new Promise((r) => setTimeout(r, WAITING_END_GAME_TIMEOUT));
                // Act
                gameClientDriver.sendGetHistoryEvent();
                // Assert
                gameClientDriver.handleGetHistoryEvent((betHistoryData) => {
                    if (betHistoryData?.history) {
                        expect(betHistoryData.history.betLogs.length > 0).toBeTruthy();
                        done();
                    }
                });
            });
        });
    });

    describe("Unhappy Path Cases", () => {
        describe("Place bet failed", () => {
            it("when receive place bet from api, should return correct error to client", (done) => {
                // Arrange
                const betChoice = "even";
                const amount = 100;
                const gameClientDriver = new GameClientDriver(socketOptions, initUserSession(errorUser));

                // Act
                gameClientDriver.sendBetEvent(betChoice, amount);

                // Assert
                gameClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet === -1) {
                        expect(endBetData.betChoice).toEqual("even");
                        expect(endBetData.apiError.errorCode).toEqual(3002);
                        expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                        done();
                    }
                });
            });

            it("when get internal error from api, should return correct error to client", (done) => {
                // Arrange
                const gameClientDriver = new GameClientDriver(socketOptions, initUserSession(internalServerErrorUser));
                gameClientDriver.handleSignedInEvent(() => {
                    gameClientDriver.sendInGameEvent();
                });
                const betChoice = "even";
                const amount = 100;

                // Act
                gameClientDriver.sendBetEvent(betChoice, amount);

                // Assert
                gameClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet === -1) {
                        expect(endBetData.betChoice).toEqual("even");
                        expect(endBetData.apiError.errorCode).toEqual("SB1900");
                        expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                        done();
                        gameClientDriver.close();
                    }
                });
            });
        });

        describe("End game failed", () => {
            it("when receive end game error from api, should return error to client", async (done) => {
                // Arrange
                const betChoice = "even";
                const amount = 100;
                const gameClientDriver = new GameClientDriver(socketOptions, initUserSession(endGameErrorUser));

                // Act
                await gameClientDriver.sendBetEvent(betChoice, amount);

                // Assert
                gameClientDriver.handleEndBetEvent((endGameData) => {
                    if (endGameData.apiError?.errorCode === 1000) {
                        gameClientDriver.close();
                        done();
                    }
                });
            });
        });
    });
});

const initUserSession = (user) => {
    return {
        session: `${user.memberId}-session-id`,
        ss: `${user.memberId}-session-id`,
        currency: currencyData.name,
        username: `${user.memberId}_${user.memberName}`,
        browserUserAgent: "browser-user-agent",
    };
};
