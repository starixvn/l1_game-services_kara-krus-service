import express from "express";
import http from "http";
import { middlewares } from "sc-common";
import { Core } from "sc-game-base";
export default class SupportedGameBaseClientApp extends Core.BaseGameApp {
    constructor(serviceName, appConfigs, baseMetrics = null) {
        super(serviceName, appConfigs, baseMetrics);
    }

    async run() {
        const app = express();
        await this.configureServices(app);
        app.get("/", (req, res, next) => {
            res.send(`I'm ${this.serviceName}. You'd better not touch me, babe!`);
        });

        const httpServer = http.createServer(app);
        const socketServer = this.initSocketServer(httpServer);

        socketServer.of(`/user/sedie`).on("connection", (socket) => {
            const req = socket.request;
            req.headers["user-agent"] = "browser-user-agent";
            console.log("initial_headers");
            socket.use((__, next) => {
                next();
            });
        });

        this.baseMetrics.init(socketServer);

        httpServer.listen(app.get("port"), async () => {
            console.log(`Express server started and running on port ${app.get("port")}!`);
        });

        middlewares.processErrorHandler.handle(httpServer, process);

        this.app = app;
        this.socketServer = socketServer;
    }
}
