import * as consumers from './../event-consumers/index.js';
import { BaseAdminSocketRouter } from 'sc-game-base';

export default class SedieAdminSocketRouter extends BaseAdminSocketRouter {
    async handleMessage(payload) {
        console.log(payload);
        try {
            super.handleMessage(payload);
            const { xocxoc } = payload;
            if (xocxoc) {
                if (xocxoc.get_time) {
                    consumers.adminGetNewConsumer(this.socketClient, this.storage.gameData);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
}
