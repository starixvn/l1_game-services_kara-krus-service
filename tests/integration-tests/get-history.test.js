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
                    krus: 0,
                    kara: 100,
                    head1: 0,
                    head2: 0,
                    head3: 0,
                    tail3: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        kara: 1.96,
                        krus: 1.96,
                        head3: 7.84,
                        tail3: 7.84,
                        head2: 2.61,
                        head1: 2.61,
                    },
                    rate: 1,
                    betLogDetails: [],
                    roundId: 1190119,
                    totalAmount: 0,
                },
                {
                    krus: 0,
                    kara: 100,
                    head1: 0,
                    head2: 0,
                    head3: 0,
                    tail3: 0,
                    betwin: 0,
                    betwin: 0,
                    freeBet: false,
                    phien: 1190119,
                    name: "NormalUser",
                    odds: {
                        kara: 1.96,
                        krus: 1.96,
                        head3: 7.84,
                        tail3: 7.84,
                        head2: 2.61,
                        head1: 2.61,
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
