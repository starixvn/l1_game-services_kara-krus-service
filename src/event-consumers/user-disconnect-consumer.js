import { BaseEventConsumers, BaseEventPublishers } from "sc-game-base";
import appConfigs from "../app-configs.js";

export default class SedieUserDisconnectConsumer extends BaseEventConsumers.BaseUserDisconnectConsumer {
    constructor(storage, basePublisher = null) {
        super();
        this.basePublisher = basePublisher ?? new BaseEventPublishers.BasePublisher(storage, appConfigs.gameName);
    }

    /**
     * @param {SocketIO.Socket} socketClient
     */
    consume(socketClient, storage, disconnectReason) {
        const loggedUser = storage.loggedUsers[socketClient.id];

        if (loggedUser) {
            delete storage.gameData.usersAndBots[loggedUser.UID];
            this.basePublisher.publishToAllUsers({ outgame: { playerId: loggedUser.UID } });
        }

        super.consume(socketClient, storage, disconnectReason);
    }
}
