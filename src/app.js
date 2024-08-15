import { startTrace } from "sc-instrument";
import appConfigs from "./app-configs";
import gameSettings from "./game-settings";

startTrace(appConfigs.otel?.enabled, appConfigs.otel?.endpoint, appConfigs.otel?.system, appConfigs.sentry.env, gameSettings.name);

import { Core, Table } from "sc-game-base";

import constants from "./constants";
import { generateRawResultForHash, generateResult, getSettlementResult } from "./helpers/result-helper";
import SeDie3ContainerRegistry from "./sedie3-container-registry";
import SeDie3Definition from "./sedie3-definition";

const run = async () => {
    const definition = new SeDie3Definition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new SeDie3ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("SeDie", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
