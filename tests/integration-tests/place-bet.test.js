import { GameClientDriver, normalUser, eventTypes, errorUser, internalServerErrorUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";
import gameSettings from "../../src/game-settings";

export const placeBetTest = () => {
    describe("place bet", () => {
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

        const getTimeOutToBetInvalid = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime >= durations.lockingBet && remainingTime <= durations.placingBets) {
                timeout = remainingTime - durations.lockingBet + 1;
            }

            return timeout;
        };

        describe("when place bet in placing bet time", () => {
            it("should return own bet data", async () => {
                // Arrange
                driver.sendInGameEvent();
                const { remainingTime } = await driver.handleGameEvent((inGameData) => inGameData.remainingTime);

                // Act
                setTimeout(() => {
                    driver.sendBetEvent("even", 100);
                }, getTimeOutToBet(remainingTime, gameSettings.durations) * 1000);

                const result = await driver.handleGameEvent((data) => data.endBet);

                // Assert
                expect(result.betChoice).toBe("even");
                expect(result.endBet).toBe(100);
                expect(result.ownBets).toEqual({ even: 100 });
                expect(result.ownChip).toEqual({ betChoice: "even", amount: 100 });
            });
        });

        describe("when place bet NOT in placing bet time", () => {
            it("should return invalid", async () => {
                // Arrange
                driver.sendInGameEvent();
                const { remainingTime } = await driver.handleGameEvent((inGameData) => inGameData.remainingTime);

                // Act
                setTimeout(() => {
                    driver.sendBetEvent("even", 100);
                }, getTimeOutToBetInvalid(remainingTime, gameSettings.durations) * 1000);

                const result = await driver.handleGameEvent((data) => data.endBet);

                // Assert
                expect(result.endBet).toBe(-1);
            });
        });
    });
};
