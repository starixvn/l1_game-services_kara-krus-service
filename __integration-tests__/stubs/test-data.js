const game = {
    id: 2,
    name: "XocXoc",
};

const user = {
    id: 1,
    name: "Alvin",
    currency: "UUS",
};

const userSession = {
    session: "1-session-id",
    ss: "1-session-id",
    currency: user.currency,
    username: `${user.id}_${user.name}`,
};

const socketOptions = {
    socketUri: "http://127.0.0.1:5001/user/xocxoc",
    gameName: game.name,
    proxyRoute: "/socket.io",
};

const gameConfig = {
    name: "xocxoc",
    enabled: true,
    minbet: 1,
    maxbet: 5000,
    choices_maxbet: {
        even: 3000,
        odd: 3000,
        red3: 3000,
        white3: 3000,
        red4: 1000,
        white4: 1000,
        red2: 3000,
    },
    odds: {
        even: 1.97,
        odd: 1.97,
        red3: 3.76,
        white3: 3.76,
        red4: 14.5,
        white4: 14.5,
        red2: 2.5,
    },
};

export { game, user, userSession, socketOptions, gameConfig };
