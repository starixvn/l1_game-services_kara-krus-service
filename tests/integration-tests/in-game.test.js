import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const ingameTest = () => {
    describe("when user joins game", () => {
        it("should return game configs", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.gameConfigs) {
                    expect(inGameData.gameConfigs.minBet).toEqual(1);
                    expect(inGameData.gameConfigs.maxBet).toEqual(3000);
                    expect(inGameData.gameConfigs.maxBetPerChoices).toStrictEqual({
                        even: 3000,
                        odd: 3000,
                        red2: 3000,
                        red3: 3000,
                        red4: 1000,
                        white3: 3000,
                        white4: 1000,
                    });
                    expect(inGameData.gameConfigs.odds).toStrictEqual({
                        even: 1.97,
                        odd: 1.97,
                        red2: 2.5,
                        red3: 3.76,
                        red4: 14.5,
                        white3: 3.76,
                        white4: 14.5,
                    });

                    normalUserClientDriver.close();
                    done();
                }
            });
        });

        it("should return user info", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.user?.UID) {
                    expect(inGameData.user).toStrictEqual({
                        UID: 1,
                        avatarId: 1,
                        currency: "$US",
                        name: "NormalUser",
                        rate: 1,
                        red: 25000,
                    });

                    normalUserClientDriver.close();
                    done();
                }
            });
        });

        it("should return round history", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.handleInGameEvent((inGameData) => {
                if (inGameData?.roundHistory) {
                    expect(inGameData.roundHistory.length).toBeGreaterThan(0);

                    normalUserClientDriver.close();
                    done();
                }
            });
        });
    });
};
