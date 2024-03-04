import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptions } from "./stubs/test-data";
import { initUserSession } from "./init-user-session";

export const signinTest = () => {
    let driver;
    beforeAll(async () => {
        driver = new GameClientDriver(socketOptions, initUserSession(normalUser));
    });

    afterAll(() => {
        driver.close();
    });

    describe("signin", () => {
        it("should receive signed in response", async () => {
            // Assert
            await driver.handleSignedInEvent();
        });
    });
};
