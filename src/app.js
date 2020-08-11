import { BaseGameApp, ProcessBetQueue } from 'sc-game-base';
import appConfigs from './app-configs.js';
import startCron from './cron/start.js';
import { SediePlaceBetConsumer } from './event-consumers/index.js';
import Startup from './startup.js';
import storage from './storage.js';

export class SedieApp extends BaseGameApp {}

const run = async () => {
    const startup = new Startup(
        appConfigs.gameName,
        appConfigs,
        storage,
        () => startCron(),
        new ProcessBetQueue(new SediePlaceBetConsumer())
    );
    const app = new SedieApp(appConfigs.gameName, storage, appConfigs, startup);
    await app.run();
};

run();
