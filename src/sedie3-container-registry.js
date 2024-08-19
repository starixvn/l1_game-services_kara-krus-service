import awilix from "awilix";
import { Table } from "sc-game-base";

import GameResultServiceConsumer from "./consumers/game-result-service-consumer";
import PlaceBetConsumer from "./consumers/sedie3-place-bet-consumer";
import SeDie3SettleGameRoundConsumer from "./consumers/sedie3-settle-game-round-consumer";
import { SeDie3Bot, SeDie3GameCron } from "./crons";
import { SeDie3BetLogs, SeDie3Bets, SeDie3Results, SeDie3Rounds, SeDie3TmpBets } from "./models";
import SocketRouter from "./routers/socket-router";

const { asClass, asValue } = awilix;

export default class SeDieContainerRegistry extends Table.TableContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(SeDie3Rounds),
            betsRepository: asValue(SeDie3Bets),
            tempBetsRepository: asValue(SeDie3TmpBets),
            resultsRepository: asValue(SeDie3Results),
            betLogsRepository: asValue(SeDie3BetLogs),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            placeBetConsumer: asClass(PlaceBetConsumer).singleton(),
            settleGameRoundConsumer: asClass(SeDie3SettleGameRoundConsumer).singleton().proxy(),
            gameResultServiceConsumer: asClass(GameResultServiceConsumer).proxy(),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            bot: asClass(SeDie3Bot).singleton(),
            gameCron: asClass(SeDie3GameCron).singleton().proxy(),
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            socketRouter: asClass(SocketRouter).proxy(),
        });
    }
}
