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
    name: "karakrus",
    minBet: 1,
    maxBet: 3000,
    maxBetPerChoices: { kara: 3000, krus: 3000, head3: 3000, tail3: 3000, head2: 1000, head1: 1000 },
    odds: { kara: 1.96, krus: 1.96, head3: 7.84, tail3: 7.84, head2: 2.61, head1: 2.61 },
};

const rounds = [
    {
        id: 1190119,
        result: { head1: false, head2: true, head3: true },
        settlementResult: { kara: true, krus: false, head1: false, head2: true, head3: false, tail3: false },
    },
    {
        id: 1190118,
        result: { head1: false, head2: true, head3: false },
        settlementResult: { kara: false, krus: true, head1: true, head2: false, head3: false, tail3: false },
    },
    {
        id: 1190117,
        result: { head1: true, head2: false, head3: false },
        settlementResult: { kara: false, krus: true, head1: true, head2: false, head3: false, tail3: false },
    },
];

const userBetData = (uid) => {
    return [
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            kara: 100,
            playerId: 1,
            name: "NormalUser",
            krus: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            head1: 0,
            head2: 0,
            head3: 0,
            siteId: "111",
            white3: 0,
            white4: 0,
            roundId: 1190119,
            paid: true,
            totalAmount: 0,
        },
        {
            freeBet: false,
            uid: uid,
            betwin: 0,
            currency: "$US",
            kara: 100,
            playerId: 4,
            name: "NormalUser",
            krus: 0,
            odds: gameConfig.odds,
            operatorId: "dummy-operator-id",
            rate: 1,
            head1: 0,
            head2: 0,
            head3: 0,
            siteId: "111",
            white3: 0,
            white4: 0,
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
        odds: { kara: 1.98, krus: 1.98 },
        status: "enabled",
    },
];

export { currencyData, game, gameConfig, promotions, rounds, socketOptions, userBetData };
