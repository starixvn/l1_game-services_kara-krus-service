import appConfigs from "./app-configs";
import gameSettings from "./game-settings";
import { startTrace } from "sc-instrument";

startTrace(appConfigs.otel?.enabled, appConfigs.otel?.endpoint, appConfigs.otel?.system, appConfigs.sentry.env, gameSettings.name);

import { Core, Table } from "sc-game-base";

import constants from "./constants";
import { generateResult, getSettlementResult, generateRawResultForHash } from "./helpers/result-helper";
import KaraKrusContainerRegistry from "./kara-krus-container-registry";
import KaraKrusDefinition from "./kara-krus-definition";

const run = async () => {
    const definition = new KaraKrusDefinition(gameSettings, generateResult, getSettlementResult, generateRawResultForHash);
    const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
    const container = new KaraKrusContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("KaraKrus", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
