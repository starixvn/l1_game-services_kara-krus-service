import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

xdescribe("signin", () => {
    it("should receive signed in response", (done) => {
        setTimeout(() => {
            console.log("connect");
            // Arrange & Act
            const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

            // Assert
            normalUserClientDriver.handleSignedInEvent(() => {
                console.log("ok");
                normalUserClientDriver.close();
                done();
            });
        }, 10000);
    });
});
