import { exec } from "child_process";
import {
    endGameErrorUser,
    errorUser,
    GameClientDriver,
    internalServerErrorUser,
    normalUser,
} from "sc-game-service-integration-utils";
import kill from "tree-kill";

import { currencyData, socketOptions } from "./stubs/test-data";

const JEST_ASSERT_WAITING_RESPONSE_TIMEOUT = 70000;

exec("npm run test-:-integration-:-setup-test-data", function (err, stdout) {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});

const processStartService = exec("nohup npm run test-:-integration-:-start-service &", function (err, stdout) {
    if (err) {
        console.error(err);
        return;
    }
});

processStartService.stdout.pipe(process.stdout);
processStartService.stderr.pipe(process.stderr);

let normalUserClientDriver;
let errorUserClientDriver;
let internalServerErrorUserClientDriver;
let endGameErrorUserClientDriver;

beforeAll(async (done) => {
    setTimeout(() => {
        // set timeout for jest, waiting for socket response
        jest.setTimeout(JEST_ASSERT_WAITING_RESPONSE_TIMEOUT);
        normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

        errorUserClientDriver = new GameClientDriver(socketOptions, initUserSession(errorUser));
        errorUserClientDriver.handleSignedInEvent(() => {
            errorUserClientDriver.sendInGameEvent();
        });

        internalServerErrorUserClientDriver = new GameClientDriver(socketOptions, initUserSession(internalServerErrorUser));
        internalServerErrorUserClientDriver.handleSignedInEvent(() => {
            internalServerErrorUserClientDriver.sendInGameEvent();
        });

        endGameErrorUserClientDriver = new GameClientDriver(socketOptions, initUserSession(endGameErrorUser));
        endGameErrorUserClientDriver.handleSignedInEvent(() => {
            endGameErrorUserClientDriver.sendInGameEvent();
        });

        done();
    }, 20000);
}, 21000);

afterAll((done) => {
    normalUserClientDriver.close();
    errorUserClientDriver.close();
    internalServerErrorUserClientDriver.close();
    endGameErrorUserClientDriver.close();

    kill(processStartService.pid, () => {
        done();
    });
}, 10000);

describe("SeDie Service", () => {
    describe("when sign in successful", () => {
        it("should receive signed in response", (done) => {
            // Assert
            normalUserClientDriver.handleSignedInEvent(() => {
                done();
            });
        });
    });

    describe("when user joins game", () => {
        // Arrange
        const expectedGameConfigs = {
            minBet: 1,
            maxBet: 3000,
            maxBetPerChoices: {
                even: 3000,
                odd: 3000,
                red2: 3000,
                red3: 3000,
                red4: 1000,
                white3: 3000,
                white4: 1000,
            },
            odds: {
                even: 1.97,
                odd: 1.97,
                red2: 2.5,
                red3: 3.76,
                red4: 14.5,
                white3: 3.76,
                white4: 14.5,
            },
        };
        const expectedUser = {
            UID: 1,
            avatarId: 1,
            currency: "$US",
            name: "NormalUser",
            rate: 1,
            red: 25000,
        };

        const expectedRoundHistory = [
            {
                roundId: 1190117,
                result: { red1: true, red2: false, red3: false, red4: true },
                settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
            },
            {
                roundId: 1190118,
                result: { red1: false, red2: true, red3: true, red4: false },
                settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
            },
            {
                roundId: 1190119,
                result: { red1: false, red2: false, red3: true, red4: true },
                settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
            },
        ];

        beforeAll((done) => {
            normalUserClientDriver.sendInGameEvent();
            done();
        });

        it("should return game configuration (odds, min bet, max bet)", (done) => {
            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.gameConfigs) {
                    if (inGameData.gameConfigs) {
                        expect(inGameData.gameConfigs.minBet).toEqual(expectedGameConfigs.minBet);
                        expect(inGameData.gameConfigs.maxBet).toEqual(expectedGameConfigs.maxBet);
                        expect(inGameData.gameConfigs.maxBetPerChoices).toStrictEqual(expectedGameConfigs.maxBetPerChoices);
                        expect(inGameData.gameConfigs.odds).toStrictEqual(expectedGameConfigs.odds);

                        done();
                    }
                }
            });
        });

        it("should return user information", () => {
            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.user?.UID) {
                    expect(inGameData.user).toStrictEqual(expectedUser);

                    done();
                }
            });
        });

        it("should return old round history", () => {
            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.roundHistory) {
                    expect(inGameData.roundHistory).toStrictEqual(expectedRoundHistory);
                    done();
                }
            });
        });
    });

    describe("When user get bet history", () => {
        it("should return bet history", (done) => {
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

            // Act
            normalUserClientDriver.sendGetHistoryEvent();
            // Assert
            normalUserClientDriver.handleGetHistoryEvent((betHistoryData) => {
                if (betHistoryData?.history) {
                    const actualBetLogs = betHistoryData.history.betLogs.map((betLog) => {
                        delete betLog.result;
                        delete betLog.settlementResult;
                        return betLog;
                    });

                    expect(actualBetLogs).toEqual(expectedData);
                    done();
                }
            });
        });
    });

    describe("User place bet", () => {
        // Arrange
        const betChoice = "even";
        const amount = 100;

        describe("when place bet successful", () => {
            beforeAll(async (done) => {
                // Act
                await normalUserClientDriver.sendBetEvent(betChoice, amount);
                done();
            });

            it("should return current user ticket result", (done) => {
                const expectedEndBetResponse = {
                    ownBets: { even: 100 },
                    endBet: 100,
                    betChoice: "even",
                    freeBet: false,
                    user: { maxBet: 2000, minBet: 1, red: 24250, scoins: 0 },
                    ownChip: { betChoice: "even", amount: 100 },
                };

                // Assert
                normalUserClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet) {
                        expect(endBetData).toStrictEqual(expectedEndBetResponse);
                        done();
                    }
                });
            });

            it("should return ticket status when end game", (done) => {
                // Assert
                normalUserClientDriver.handleEndBetEvent((endGameResult) => {
                    if (endGameResult.status) {
                        done();
                    }
                });
            });
        });

        describe("when get error response from api", () => {
            beforeAll(async (done) => {
                // Act
                await errorUserClientDriver.sendBetEvent(betChoice, amount);
                done();
            });

            it("should return api error to client", (done) => {
                // Assert
                errorUserClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet === -1) {
                        expect(endBetData.betChoice).toEqual("even");
                        expect(endBetData.apiError.errorCode).toEqual(3002);
                        expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                        done();
                    }
                });
            });
        });

        describe("when API internal server error", () => {
            beforeAll(async (done) => {
                // Act
                await internalServerErrorUserClientDriver.sendBetEvent(betChoice, amount);
                done();
            });

            it("should return api error to client", (done) => {
                // Assert
                internalServerErrorUserClientDriver.handleEndBetEvent((endBetData) => {
                    if (endBetData.endBet === -1) {
                        expect(endBetData.betChoice).toEqual("even");
                        expect(endBetData.apiError.errorCode).toEqual("SB1900");
                        expect(endBetData.apiError.isPlaceBetFailed).toEqual(true);
                        done();
                    }
                });
            });
        });
    });
});

const initUserSession = (user) => {
    return {
        session: `${user.memberId}-session-id`,
        ss: `${user.memberId}-session-id`,
        currency: currencyData.name,
        username: `${user.memberId}_${user.memberName}`,
        browserUserAgent: "browser-user-agent",
    };
};
