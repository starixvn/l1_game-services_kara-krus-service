import { Core } from "sc-game-base";

export default class SedieSocketRouter extends Core.Routers.BaseSocketRouter {
    init(socketClient) {
        super.init(socketClient);

        this.socketClient.on("ping", (callback) => {
            callback();
        });
    }
}
