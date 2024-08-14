import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "../../src/game-settings";

export const settleTest = () => {
    describe("when settle", () => {
        let driver;
        beforeAll(async () => {
            driver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await driver.handleSignedInEvent();
        });

        afterAll(() => {
            driver.close();
        });

        const getTimeOutToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 4;
            } else if (remainingTime > durations.placingBets) {
                timeout = durations.wholeRound - durations.placingBets + 4;
            }

            return timeout;
        };

        it("should return settled status data", async () => {
            // Arrange
            const amount = 100;
            driver.sendInGameEvent();
            const { remainingTime } = await driver.handleGameEvent((inGameData) => inGameData.remainingTime);

            setTimeout(() => {
                driver.sendBetEvent("red", amount);
            }, getTimeOutToBet(remainingTime, gameSettings.durations) * 1000);

            // Act
            const result = await driver.handleGameEvent((data) => data.status);

            // Assert
            expect(result.status.bet).toBeGreaterThan(0);
        });

        it("should return settled finish data and hashResult with rawValue", async () => {
            // Arrange
            driver.sendInGameEvent();
            await driver.handleGameEvent((inGameData) => inGameData.remainingTime);

            // Act
            const result = await driver.handleGameEvent((data) => data.resultHash);

            // Assert
            expect(result.resultHash.rawValue).not.toBeNull();
        });
    });
};
