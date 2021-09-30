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

    it("should receive enough data when user joins game.", (done) => {
        // Arrange
        const expectedGameConfigs = {
            minbet: 1,
            maxbet: 5000,
            choices_maxbet: { even: 3000, odd: 3000, red3: 3000, white3: 3000, red4: 1000, white4: 1000, red2: 3000 },
            odds: { even: 1.97, odd: 1.97, red3: 3.76, white3: 3.76, red4: 14.5, white4: 14.5, red2: 2.5 },
            enableFreeBet: false,
        };
        const expectedUserData = { UID: 1, avatarId: 1, currency: "UUS", name: "Alvin", red: 20000 };
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
            if (inGameData?.gameConfigs) {
                expect(inGameData.gameConfigs).toStrictEqual(expectedGameConfigs);
                expect(inGameData.roundHistory).toStrictEqual(expectedRoundHistory);
                expect(inGameData.user).toStrictEqual(expectedUserData);
                done();
            }
        });
    });

    jest.setTimeout(60000);

    it("should return endBet when user placing bet.", async (done) => {
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

        await new Promise((r) => setTimeout(r, 15000));

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
