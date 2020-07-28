import * as consumers from './../event-consumers/index.js';

export default class AdminSocketRouter {
    /**
     * @param {SocketIO.Socket} socketClient
     */
    init(storage, socketClient) {
        this.storage = storage;
        this.socketClient = socketClient;
        const adminData = { socketClient };
        this.storage.loggedAdmins[socketClient.id] = { ...adminData };
        this.socketClient.on('message', this.handleGetNew.bind(this));
    }

    async handleGetNew(payload) {
        try {
            console.log('get_new');
            console.log(payload);
            consumers.adminGetNewConsumer(this.socketClient, this.storage.gameData);
        } catch (err) {
            console.log(err);
        }
    }
}
