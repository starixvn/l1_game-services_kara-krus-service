import { Core, Table } from "sc-game-base";
import { initAPIStub, stubUserService } from "sc-game-service-integration-utils";

import appConfigs from "../../../src//app-configs.IGT";
import constants from "../../../src/constants";
import gameSettings from "../../../src/game-settings";
import { generateResult, getSettlementResult, generateRawResultForHash } from "../../../src/helpers/result-helper";
import KaraKrusContainerRegistry from "../../../src/kara-krus-container-registry";
import KaraKrusDefinition from "../../../src/kara-krus-definition";

export const run = async () => {
    initAPIStub(appConfigs.apiSettings.apiUrl);
    stubUserService(appConfigs);

    const definition = new KaraKrusDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new KaraKrusContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("KaraKrus", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
