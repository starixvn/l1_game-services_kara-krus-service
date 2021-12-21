import { Core, Table } from "sc-game-base";

import appConfigs from "./app-configs";
import constants from "./constants";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult } from "./helpers/result-helper";
import SeDieContainerRegistry from "./sedie-container-registry";
import nock from "nock";

const run = async () => {
    nock("http://localhost:9000")
        .post("/Member/GetBetLimit")
        .reply(200, {
            timeStamp: "2020/03/19 15:31:00.010 +00:00",
            result: {
                seq: "d8382c1d-6ce0-433d-9233-e7358b10a70b",
                errorCode: 0,
                errorDescription: "Success",
                minBet: 0.01,
                maxBet: 3000,
            },
        });
    const definition = new Table.TableGameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDieContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
