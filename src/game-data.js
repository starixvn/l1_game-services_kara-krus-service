import constants from "./constants.js";

export default {
    roundId: 1,
    remainingTime: constants.roundDuration,
    disabled: false,
    usersAndBots: {},
    winClients: {},
    ingame: {},
    totalBets: { ...constants.resetTotalBets },
    realPlayers: {},
    players: {},
    admins: {},
    settlementResultFromAdmin: {
        roundId: 0,
        result: {},
    },
    gameConfigs: null,
};
