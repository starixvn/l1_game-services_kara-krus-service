import { gameConfigs } from "sc-base-database";
import { helpers, logger } from "sc-common";
import { BaseEventConsumers } from "sc-game-base";
import appConfigs from "../app-configs.js";

export default class SedieUserSignInConsumer extends BaseEventConsumers.BaseUserSignInConsumer {
    /**
     * @param {SocketIO.Socket} socketClient
     */
    async consume(socketClient, storage, payload) {
        try {
            const configs = await gameConfigs.findOne({ name: appConfigs.gameName });
            storage.gameConfigs = configs;

            if (configs && configs.enabled) {
                await super.consume(socketClient, storage, payload);
            } else {
                let umMessage = helpers.noticeHelper.underMaintenance;

                if (!!configs && !!configs.disabled_message) {
                    umMessage = configs.disabled_message;
                }

                const notice = { title: helpers.noticeHelper.noticeTitle, text: umMessage, load: false };
                socketClient.emit("message", { notice: notice, um: true });
            }
        } catch (err) {
            logger.logError(err);
        }
    }
}
