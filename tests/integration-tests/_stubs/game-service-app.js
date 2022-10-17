import { Core, Table } from "sc-game-base";
import { initAPIStub, stubUserService } from "sc-game-service-integration-utils";

import constants from "../../../src/constants";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult, generateRawResultForHash } from "../../../src/helpers/result-helper";
import SeDieContainerRegistry from "../../../src/sedie-container-registry";
import SeDieDefinition from "../../../src/sedie-definition";
import { buildConfigs } from "./helper";

export const run = async (processId, overrideConfigs) => {
    const appConfigs = Object.assign({}, buildConfigs(processId), overrideConfigs);

    initAPIStub(appConfigs.apiSettings.apiUrl);
    stubUserService(appConfigs);

    const definition = new SeDieDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDieContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

const processId = process.argv[3];
const overrideConfigs = JSON.parse(process.argv[4]);
run(processId, overrideConfigs);
