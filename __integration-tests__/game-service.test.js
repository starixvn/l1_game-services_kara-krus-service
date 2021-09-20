import { socketOptions, userSession } from "./stubs/test-data";
import { eventTypes, GameServiceClient } from "./utils/game-client";

let gameServiceClient;
const gameNameEvent = "XocXoc";

beforeAll(() => {
    // Arrange
    gameServiceClient = new GameServiceClient(socketOptions, userSession);
});

afterAll(() => {
    gameServiceClient.close();
});

describe("Dragon Tiger Service", () => {
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
                expect(inGameData.gameConfigs.minbet).toBe(1);
                expect(inGameData.gameConfigs.maxbet).toBe(5000);
                // expect(inGameData.gameConfigs.maxBetChoices.dragon).toBe(20000);
                // expect(inGameData.gameConfigs.maxBetChoices.tiger).toBe(20000);
                // expect(inGameData.gameConfigs.maxBetChoices.tie).toBe(4000);
                // expect(inGameData.gameConfigs.odds.dragon).toBe(2);
                // expect(inGameData.gameConfigs.odds.tiger).toBe(2);
                // expect(inGameData.gameConfigs.odds.tie).toBe(10);

                done();
            }
        });
    });

    it("should return user information when user joins game.", (done) => {
        // Act
        gameServiceClient.emit(eventTypes.inGame);

        // Assert
        gameServiceClient.on(gameNameEvent, (inGameData) => {
            if (inGameData?.user) {
                console.log(inGameData.user);
                expect(inGameData.user.UID).toBe(1);
                expect(inGameData.user.avatarId).toBe(1);
                expect(inGameData.user.currency).toBe("UUS");
                expect(inGameData.user.name).toBe("Alvin");
                expect(inGameData.user.red).toBe(20000);

                done();
            }
        });
    });
});
