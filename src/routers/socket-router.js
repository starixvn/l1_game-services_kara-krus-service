import { logger } from 'sc-common';
import { BaseSocketRouter } from 'sc-game-base';
import * as queryApi from '../query-apis/index.js';
import appConfigs from './../app-configs.js';
import * as consumers from './../event-consumers/index.js';

export default class SocketRouter extends BaseSocketRouter {
    async handlePlaceBet(payload) {
        try {
            await consumers.placeBet(this.storage.loggedUsers[this.socketClient.id], payload, this.storage);
        } catch (err) {
            logger.logError(err);
        }
    }

    async handleInGame() {
        try {
            await consumers.inGame(this.socketClient); // push to message queue later
            //this.socketClient.emit(result.messageType, result.payload);
        } catch (err) {
            logger.logError(err);
        }
    }

    async handleGetHistory(payload) {
        try {
            const history = await queryApi.getHistory(this.storage.loggedUsers[this.socketClient.id], payload.page);
            this.socketClient.emit(appConfigs.gameName, history);
        } catch (err) {
            logger.logError(err);
        }
    }
}
