import { eventTypes, GameServiceClient } from "sc-game-service-integration";

import { socketOptions, userSession } from "./stubs/test-data";

let gameServiceClient;
const gameNameEvent = "XocXoc";

beforeAll(() => {
    // Arrange
    gameServiceClient = new GameServiceClient(socketOptions, userSession);
});

afterAll(() => {
    gameServiceClient.close();
});

describe("Sedie Service", () => {
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
                if (inGameData?.gameConfigs) {
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

                done();
            }
        });
    });

    it("should return user information when user joins game.", (done) => {
        // Act
        gameServiceClient.emit(eventTypes.inGame);

        // Assert
        gameServiceClient.on(gameNameEvent, (inGameData) => {
            if (inGameData?.user?.UID) {
                expect(inGameData.user.UID).toBe(1);
                expect(inGameData.user.avatarId).toBe(1);
                expect(inGameData.user.currency).toBe("$US");
                expect(inGameData.user.name).toBe("Alvin");
                expect(inGameData.user.red).toBe(20000);

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

    jest.setTimeout(60000);

    it("should return current user ticket result when user is playing game.", async (done) => {
        // Arrange
        const betChoice = "even";
        const amount = 100;

        const expectedEndBetResponse = {
            ownBets: { even: 100 },
            endBet: 100,
            betChoice: "even",
            freeBet: false,
            user: { red: 19900 },
            ownChip: { betChoice: "even", amount: 100 },
        };

        await new Promise((r) => setTimeout(r, 10000));

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
        await new Promise((r) => setTimeout(r, 30000));

        // Act
        gameServiceClient.emit(eventTypes.getHistory, { page: 1 });

        // Assert
        gameServiceClient.on(gameNameEvent, (betHistoryData) => {
            if (betHistoryData?.history) {
                expect(betHistoryData?.history.betLogs.length > 0).toBeTruthy();
                done();
            }
        });
    });
});
