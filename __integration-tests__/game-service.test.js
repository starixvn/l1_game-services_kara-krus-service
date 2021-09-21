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

        // Act
        gameServiceClient.emit(eventTypes.inGame);

        // Assert
        gameServiceClient.on(gameNameEvent, (inGameData) => {
            expect(inGameData.gameConfigs).toStrictEqual(expectedGameConfigs);
            expect(inGameData.user).toStrictEqual(expectedUserData);
            done();
        });
    });
});
