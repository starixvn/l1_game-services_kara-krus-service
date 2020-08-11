import { BaseConstants, BaseStartup } from 'sc-game-base';
import appConfigs from './app-configs.js';
import {
    SediePlaceBetConsumer,
    SedieUserDisconnectConsumer,
    SedieUserSignInConsumer,
} from './event-consumers/index.js';
import initDatabase from './models/index.js';
import initHttpRouter from './routers/http-router.js';
import SedieSocketRouter from './routers/socket-router.js';

export default class Startup extends BaseStartup {
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
        const router = new SedieSocketRouter(
            new SedieUserSignInConsumer(BaseConstants.GameTypes.RoomGame, 'XocXoc'),
            new SedieUserDisconnectConsumer(),
            new SediePlaceBetConsumer()
        );

        router.init(this.storage, socketClient);
    }

    /**
     * @param {socketIo.Socket} socketClient
     */
    initAdminSocketRouter(socketClient) {
        const router = new SedieAdminSocketRouter();
        router.init(this.storage, socketClient, this.appConfigs.adminSecretKey);
    }

    async start() {
        await super.start();

        await initDatabase(appConfigs.database);
    }
}
