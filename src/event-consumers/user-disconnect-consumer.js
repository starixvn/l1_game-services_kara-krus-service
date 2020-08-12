import { BaseEventConsumers, BaseEventPublishers } from "sc-game-base";
import appConfigs from "../app-configs.js";
import storage from "../storage.js";

const publisher = new BaseEventPublishers.BasePublisher(storage, appConfigs.gameName);

export default class SedieUserDisconnectConsumer extends BaseEventConsumers.BaseUserDisconnectConsumer {
    /**
     * @param {SocketIO.Socket} socketClient
     */
    consume(socketClient, storage) {
        const loggedUser = storage.loggedUsers[socketClient.id];

        if (loggedUser) {
            delete storage.gameData.usersAndBots[loggedUser.UID];
            publisher.publishToAllUsers({ outgame: { playerId: loggedUser.UID } });
        }

        super.consume(socketClient, storage);
    }
}
