import awilix from "awilix";
import { Table } from "sc-game-base";
import { SmartBotContainerRegistry } from "sc-smart-bot";

import PlaceBetConsumer from "./consumers/sedie-place-bet-consumer";
import { SedieBot, SedieGameCron } from "./crons";
import {
    SedieBets,
    SeDieRounds,
    SeDieSmartBotBetActions,
    SeDieSmartBotBetLogs,
    SeDieSmartBotPatterns,
    SedieTmpBets,
    SedieMD5s,
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
            md5sRepository: asValue(SedieMD5s),
        });

        this.container.register(new SmartBotContainerRegistry().register());
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
