import { Core, Table } from "sc-game-base";

import appConfigs from "./app-configs";
import constants from "./constants";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult, generateRawResultForMd5 } from "./helpers/result-helper";
import SeDieContainerRegistry from "./sedie-container-registry";

const run = async () => {
    const definition = new Table.TableGameDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForMd5);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDieContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
