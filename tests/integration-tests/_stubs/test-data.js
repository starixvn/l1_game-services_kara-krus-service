import gameSetting from "../../../src/game-settings";

const game = {
    id: gameSetting.id,
    name: gameSetting.name,
};

const currencyData = { code: "USD", name: "$US" };

const socketOptionsFunc = (port) => {
    return {
        socketUri: `http://localhost:${port}/user/${gameSetting.name.toLowerCase()}`,
        gameName: game.name,
        proxyRoute: "/socket.io",
    };
};

const gameConfig = {
    type: 0,
    name: "xocxoc",
    minBet: 1,
    maxBet: 3000,
    maxBetPerChoices: { even: 3000, odd: 3000, red3: 3000, white3: 3000, red4: 1000, white4: 1000, red2: 3000 },
    odds: { even: 1.97, odd: 1.97, red3: 3.76, white3: 3.76, red4: 14.5, white4: 14.5, red2: 2.5 },
};

const rounds = [
    {
        id: 1190119,
        result: { red1: false, red2: false, red3: true, red4: true },
        settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
    },
    {
        id: 1190118,
        result: { red1: false, red2: true, red3: true, red4: false },
        settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
    },
    {
        id: 1190117,
        result: { red1: true, red2: false, red3: false, red4: true },
        settlementResult: { odd: false, even: true, red2: true, red3: false, red4: false, white3: false, white4: false },
    },
];

const userBetData = (uid) => {
    return [
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            even: 100,
            playerId: 1,
            name: "NormalUser",
            odd: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            red2: 0,
            red3: 0,
            red4: 0,
            siteId: "111",
            white3: 0,
            white4: 0,
            roundId: 1190119,
            paid: true,
        },
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            even: 100,
            playerId: 4,
            name: "NormalUser",
            odd: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            red2: 0,
            red3: 0,
            red4: 0,
            siteId: "111",
            white3: 0,
            white4: 0,
            roundId: 1190119,
            paid: true,
        },
    ];
};

const promotions = [
    {
        gameId: gameSetting.id,
        startDateTime: new Date(new Date().setSeconds(new Date().getSeconds() + 15)),
        endDateTime: new Date(new Date().setSeconds(new Date().getSeconds() + 15 + 6)),
        isDaily: false,
        odds: { even: 1.98, odd: 1.98 },
        status: "enabled",
    },
];

export { game, currencyData, socketOptionsFunc, gameConfig, rounds, userBetData, promotions };
