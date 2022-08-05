export default {
    hostingPort: 5002,
    apiSettings: {
        enabledApi: true,
        apiUrl: "http://localhost:9000",
        authUrl: "http://auth.lumigame.com",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: false,
        requestTimeout: 5000,
        placeBetTimeout: 4500,
        enabledApiLogs: true,
    },
    authenticateSettings: {
        url: "http://auth.lumigame.com",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 10000,
        useAuthenticate: false,
        audiences: ["api", "admin-api"],
    },
    userServiceSettings: {
        url: "http://127.0.0.1:5000",
    },
    socketOptions: {
        pingInterval: 60 * 1000,
        pingTimeout: 60 * 1000,
        transports: ["websocket"],
        allowUpgrades: false,
    },
    enabledLogs: true,
    database: {
        url: "mongodb://localhost:27017",
        options: {
            dbName: "minigame",
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: "https://c9800a77cde44628ae983c6dfabfc7d9@sentryuat.sabagame.com/113",
        logIdentifier: "sedie",
        env: "LOCAL",
    },
    adminSecretKey: "asWDEerfOIdgsdqRTFabvmgh",
    enableCorsWs: false,
    corsUrls: [
        "http://localhost:7456",
        "http://10.5.10.14:7456",
        "http://localhost:7000",
        "http://games.lumigame.com",
        "http://admin.lumigame.com",
    ],
    metrics: {
        enable: true,
        secretKey: "6c1f0f28-70f2-46ae-b031-22624a6cd8df",
    },
    enableMsgpackParser: false,
    chatBotSettings: {
        url: "https://bot.nexdev.net/skynex/api/messages/",
        token: "0A40aOc7CtpzjbBSJu8KNWQRoXyjRvf9",
        conversationId: -1001583218578,
        requestTimeout: 5000,
    },
};
