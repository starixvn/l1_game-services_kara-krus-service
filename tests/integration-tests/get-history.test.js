import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const getHistoryTest = () => {
    describe("when get history", () => {
        let driver;

        beforeAll(async () => {
            driver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await driver.handleSignedInEvent();
            driver.sendInGameEvent();
            await driver.handleGameEvent((inGameData) => inGameData.remainingTime);
        });

        afterAll(() => {
            driver.close();
        });

        it("should return history", async () => {
            // Arrange
            const expectedData = [
                {
                    odd: 0,
                    even: 100,
                    red2: 0,
                    red3: 0,
                    red4: 0,
                    white3: 0,
                    white4: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        even: 1.97,
                        odd: 1.97,
                        red3: 3.76,
                        white3: 3.76,
                        red4: 14.5,
                        white4: 14.5,
                        red2: 2.5,
                    },
                    rate: 1,
                    betLogDetails: [],
                    roundId: 1190119,
                },
                {
                    odd: 0,
                    even: 100,
                    red2: 0,
                    red3: 0,
                    red4: 0,
                    white3: 0,
                    white4: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        even: 1.97,
                        odd: 1.97,
                        red3: 3.76,
                        white3: 3.76,
                        red4: 14.5,
                        white4: 14.5,
                        red2: 2.5,
                    },
                    rate: 1,
                    betLogDetails: [],
                    roundId: 1190119,
                },
            ];

            // Act
            driver.sendGetHistoryEvent();
            const result = await driver.handleGameEvent((historyData) => historyData.history);

            // Assert
            const actualBetLogs = result.history.betLogs.map((betLog) => {
                delete betLog.result;
                delete betLog.settlementResult;
                return betLog;
            });

            expect(actualBetLogs).toEqual(expectedData);
            expect(result.history.total).toBeGreaterThan(0);
            expect(result.history.page).toBe(1);
            expect(result.history.pageSize).toBe(8);
        });
    });
};
