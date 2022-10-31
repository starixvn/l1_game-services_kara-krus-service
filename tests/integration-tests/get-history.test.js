import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, initUserSession, checkConnect } from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("when get history", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    it("should return history", async () => {
        // Arrange
        const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
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
                rate: 1,
                betLogDetails: [],
                roundId: 1190119,
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
                rate: 1,
                betLogDetails: [],
                roundId: 1190119,
            },
        ];

        await client.handleSignedInEvent();
        client.sendInGameEvent();
        await client.handleGameEvent((data) => data.remainingTime);

        // Act
        client.sendGetHistoryEvent();
        const data = await client.handleGameEvent((data) => data.history);

        // Assert
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
    });
});
