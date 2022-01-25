import { Core, Table } from "sc-game-base";
import { initAPIStub } from "sc-game-service-integration-utils";

import appConfigs from "../../../src/app-configs";
import constants from "../../../src/constants";
import gameSettings from "../../../src/game-settings";
import { generateResult, getSettlementResult } from "../../../src/helpers/result-helper";
import SeDieContainerRegistry from "../../../src/sedie-container-registry";

export const runService = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    const definition = new Table.TableGameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDieContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
    return app.connection;
};
