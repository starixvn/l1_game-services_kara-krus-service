import { Table } from "sc-game-base";

import appConfigs from "./app-configs";
import { generateResult, getSettlementResult } from "./event-consumers/result-helper";
import gameData from "./game-data";
import gameSettings from "./game-settings";
import SedieBets from "./models/sedie-bets";
import SedieRounds from "./models/sedie-rounds";
import SedieTmpBets from "./models/sedie-temp-bets";
import Startup from "./startup";
import SedieBot from "./cron/sedie-bot";

export class SedieApp extends Table.TableGameApp {}

const run = async () => {
    const definition = new Table.TableGameDefinition(
        gameSettings,
        generateResult,
        getSettlementResult,
        SedieRounds,
        SedieBets,
        SedieTmpBets,
        null,
        new SedieBot(
            gameSettings.name,
            gameSettings.choices,
            gameSettings.durations,
            gameSettings.name.toLowerCase(),
            SedieTmpBets,
            gameData
        )
    );
    const gameCron = new Table.TableGameCron(definition, gameData);
    const startup = new Startup(appConfigs, definition, gameData, gameCron);
    const app = new SedieApp(appConfigs, definition, gameData, startup);
    await app.run();
};

run();
