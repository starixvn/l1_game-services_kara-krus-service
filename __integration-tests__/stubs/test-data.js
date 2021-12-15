const game = {
    id: 2,
    name: "XocXoc",
};

const user = {
    id: 1,
    name: "Alvin",
    currencyName: "$US",
    currencyCode: "USD",
    partnerId: "dummy-partner-id",
};

const userSession = {
    session: "1-session-id",
    ss: "1-session-id",
    currency: user.currency,
    username: `${user.id}_${user.name}`,
    browserUserAgent: "browser-user-agent",
};

const socketOptions = {
    socketUri: "http://127.0.0.1:5001/user/xocxoc",
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    type: 0,
    name: "xocxoc",
    enabled: true,
    botenabled: true,
    minbet: 1,
    maxbet: 5000,
    disabledround: 1187977,
    bot_maxbet: 500,
    hour_maxbot: [0, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.05, 0.05, 0.05, 0.05, 0.05, 0.005, 0.005, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    disabled_message: "Game đang được bảo trì, vui lòng quay lại sau 10 phút.",
    choices_maxbet: { even: 3000, odd: 3000, red3: 3000, white3: 3000, red4: 1000, white4: 1000, red2: 3000 },
    odds: { even: 1.97, odd: 1.97, red3: 3.76, white3: 3.76, red4: 14.5, white4: 14.5, red2: 2.5 },
    delayStartTime: 0,
    siteExclusions: [],
    enableFreeBet: false,
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

export { game, user, userSession, socketOptions, gameConfig, rounds };
