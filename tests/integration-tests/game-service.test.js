import {
    errorUser,
    eventTypes,
    GameClientDriver,
    internalServerErrorUser,
    normalUser,
} from "sc-game-service-integration-utils";

import { currencyData, socketOptions } from "./stubs/test-data";

const gameNameEvent = "XocXoc";
const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 60000;
const WAITING_PLACE_BET_TIMEOUT = 10000;
const WAITING_END_GAME_TIMEOUT = 30000;

describe("SeDie Service", () => {
    beforeAll(() => {
        // set timeout for jest, waiting for socket response
        jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
    });

    describe("Happy Path Cases", () => {
        let gameServiceClient;
        beforeAll(() => {
            // Arrange
            gameServiceClient = new GameClientDriver(socketOptions, initUserSession(normalUser));
        });

        afterAll(() => {
            gameServiceClient.close();
        });

        it("should start and allow game client connect to.", (done) => {
            // Assert
            gameServiceClient.on(eventTypes.signedIn, () => {
                done();
            });
        });

        it("should return game configuration (odds, min bet, max bet) when user joins game.", (done) => {
            // Act
            gameServiceClient.emit(eventTypes.inGame);

            // Assert
            gameServiceClient.on(gameNameEvent, (inGameData) => {
                if (inGameData?.gameConfigs) {
                    if (inGameData.gameConfigs) {
                        expect(inGameData.gameConfigs.minBet).toBe(1);
                        expect(inGameData.gameConfigs.maxBet).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.even).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.odd).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.red2).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.red3).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.red4).toBe(1000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.white3).toBe(3000);
                        expect(inGameData.gameConfigs.maxBetPerChoices.white4).toBe(1000);
                        expect(inGameData.gameConfigs.odds.even).toBe(1.97);
                        expect(inGameData.gameConfigs.odds.odd).toBe(1.97);
                        expect(inGameData.gameConfigs.odds.red2).toBe(2.5);
                        expect(inGameData.gameConfigs.odds.red3).toBe(3.76);
                        expect(inGameData.gameConfigs.odds.red4).toBe(14.5);
                        expect(inGameData.gameConfigs.odds.white3).toBe(3.76);
                        expect(inGameData.gameConfigs.odds.white4).toBe(14.5);

                        done();
                    }
                }
            });
        });
        it("should return user information when user joins game.", async (done) => {
            // Act
            gameServiceClient.emit(eventTypes.inGame);

            // Assert
            gameServiceClient.on(gameNameEvent, (inGameData) => {
                if (inGameData?.user?.UID) {
                    expect(inGameData.user.UID).toBe(1);
                    expect(inGameData.user.avatarId).toBe(1);
                    expect(inGameData.user.currency).toBe("$US");
                    expect(inGameData.user.name).toBe("NormalUser");
                    expect(inGameData.user.red).toBe(25000);

                    done();
                }
            });
        });

        it("should return old round history when user joins game", (done) => {
            // Arrange
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

            // Act
            gameServiceClient.emit(eventTypes.inGame);

            // Assert
            gameServiceClient.on(gameNameEvent, (inGameData) => {
                if (inGameData?.roundHistory) {
                    expect(inGameData.roundHistory).toStrictEqual(expectedRoundHistory);
                    done();
                }
            });
        });

        it("should return current user ticket result when user is playing game.", async (done) => {
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

            await new Promise((r) => setTimeout(r, WAITING_PLACE_BET_TIMEOUT));

            // Act
            gameServiceClient.emit(eventTypes.bet, { betChoice, amount });

            // Assert
            gameServiceClient.on(gameNameEvent, (endBetData) => {
                if (endBetData.endBet) {
                    expect(endBetData).toStrictEqual(expectedEndBetResponse);
                    done();
                }
            });
        });

        it("should return bet history when user request", async (done) => {
            // Arrange
            await new Promise((r) => setTimeout(r, WAITING_END_GAME_TIMEOUT));

            // Act
            gameServiceClient.emit(eventTypes.getHistory, { page: 1 });

            // Assert
            gameServiceClient.on(gameNameEvent, (betHistoryData) => {
                if (betHistoryData?.history) {
                    expect(betHistoryData.history.betLogs.length > 0).toBeTruthy();
                    done();
                }
            });
        });
    });

    describe("Unhappy Path Cases", () => {
        it("should return error when place bet failed", async (done) => {
            // Arrange
            const betChoice = "even";
            const amount = 100;
            const gameServiceClient = new GameClientDriver(socketOptions, initUserSession(errorUser));
            gameServiceClient.on(eventTypes.signedIn, () => {
                gameServiceClient.emit(eventTypes.inGame);
            });

            await new Promise((r) => setTimeout(r, WAITING_PLACE_BET_TIMEOUT)); // waiting for place bet time

            // Act
            gameServiceClient.emit(eventTypes.bet, { betChoice, amount });

            // Assert
            gameServiceClient.on(gameNameEvent, (endBetData) => {
                if (endBetData.endBet == -1) {
                    expect(endBetData.betChoice).toEqual("even");
                    expect(endBetData.apiError.errorCode).toEqual(3002);
                    expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                    done();
                    gameServiceClient.close();
                }
            });
        });

        it("should return error when get internal server error from api", async (done) => {
            // Arrange
            const gameServiceClient = new GameClientDriver(socketOptions, initUserSession(internalServerErrorUser));
            gameServiceClient.on(eventTypes.signedIn, () => {
                gameServiceClient.emit(eventTypes.inGame);
            });
            const betChoice = "even";
            const amount = 100;

            await new Promise((r) => setTimeout(r, WAITING_PLACE_BET_TIMEOUT)); // waiting for place bet time

            // Act
            gameServiceClient.emit(eventTypes.bet, { betChoice, amount });

            // Assert
            gameServiceClient.on(gameNameEvent, (endBetData) => {
                if (endBetData.endBet == -1) {
                    expect(endBetData.betChoice).toEqual("even");
                    expect(endBetData.apiError.errorCode).toEqual("SB1900");
                    expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                    done();
                    gameServiceClient.close();
                }
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
