import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const boostedOddsTest = () => {
    describe("boosted odds", () => {
        it("should return boosted odds", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const expectedOdds = {
                even: 1.98,
                odd: 1.98,
                red3: 3.76,
                white3: 3.76,
                red4: 14.5,
                white4: 14.5,
                red2: 2.5,
            };

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.on(socketOptions.gameName, (data) => {
                if (data.odds) {
                    expect(data.odds.values).toEqual(expectedOdds);
                    normalUserClientDriver.close();
                    done();
                }
            });
        });

        it("should return original odds", (done) => {
            // Arrange
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));
            const expectedOdds = {
                even: 1.97,
                odd: 1.97,
                red3: 3.76,
                white3: 3.76,
                red4: 14.5,
                white4: 14.5,
                red2: 2.5,
            };

            // Act
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.sendInGameEvent();
            });

            // Assert
            normalUserClientDriver.on(socketOptions.gameName, (data) => {
                if (data.odds) {
                    expect(data.odds.values).toEqual(expectedOdds);
                    normalUserClientDriver.close();
                    done();
                }
            });
        });
    });
};
