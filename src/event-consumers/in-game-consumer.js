import sortBy from "lodash.sortby";
import { userInfos } from "sc-base-database";
import appConfigs from "../app-configs.js";
import seDieRounds from "../models/sedie-rounds.js";
import storage from "../game-data.js";
import { BaseEventPublishers } from "sc-game-base";
import * as apis from "sc-base-apis";
import { getSettlementResult } from "./result-helper.js";

const publisher = new BaseEventPublishers.BasePublisher(storage, appConfigs.gameName);
/**
 * @param {SocketIO.Socket} socketClient
 */
export default async (socketClient) => {
    const loggedUser = storage.loggedUsers[socketClient.id];
    if (loggedUser) {
        await inGame(loggedUser);
    } else {
        socketClient.emit("message", { toGame: "MainGame" });
    }
};

const inGame = async (loggedUser) => {
    const maxNumberOfRounds = 100;
    const { minbet, maxbet, choices_maxbet, odds } = storage.gameConfigs;
    const { remainingTime, totalBets } = storage.gameData;
    const gameConfigs = { minbet, maxbet, choices_maxbet, odds };

    await apis.getBalance(loggedUser, true);

    const [roundHistory, user] = await Promise.all([getRounds(maxNumberOfRounds), getUserInfo(loggedUser.UID)]);
    const { betTracks: ownBets } = storage.gameData.usersData[loggedUser.UID] || { betTracks: {} };

    const player = {
        id: loggedUser.UID,
        name: loggedUser.profile.name,
        red: user.red,
        avatarId: user.avatarId,
        type: user.type,
    };

    const playerArr = Object.values(storage.gameData.usersAndBots);
    const sorted = sortBy(playerArr, "type");

    const players = {};
    sorted.forEach((item) => {
        players[item.id] = item;
    });

    delete players[loggedUser.UID];

    if (!storage.gameData.usersAndBots[player.id]) {
        storage.gameData.usersAndBots[player.id] = player;
    }

    const inGameData = {
        gameConfigs,
        roundHistory,
        remainingTime,
        ownBets,
        totalBets,
        players,
    };

    loggedUser.socketClient.emit(appConfigs.gameName, inGameData);

    publisher.publishToAllUsersExcept(loggedUser.UID, { player });
};

const getRounds = async (limit) => {
    try {
        const rounds = await seDieRounds
            .find({}, "id red1 red2 red3 red4", { sort: { _id: -1 }, limit: limit })
            .lean()
            .exec();

        return rounds.map((round) => {
            const result = { red1: round.red1, red2: round.red2, red3: round.red3, red4: round.red4 };
            return {
                roundId: round.id,
                result,
                settlementResult: getSettlementResult(result),
            };
        });
    } catch (er) {
        console.log(er);
    }
};

const getUserInfo = async (uid) => {
    return await userInfos
        .findOne(
            { id: uid },
            { UID: true, name: true, avatarId: true, red: true, joinedOn: true, security: true, currency: true, type: true }
        )
        .lean()
        .exec();
};
