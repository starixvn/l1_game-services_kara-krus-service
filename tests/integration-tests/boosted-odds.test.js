import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

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
                even: 1.98,
                odd: 1.98,
                red3: 3.76,
                white3: 3.76,
                red4: 14.5,
                white4: 14.5,
                red2: 2.5,
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
                even: 1.97,
                odd: 1.97,
                red3: 3.76,
                white3: 3.76,
                red4: 14.5,
                white4: 14.5,
                red2: 2.5,
            };

            driver.sendInGameEvent();

            // Act
            const { gameConfigs } = await driver.handleGameEvent((inGameData) => inGameData.gameConfigs);

            // Assert
            expect(gameConfigs.originalOdds).toStrictEqual(expectedOdds);
        });
    });
};
