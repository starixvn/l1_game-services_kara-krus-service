import awilix from "awilix";
import { Table } from "sc-game-base";
import { SmartBotContainerRegistry } from "sc-smart-bot";

import PlaceBetConsumer from "./consumers/sedie-place-bet-consumer";
import SeDieSettleGameRoundConsumer from "./consumers/sedie-settle-game-round-consumer";
import { SedieBot, SedieGameCron, SedieProcessBetQueue } from "./crons";
import {
    SedieBets,
    SeDieRounds,
    SeDieSmartBotBetActions,
    SeDieSmartBotBetLogs,
    SeDieSmartBotPatterns,
    SedieTmpBets,
    SedieResults,
} from "./models";
import { SedieSocketRouter } from "./routers";
import { BetEventMetric } from "./metrics";

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
        });

        this.container.register(new SmartBotContainerRegistry().register());
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SeDieSettleGameRoundConsumer).singleton().proxy(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            betEventMetric: asClass(BetEventMetric).singleton().proxy(),
        });

        this.container.register({
            bot: asClass(SedieBot).singleton(),
            gameCron: asClass(SedieGameCron).singleton().proxy(),
            processBetQueue: asClass(SedieProcessBetQueue).singleton().proxy(),
        });
    }

    registerRouters() {
        super.registerRouters();
        this.container.register({
            socketRouter: asClass(SedieSocketRouter).proxy(),
        });
    }
}
