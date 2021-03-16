import awilix from "awilix";
import { Table } from "sc-game-base";

import PlaceBetConsumer from "./consumers/sedie-place-bet-consumer";
import { SedieBot, SedieGameCron } from "./crons";
import {
    SedieBets,
    SeDieRounds,
    SeDieSmartBotBetActions,
    SeDieSmartBotBetLogs,
    SeDieSmartBotPatterns,
    SedieTmpBets,
} from "./models";

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
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            bot: asClass(SedieBot).singleton(),
            gameCron: asClass(SedieGameCron).singleton().proxy(),
        });
    }
}
