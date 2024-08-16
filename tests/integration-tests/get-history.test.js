import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { initUserSession } from "./init-user-session";
import { socketOptions } from "./stubs/test-data";

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
                    white: 0,
                    red: 100,
                    red1: 0,
                    red2: 0,
                    red3: 0,
                    white3: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        red: 1.96,
                        white: 1.96,
                        red3: 7.84,
                        white3: 7.84,
                        red2: 2.61,
                        red1: 2.61,
                    },
                    rate: 1,
                    betLogDetails: [],
                    roundId: 1190119,
                    totalAmount: 0,
                },
                {
                    white: 0,
                    red: 100,
                    red1: 0,
                    red2: 0,
                    red3: 0,
                    white3: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        red: 1.96,
                        white: 1.96,
                        red3: 7.84,
                        white3: 7.84,
                        red2: 2.61,
                        red1: 2.61,
                    },
                    rate: 1,
                    betLogDetails: [],
                    roundId: 1190119,
                    totalAmount: 0,
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
