import constants from "./constants.js";

export default {
    roundId: 1,
    remainingTime: constants.roundDuration,
    disabled: false,
    usersAndBots: {},
    winClients: {},
    usersData: {},
    totalBets: { ...constants.resetTotalBets },
    realPlayers: {},
    players: {},
    admins: {},
    gameConfigs: null,
};
