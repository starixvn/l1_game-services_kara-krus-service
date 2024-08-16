import gameSetting from "./../../../src/game-settings";

const game = {
    id: gameSetting.id,
    name: gameSetting.name,
};

const currencyData = { code: "USD", name: "$US" };

const socketOptions = {
    socketUri: `http://localhost:5002/user/${gameSetting.name.toLowerCase()}`,
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    type: 0,
    name: "sedie3",
    minBet: 1,
    maxBet: 3000,
    maxBetPerChoices: { red: 3000, white: 3000, red3: 3000, white3: 3000, red2: 1000, red1: 1000 },
    odds: { red: 1.96, white: 1.96, red3: 7.84, white3: 7.84, red2: 2.61, red1: 2.61 },
};

const rounds = [
    {
        id: 1190119,
        result: { red1: false, red2: true, red3: true },
        settlementResult: { red: true, white: false, red2: true, red3: false, red1: false, white3: false },
    },
    {
        id: 1190118,
        result: { red1: false, red2: true, red3: false },
        settlementResult: { red: false, white: true, red1: true, red2: false, red3: false, white3: false },
    },
    {
        id: 1190117,
        result: { red1: true, red2: false, red3: false },
        settlementResult: { red: false, white: true, red1: true, red2: false, red3: false, white3: false },
    },
];

const userBetData = (uid) => {
    return [
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            red: 100,
            playerId: 1,
            name: "NormalUser",
            white: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            red1: 0,
            red2: 0,
            red3: 0,
            siteId: "111",
            white3: 0,
            roundId: 1190119,
            paid: true,
            totalAmount: 0,
        },
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            red: 100,
            playerId: 4,
            name: "NormalUser",
            white: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            red1: 0,
            red2: 0,
            red3: 0,
            siteId: "111",
            white3: 0,
            roundId: 1190119,
            paid: true,
            totalAmount: 0,
        },
    ];
};

const promotions = [
    {
        gameId: gameSetting.id,
        startDateTime: new Date(new Date().setSeconds(new Date().getSeconds())),
        endDateTime: new Date(new Date().setSeconds(new Date().getSeconds() + 60)),
        isDaily: false,
        odds: { red: 1.98, white: 1.98 },
        status: "enabled",
    },
];

export { currencyData, game, gameConfig, promotions, rounds, socketOptions, userBetData };
