import { startService } from "./_stubs/test-jobs";
const path = require("path");
import { getProcessId, buildConfigs, initUserSession, checkConnect } from "./_stubs/helper";
import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptionsFunc } from "./_stubs/test-data";

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("signin", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    it("should receive signed in response", (done) => {
        //Arrange & Act
        const normalUserClientDriver = new GameClientDriver(socketOptions, initUserSession(normalUser));

        //Assert
        normalUserClientDriver.handleSignedInEvent(() => {
            normalUserClientDriver.close();
            done();
        });
    });
});
