import { Table } from "sc-game-base";
import appConfigs from "./app-configs.js";
import Startup from "./startup.js";
import gameData from "./game-data.js";
import gameSettings from "./game-settings.js";
import { generateResult, getSettlementResult } from "./event-consumers/result-helper.js";
import SedieRounds from "./models/sedie-rounds.js";
import SedieBetLogs from "./models/sedie-betlogs.js";
import SedieTmpBetLogs from "./models/sedie-temp-betlogs.js";

export class SedieApp extends Table.TableGameApp {}

const run = async () => {
    const definition = new Table.TableGameDefinition(
        gameSettings,
        generateResult,
        getSettlementResult,
        SedieRounds,
        SedieBetLogs,
        SedieTmpBetLogs
    );
    const gameCron = new Table.TableGameCron(definition, gameData);
    const startup = new Startup(appConfigs, definition, gameData, gameCron);
    const app = new SedieApp(appConfigs, definition, gameData, startup);
    await app.run();
};

run();
