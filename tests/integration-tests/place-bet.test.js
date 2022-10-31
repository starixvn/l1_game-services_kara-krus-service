import { GameClientDriver, normalUser, eventTypes } from "sc-game-service-integration-utils";
import { startService } from "./_stubs/test-jobs";
import { getProcessId, buildConfigs, initUserSession, checkConnect } from "./_stubs/helper";
import { socketOptionsFunc } from "./_stubs/test-data";
const path = require("path");

const scriptName = path.basename(__filename);
const processId = getProcessId(scriptName);
startService(processId);

const appConfigs = buildConfigs(processId);
const socketOptions = socketOptionsFunc(appConfigs.hostingPort);

describe("place bet", () => {
    it("check connect", (done) => {
        checkConnect(processId, done);
    });

    describe("when place bet in placing bet time", () => {
        it("should return own bet data", async (done) => {
            // Arrange
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await client.handleSignedInEvent();
            client.sendInGameEvent();

            await client.handleGameEvent((gameData) => gameData.spb);

            setTimeout(async () => {
                client.emit(eventTypes.bet, { betChoice: "even", amount: 100 });

                // Act
                const data = await client.handleGameEvent((data) => data.endBet);

                // Assert
                expect(data.betChoice).toBe("even");
                expect(data.endBet).toBe(100);
                expect(data.ownBets).toEqual({ even: 100 });
                expect(data.ownChip).toEqual({ betChoice: "even", amount: 100 });

                client.close();
                done();
            }, 1000);
        });
    });

    describe("when place bet NOT in placing bet time", () => {
        it("should return invalid", async (done) => {
            // Arrange
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await client.handleSignedInEvent();
            client.sendInGameEvent();
            await client.handleGameEvent((gameData) => gameData.epb);

            client.emit(eventTypes.bet, { betChoice: "even", amount: 100 });

            // Act
            const data = await client.handleGameEvent((data) => data.endBet);

            // Assert
            expect(data.endBet).toBe(-1);
            client.close();
            done();
        });
    });
});
