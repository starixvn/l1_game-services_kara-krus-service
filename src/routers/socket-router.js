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
        this.placeBetConsumer = placeBetConsumer ?? new consumers.SediePlaceBetConsumer();
    }

    init(storage, socketClient) {
        super.init(storage, socketClient);
    }

    async handlePlaceBet(payload) {
        try {
            const user = this.storage.loggedUsers[this.socketClient.id];

            if (user) {
                await this.placeBetConsumer.placeBet(user, payload);
                logger.setTag({ id: "user-id", value: user.UID });
                logger.log(`User place bet with payload [${JSON.stringify(payload)}]`);
            } else {
                logger.setTag({ id: "socket-io-id", value: socketClient.id });
                logger.logError("User not found in server storage");
                this.socketClient.emit(appConfigs.gameName, { endBet: -1, userNotFound: true });
            }
        } catch (err) {
            logger.logError(err);
        }
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
