import { Core, Table } from "sc-game-base";

import appConfigs from "../../src/app-configs";
import constants from "../../src/constants";
import gameSettings from "../../src/game-settings";
import { generateResult, getSettlementResult } from "../../src/helpers/result-helper";
import { ContainerRegistry } from "./container-registry";

const run = async () => {
    const definition = new Table.TableGameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp(container);

    await app.run();
};

run();
