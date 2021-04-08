import { asClass, asValue } from "awilix";
import { Table } from "sc-game-base";

import PlaceBetConsumer from "./consumers/place-bet-consumer";
import { SedieBot, SedieGameCron } from "./cron";
import { SedieBets, SedieTmpBets } from "./models/sedie-bets";
import SedieRounds from "./models/sedie-rounds";

export default class KenoProMaxContainerRegistry extends Table.TableContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(SedieRounds),
            betsRepository: asValue(SedieBets),
            tempBetsRepository: asValue(SedieTmpBets),
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
