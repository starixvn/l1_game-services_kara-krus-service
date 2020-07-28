import { BaseConstants, BaseGameApp } from 'sc-game-base';
import appConfigs from './app-configs.js';
import startCron from './cron/start.js';
import { SedieUserDisconnectConsumer, SedieUserSignInConsumer } from './event-consumers/index.js';
import initDatabase from './models/index.js';
import SedieSocketRouter from './routers/socket-router.js';
import Startup from './startup.js';
import storage from './storage.js';
import initHttpRouter from './routers/http-router.js';
import AdminSocketRouter from './routers/admin-socket-router.js';

export class SedieApp extends BaseGameApp {}

const run = async () => {
    const startup = new Startup(appConfigs, storage, () => startCron());
    const app = new SedieApp(
        appConfigs.gameName,
        storage,
        appConfigs,
        startup,
        initSocketRouter,
        initAdminSocketRouter,
        initHttpRouter
    );
    await initDatabase(appConfigs.database);
    await app.run();
};

const initSocketRouter = (socketClient) => {
    const router = new SedieSocketRouter(
        new SedieUserSignInConsumer(BaseConstants.GameTypes.RoomGame, 'XocXoc'),
        new SedieUserDisconnectConsumer()
    );

    router.init(storage, socketClient);
};

const initAdminSocketRouter = (socketClient) => {
    const router = new AdminSocketRouter();
    router.init(storage, socketClient);
};

run();
