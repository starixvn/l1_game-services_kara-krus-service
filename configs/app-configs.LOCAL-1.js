export default {
    hostingPort: 5000,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://api.lumigame.com/v1",
        authUrl: "http://auth.lumigame.com/v1",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        enabledApiLogs: true,
    },
    mainServerApiSettings: {
        url: "http://haproxy.lumigame.com:7000/v1/main/api",
        auth: {
            url: "http://auth.lumigame.com/v1",
            id: "game-services",
            secret: "gameservices@20luminet&",
        },
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        useAuthenticate: true,
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://lmn_backend:LmnBackend@10.10.50.14:17101/?replicaSet=L1pLocal",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://65b6a9f399b74794a7a23f90694d4fec@sentryuat.sabagame.com/186",
        logIdentifier: "sedie",
        env: "LOCAL",
    },
    authenticateSettings: {
        audiences: ["api", "admin-api"],
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    enableCorsWs: true,
    corsUrls: ["http://localhost:7456", "http://localhost:7000", "http://games.lumigame.com/v1", "http://admin.lumigame.com/v1"],
};
