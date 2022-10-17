import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, initUserSession, checkConnect } from "./_stubs/helper";
import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const overrideConfigs = { enabledBoostedOdds: true };
const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId, overrideConfigs);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("boosted odds", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

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
            if (data.odds && data.odds.values && data.odds.values.even === 1.98) {
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
