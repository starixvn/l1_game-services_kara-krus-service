import { Table } from "sc-game-base";

import initDatabase from "./models";
import SedieRoundQuery from "./query-apis/sedie-round-query";
import initHttpRouter from "./routers/http-router";

export default class Startup extends Table.TableGameStartup {
    /**
     * @param {express.Express} app
     */
    initHttpRouter(app) {
        initHttpRouter(app);
    }

    /**
     * @param {socketIo.Socket} socketClient
     */
    initSocketRouter(socketClient) {
        const router = new Table.Routers.SocketRouter(
            this.definition,
            this.gameData,
            null,
            null,
            null,
            null,
            null,
            new SedieRoundQuery(this.definition)
        );

        router.init(socketClient);
    }

    /**
     * @param {socketIo.Socket} socketClient
     */
    initAdminSocketRouter(socketClient) {
        // const router = new SedieAdminSocketRouter();
        // router.init(this.storage, socketClient, this.appConfigs.adminSecretKey);
    }

    async configureServices(app) {
        super.configureServices(app);

        await initDatabase(this.appConfigs.database);
    }
}
