export default {
    gameId: 2,
    gameName: 'xocxoc',
    hostingPort: 7000,
    apiSettings: {
        enabledApi: true,
        apiUrl: 'http://10.99.99.101:7300',
        authUrl: 'http://10.99.99.101:7303',
        client: {
            id: 'game-server',
            secret: 'gameserver@20luminet&',
        },
        useAuthenticate: true,
        placeBetTimeout: 4500,
        requestTimeout: 10000, // 10s
        enabledApiLogs: true,
    },
    enabledLogs: true,
    database: {
        url: 'mongodb://lmn_backend:LmnBackend%4022027@10.99.99.187:27201/?replicaSet=SabaUAT',
        options: {
            dbName: 'minigame',
            useNewUrlParser: true,
            useUnifiedTopology: true,
            auto_reconnect: true,
        },
    },
    sentry: {
        sentryUrl: 'http://f371d3a21b2e468eaf7b4a80c45e9d11@10.99.99.187:800/115',
        logIdentifier: 'minisedie',
        env: 'UAT',
    },
    authenticateSettings: {
        audiences: ['api', 'admin-api'],
    },
    adminSecretKey: 'asWDEerfOIdgsdqRTFabvmgh',
    enableCorsWs: true,
    corsUrls: [
        'http://uat.sabagame.com',
        'https://uat.sabagame.com',
        'http://uat-adm.sabagame.com',
        'https://uat-adm.sabagame.com',
    ],
};
