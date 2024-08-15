import awilix from "awilix";
import { Table } from "sc-game-base";
import { SmartBotContainerRegistry } from "sc-smart-bot";

import GameResultServiceConsumer from "./consumers/game-result-service-consumer";
import PlaceBetConsumer from "./consumers/sedie-place-bet-consumer";
import SeDieSettleGameRoundConsumer from "./consumers/sedie-settle-game-round-consumer";
import { SedieBot, SedieGameCron } from "./crons";
import {
    SedieBetLogs,
    SedieBets,
    SedieResults,
    SeDieRounds,
    SeDieSmartBotBetActions,
    SeDieSmartBotBetLogs,
    SeDieSmartBotPatterns,
    SedieTmpBets,
} from "./models";
import SocketRouter from "./routers/socket-router";

const { asClass, asValue } = awilix;

export default class SeDieContainerRegistry extends Table.TableContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(SeDieRounds),
            betsRepository: asValue(SedieBets),
            tempBetsRepository: asValue(SedieTmpBets),
            betPatternRepository: asValue(SeDieSmartBotPatterns),
            betActionRepository: asValue(SeDieSmartBotBetActions),
            smartBotBetLogsRepository: asValue(SeDieSmartBotBetLogs),
            resultsRepository: asValue(SedieResults),
            betLogsRepository: asValue(SedieBetLogs),
        });

        this.container.register(new SmartBotContainerRegistry().register());
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SeDieSettleGameRoundConsumer).singleton().proxy(),
            gameResultServiceConsumer: asClass(GameResultServiceConsumer).proxy(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            bot: asClass(SedieBot).singleton(),
            gameCron: asClass(SedieGameCron).singleton().proxy(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            socketRouter: asClass(SocketRouter).proxy(),
        });
    }
}
