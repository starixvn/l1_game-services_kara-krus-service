import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const getHistoryTest = () => {
    describe("when get history", () => {
        it("should return history", (done) => {
            // Arrange
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
            client.handleSignedInEvent(() => {
                client.sendInGameEvent();
            });
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
                    currency: "$US",
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
                    partnerId: "dummy-partner-id",
                    rate: 1,
                    betLogDetails: [],
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
                    currency: "$US",
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
                    partnerId: "dummy-partner-id",
                    rate: 1,
                    betLogDetails: [],
                },
            ];

            client.on(socketOptions.gameName, (inGameData) => {
                if (inGameData.remainingTime) {
                    setTimeout(() => {
                        // Act
                        client.sendGetHistoryEvent();

                        // Assert
                        client.on(socketOptions.gameName, (data) => {
                            if (data.history) {
                                const actualBetLogs = data.history.betLogs.map((betLog) => {
                                    delete betLog.result;
                                    delete betLog.settlementResult;
                                    return betLog;
                                });

                                expect(actualBetLogs).toEqual(expectedData);
                                expect(data.history.total).toBeGreaterThan(0);
                                expect(data.history.page).toBe(1);
                                expect(data.history.pageSize).toBe(8);

                                client.close();
                                done();
                            }
                        });
                    }, 1000);
                }
            });
        });
    });
};
