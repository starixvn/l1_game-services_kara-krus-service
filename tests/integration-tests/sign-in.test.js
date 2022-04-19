import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const signinTest = () => {
    describe("signin", () => {
        it("should receive signed in response", (done) => {
            // Arrange & Act
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            console.log(normalUserClientDriver);
            // Assert
            normalUserClientDriver.handleSignedInEvent(() => {
                normalUserClientDriver.close();
                done();
            });
        });
    });
};
