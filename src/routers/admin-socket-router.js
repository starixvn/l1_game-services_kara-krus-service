import { logger } from "sc-common";
import { BaseAdminSocketRouter } from "sc-game-base";

import * as consumers from "./../event-consumers";

export default class SedieAdminSocketRouter extends BaseAdminSocketRouter {
    async handleMessage(payload) {
        try {
            super.handleMessage(payload);
            const { xocxoc } = payload;

            if (xocxoc && xocxoc.get_time) {
                consumers.adminGetNewConsumer(this.socketClient, this.storage.gameData);
            }
        } catch (err) {
            logger.logError(err);
        }
    }
}
