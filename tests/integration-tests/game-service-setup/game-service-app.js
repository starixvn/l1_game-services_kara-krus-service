import { Core, Table } from "sc-game-base";
import { initAPIStub } from "sc-game-service-integration-utils";

import appConfigs from "../../../src/app-configs";
import constants from "../../../src/constants";
import gameSettings from "../../../src/game-settings";
import { generateResult, getSettlementResult, generateRawResultForHash } from "../../../src/helpers/result-helper";
import SeDieContainerRegistry from "../../../src/sedie-container-registry";
import SeDieDefinition from "../../../src/sedie-definition";

export const run = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    const definition = new SeDieDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDieContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
