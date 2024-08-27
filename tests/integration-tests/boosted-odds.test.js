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
                kara: 1.98,
                krus: 1.98,
                head3: 7.84,
                tail3: 7.84,
                head2: 2.61,
                head1: 2.61,
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
                kara: 1.96,
                krus: 1.96,
                head3: 7.84,
                tail3: 7.84,
                head2: 2.61,
                head1: 2.61,
            };

            driver.sendInGameEvent();

            // Act
            const { gameConfigs } = await driver.handleGameEvent((inGameData) => inGameData.gameConfigs);

            // Assert
            expect(gameConfigs.originalOdds).toStrictEqual(expectedOdds);
        });
    });
};
