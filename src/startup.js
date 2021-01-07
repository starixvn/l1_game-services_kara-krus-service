import { Table } from "sc-game-base";

import PlaceBetConsumer from "./consumers/place-bet-consumer";
import { SedieHistoryQuery, SedieRoundQuery } from "./query-apis";

export default class Startup extends Table.TableGameStartup {
    /**
     * @param {socketIo.Socket} socketClient
     */
    initSocketRouter(socketClient) {
        const roundQuery = new SedieRoundQuery(this.definition);

        const router = new Table.Routers.SocketRouter({
            definition: this.definition,
            gameData: this.gameData,
            placeBetConsumer: new PlaceBetConsumer(this.definition, this.gameData),
            historyQuery: new SedieHistoryQuery(this.definition, roundQuery),
            roundQuery: roundQuery,
        });

        router.init(socketClient);
    }
}
