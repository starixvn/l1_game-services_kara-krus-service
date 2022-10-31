import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import gameSettings from "./_stubs/game-settings";
import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, initUserSession, checkConnect } from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("when settle", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    it("should return settled status data", async (done) => {
        // Arrange
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await client.handleSignedInEvent();
        client.sendInGameEvent();
        await client.handleGameEvent((data) => data.spb);

        setTimeout(async () => {
            client.emit(eventTypes.bet, { betChoice: "even", amount: 100 });

            // Act
            const data = await client.handleGameEvent((data) => data.status);

            // Assert
            expect(data.status.bet).toBeGreaterThan(0);
            client.close();
            done();
        }, 1000);
    });

    it("should return settled finish data and hashResult with rawValue", async () => {
        // Arrange
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await client.handleSignedInEvent();
        client.sendInGameEvent();

        // Act
        const data = await client.handleGameEvent((data) => data.finish && data.resultHash);

        // Assert
        expect(data.resultHash.rawValue).not.toBeEmpty();

        client.close();
    });

    it("should return resultHash at start placingBet time", async () => {
        // Arrange
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
        await client.handleGameEvent((data) => data.snr);
        let startTime = new Date();

        // Act
        const data = await client.handleGameEvent((data) => data.resultHash);

        // Assert
        let endTime = new Date();
        expect(data.resultHash.hashValue).not.toBeEmpty();
        expect(Math.round((endTime - startTime) / 1000)).toEqual(
            gameSettings.durations.wholeRound - gameSettings.durations.placingBets - 1
        );

        client.close();
    });
});
