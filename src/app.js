import { Table } from "sc-game-base";
import { TableGameSmartBot } from "sc-game-base/src/table";

import appConfigs from "./app-configs";
import constants from "./constants";
import { SedieBot, SedieGameCron } from "./cron";
import gameSettings from "./game-settings";
import { generateResult, getSettlementResult } from "./helpers/result-helper";
import { SedieBets, SedieTmpBets } from "./models/sedie-bets";
import SedieRounds from "./models/sedie-rounds";
import SedieSmartBotBetLogs from "./models/sedie-smartbot-bet-logs";
import SedieSmartBotBets from "./models/sedie-smartbot-bets";
import SedieSmartBotPatterns from "./models/sedie-smartbot-patterns";
import Startup from "./startup";

export class SedieApp extends Table.TableGameApp {}

const run = async () => {
    const gameData = new Table.TableGameData(constants.roundDuration, constants.resetTotalBets);

    const definition = new Table.TableGameDefinition(
        gameSettings,
        generateResult,
        getSettlementResult,
        SedieRounds,
        SedieBets,
        SedieTmpBets,
        null,
        {
            smartPatternRepository: SedieSmartBotPatterns,
            betPatternRepository: SedieSmartBotBets,
            smartBotBetLogRepository: SedieSmartBotBetLogs,
        }
    );

    const gameCron = new SedieGameCron(
        definition,
        gameData,
        new SedieBot(definition, gameData, null, new TableGameSmartBot(definition, gameData, null, definition.choices))
    );
    const startup = new Startup(appConfigs, definition, gameData, gameCron);
    const app = new SedieApp(appConfigs, definition, gameData, startup);

    await app.run();
};

run();
