import awilix from "awilix";
import { Table } from "sc-game-base";
import PlaceBetConsumer from "./consumers/kara-krus-place-bet-consumer";
import KaraKrusSettleGameRoundConsumer from "./consumers/kara-krus-settle-game-round-consumer";
import GameResultServiceConsumer from "./consumers/game-result-service-consumer";
import { KaraKrusBot, KaraKrusGameCron, KaraKrusProcessBetQueue } from "./crons";
import { bets, rounds, tmpBets, results, betLogs } from "./models";
import SocketRouter from "./routers/socket-router";

const { asClass, asValue } = awilix;

export default class KaraKrusContainerRegistry extends Table.TableContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(rounds),
            betsRepository: asValue(bets),
            tempBetsRepository: asValue(tmpBets),
            resultsRepository: asValue(results),
            betLogsRepository: asValue(betLogs),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(KaraKrusSettleGameRoundConsumer).singleton().proxy(),
            gameResultServiceConsumer: asClass(GameResultServiceConsumer).proxy(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            bot: asClass(KaraKrusBot).singleton(),
            gameCron: asClass(KaraKrusGameCron).singleton().proxy(),
            processBetQueue: asClass(KaraKrusProcessBetQueue).singleton().proxy(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            socketRouter: asClass(SocketRouter).proxy(),
        });
    }
}
