import SocketIOClient from "socket.io-client";

export const eventTypes = {
    signedIn: "signedIn",
    connect: "connect",
    signIn: "signin",
    reconnect: "reconnect",
    connectFailed: "connect_failed",
    connectError: "connect_error",
    disconnect: "disconnect",
    bet: "bet",
    getHistory: "getHistory",
    inGame: "inGame",
    recheckIn: "recheckin",
    message: "message",
    forceDisconnect: "forceDisconnect",
    getGameConfigs: "getGameConfigs",
    getStatistics: "getStatistics",
};

export class GameServiceClient {
    socket;
    gameName;
    onConnectFailed;
    userSession;

    constructor(socketOptions, userSession) {
        this.socket = SocketIOClient(socketOptions.socketUri, {
            transports: ["websocket"],
            upgrade: false,
            path: socketOptions.proxyRoute,
            forceNew: true,
            extraHeaders: {
                "user-agent": "browser-user-agent",
            },
        });
        this.gameName = socketOptions.gameName;
        this.onConnectFailed = socketOptions.onConnectFailed || (() => ({}));
        this.userSession = userSession;
        this.registerEvents();
    }

    getSocketClient() {
        return this.socket;
    }

    close() {
        this.socket && this.socket.disconnect();
    }

    on(eventName, eventHandler) {
        this.socket.on(eventName, eventHandler);
    }

    once(eventName, eventHandler) {
        this.socket.once(eventName, eventHandler);
    }

    removeListener(eventName, handler) {
        this.socket.removeListener(eventName, handler);
    }

    emit(eventName, ...args) {
        if (args.length) {
            this.socket.emit(eventName, ...args);
        } else {
            this.socket.emit(eventName);
        }
    }

    registerEvents() {
        this.on(eventTypes.connect, () => {
            this.emit(eventTypes.signIn, this.userSession);
        });

        this.on(eventTypes.reconnect, () => {
            console.logError(this.buildLog(eventTypes.reconnect));
        });

        this.on(eventTypes.connectFailed, () => {
            console.logError(this.buildLog(eventTypes.connectFailed));
            this.socket.disconnect();
            this.onConnectFailed(this.gameName);
        });

        this.on(eventTypes.connectError, (error) => {
            console.logError(error);
            this.socket.disconnect();
            this.onConnectFailed(this.gameName);
        });

        this.on(eventTypes.disconnect, (reason) => {
            console.log(this.buildLog(eventTypes.disconnect, reason));
        });
    }

    buildLog(event, message) {
        return JSON.stringify({
            event,
            message,
            game: this.gameName,
        });
    }
}
