import { BaseAdminSocketRouter } from 'sc-game-base';
import * as consumers from './../event-consumers/index.js';
import { logger } from 'sc-common';

export default class SedieAdminSocketRouter extends BaseAdminSocketRouter {
    async handleMessage(payload) {
        try {
            super.handleMessage(payload);
            const { xocxoc } = payload;
            if (xocxoc) {
                if (xocxoc.get_time) {
                    consumers.adminGetNewConsumer(this.socketClient, this.storage.gameData);
                }
            }
        } catch (err) {
            logger.logError(err);
        }
    }
}
