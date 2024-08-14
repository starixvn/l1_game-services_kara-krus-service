import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { initUserSession } from "./init-user-session";
import { socketOptions } from "./stubs/test-data";

export const boostedOddsTest = () => {
    describe("boosted odds", () => {
        let driver;
        beforeAll(async () => {
            driver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await driver.handleSignedInEvent();
        });

        afterAll(() => {
            driver.close();
        });

        it("should return boosted odds", async () => {
            // Arrange
            const expectedOdds = {
                red: 1.98,
                white: 1.98,
                red3: 7.84,
                white3: 7.84,
                red2: 2.61,
                red1: 2.61,
            };
            driver.sendInGameEvent();

            // Act
            const { gameConfigs } = await driver.handleGameEvent((inGameData) => inGameData.gameConfigs);

            console.log(gameConfigs);

            // Assert
            expect(gameConfigs.odds).toStrictEqual(expectedOdds);
        });

        it("should return original odds", async () => {
            // Arrange
            const expectedOdds = {
                red: 1.96,
                white: 1.96,
                red3: 7.84,
                white3: 7.84,
                red2: 2.61,
                red1: 2.61,
            };

            driver.sendInGameEvent();

            // Act
            const { gameConfigs } = await driver.handleGameEvent((inGameData) => inGameData.gameConfigs);

            // Assert
            expect(gameConfigs.originalOdds).toStrictEqual(expectedOdds);
        });
    });
};
