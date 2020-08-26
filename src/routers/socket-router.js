import { logger } from "sc-common";
import { BaseSocketRouter } from "sc-game-base";
import * as queryApi from "../query-apis/index.js";
import appConfigs from "./../app-configs.js";
import * as consumers from "./../event-consumers/index.js";

export default class SocketRouter extends BaseSocketRouter {
    /**
     * @param {consumers.SediePlaceBetConsumer} placeBetConsumer
     */
    constructor(userSignInConsumer, userDisconnectConsumer, placeBetConsumer) {
        super(userSignInConsumer, userDisconnectConsumer);
        this.placeBetConsumer = placeBetConsumer;
    }

    init(storage, socketClient) {
        super.init(storage, socketClient);
    }

    async handlePlaceBet(payload) {
        try {
            logger.setTag({ id: "socket-io-id", value: this.socketClient.id });
            logger.setTag({ id: "ip-address", value: this.socketClient.handshake.address });

            const user = this.storage.loggedUsers[this.socketClient.id];

            if (user) {
                await this.placeBetConsumer.placeBet(user, payload);
            } else {
                logger.logError(`User not found in server storage, payload [${JSON.stringify(payload)}]`);

                this.socketClient.emit("message", { unauthorized: true });
                this.socketClient.emit(appConfigs.gameName, { endBet: -1, userNotFound: true });
                this.socketClient.disconnect(true);
            }
        } catch (err) {
            logger.logError(err);
        }

        logger.setTag({ id: "socket-io-id", value: "" });
        logger.setTag({ id: "ip-address", value: "" });
    }

    async handleInGame() {
        try {
            await consumers.inGame(this.socketClient); // push to message queue later
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
