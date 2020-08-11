export default {
    gameId: 2,
    gameName: 'xocxoc',
    hostingPort: 8082,
    apiSettings: {
        enabledApi: true,
        apiUrl: 'http://api.lumigame.com',
        authUrl: 'http://auth.lumigame.com',
        client: {
            id: 'game-server',
            secret: 'gameserver@20luminet&',
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 4500,
        enableApiLogs: true,
    },
    enabledLogs: true,
    database: {
        //url: 'mongodb://lmn_backend:LmnBackend@10.10.50.13:27101/?replicaSet=L1Local',
        url: 'mongodb://10.5.10.49:27017',
        options: {
            // user: 'lmn_backend',
            // pass: 'LmnBackend',
            dbName: 'minigame',
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
            //'autoIndex':       false,
        },
    },
    sentry: {
        sentryUrl: 'https://c9800a77cde44628ae983c6dfabfc7d9@sentryuat.sabagame.com/113',
        logIdentifier: 'sedie',
        env: 'LOCAL',
    },
    authenticateSettings: {
        audiences: ['api', 'admin-api'],
    },
    adminSecretKey: 'asWDEerfOIdgsdqRTFabvmgh',
    enableCorsWs: false,
    corsUrls: ['http://localhost:7456', 'http://games.lumigame.com', 'http://admin.lumigame.com'],
};
