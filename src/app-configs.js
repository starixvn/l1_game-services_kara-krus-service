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
        enabledApiLogs: true,
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
        sentryUrl: 'https://26dc7731a358406c95530430d1a3f458@sentryuat.sabagame.com/109',
        logIdentifier: 'minisedie',
        env: 'LOCAL',
    },
    authenticateSettings: {
        audiences: ['api', 'admin-api'],
    },
};
