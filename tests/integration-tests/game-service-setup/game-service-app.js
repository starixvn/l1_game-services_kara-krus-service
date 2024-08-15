import { Core, Table } from "sc-game-base";
import { initAPIStub, stubUserService } from "sc-game-service-integration-utils";

import appConfigs from "../../../src//app-configs.IGT";
import constants from "../../../src/constants";
import gameSettings from "../../../src/game-settings";
import { generateRawResultForHash, generateResult, getSettlementResult } from "../../../src/helpers/result-helper";
import SeDie3ContainerRegistry from "../../../src/sedie3-container-registry";
import SeDie3Definition from "../../../src/sedie3-definition";

export const run = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    stubUserService(appConfigs);

    const definition = new SeDie3Definition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDie3ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
