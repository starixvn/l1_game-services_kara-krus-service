import sortBy from 'lodash.sortby';
import { userInfos } from 'sc-base-database';
import appConfigs from '../app-configs.js';
import seDieRounds from '../models/sedie-rounds.js';
import storage from '../storage.js';
import { BaseEventPublishers } from 'sc-game-base';
import * as apis from 'sc-base-apis';

const publisher = new BaseEventPublishers.BasePublisher(storage, appConfigs.gameName);
/**
 * @param {SocketIO.Socket} socketClient
 */
export default async (socketClient) => {
    const loggedUser = storage.loggedUsers[socketClient.id];
    if (loggedUser) {
        await inGame(loggedUser);
        //return { messageType: appConfigs.gameName, payload: result };
    } else {
        socketClient.emit('message', { toGame: 'MainGame' });
    }
};

const inGame = async (loggedUser) => {
    const maxNumberOfRounds = 100;
    const { minbet, maxbet, choices_maxbet, odds } = storage.gameConfigs;
    const configs = { minbet, maxbet, choices_maxbet, odds };
    await apis.getBalance(loggedUser);
    const [logs, user] = await Promise.all([getRounds(maxNumberOfRounds), getUserInfo(loggedUser.UID)]);
    const { betTracks } = storage.gameData.usersData[loggedUser.UID] || { betTracks: {} };

    const me = { red: betTracks };
    const player = {
        id: loggedUser.UID,
        name: loggedUser.profile.name,
        red: user.red,
        avatarId: user.avatarId,
        type: user.type,
    };

    const playerArr = Object.values(storage.gameData.usersAndBots);
    const sorted = sortBy(playerArr, 'type');

    const players = {};
    sorted.forEach((item) => {
        players[item.id] = item;
    });

    delete players[loggedUser.UID];

    if (!storage.gameData.usersAndBots[player.id]) {
        storage.gameData.usersAndBots[player.id] = player;
    }

    const payload = {
        ingame: {
            configs,
            logs,
            me,
            players,
            time: storage.gameData.remainingTime,
        },
        user,
    };
    loggedUser.socketClient.emit(appConfigs.gameName, payload);

    publisher.publishToAllUsersExcept(loggedUser.UID, { ingame: { player: player } });
};

const getRounds = async (limit) => {
    const rounds = await seDieRounds
        .find({}, 'id red1 red2 red3 red4', { sort: { _id: -1 }, limit: limit })
        .lean()
        .exec();

    return rounds.map((round) => ({ round: round.id, dots: [round.red1, round.red2, round.red3, round.red4] }));
};

const getUserInfo = async (uid) => {
    return await userInfos
        .findOne(
            { id: uid },
            {
                UID: true,
                name: true,
                avatarId: true,
                red: true,
                joinedOn: true,
                security: true,
                currency: true,
                type: true,
            }
        )
        .lean()
        .exec();
};
