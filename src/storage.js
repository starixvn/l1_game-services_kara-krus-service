import constants from './constants.js';

export default {
    gameConfigs: null,
    loggedUsers: {},
    loggedAdmins: {
        0: { socketClient: null },
    },
    gameData: {
        roundId: 1,
        remainingTime: constants.roundDuration,
        disabled: false,
        usersAndBots: {},
        winClients: {},
        usersData: {},
        totalBets: { ...constants.resetTotalBets },
    },
};
