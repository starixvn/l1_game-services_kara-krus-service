import { logger, utils } from "sc-common";

import appConfigs from "./../app-configs";
import gameData from "./../game-data";

const mapRealUsers = (clients) => {
    const uusUsers = [];
    const realUsers = [];

    clients.forEach(function (cacheClient) {
        if (cacheClient && cacheClient.session && cacheClient.socketClient && cacheClient.socketClient.connected) {
            const user = {
                name: cacheClient.session.memberName,
                id: cacheClient.session.memberId,
                currency: cacheClient.session.currency,
                character: cacheClient.session.characterName,
            };

            if (cacheClient.session.currency?.toUpperCase() === "UUS") {
                uusUsers.push(user);
            } else {
                realUsers.push(user);
            }
        }
    });

    return {
        uusUsers,
        realUsers,
    };
};

const onlineUsers = (res) => {
    try {
        const users = mapRealUsers(Object.values(gameData.loggedUsers));
        const bots = Object.values(gameData.gameData.usersAndBots)
            .filter((player) => player.type)
            .map((bot) => ({ name: bot.name, red: bot.red }));

        res.send({
            totalRealPlayer: users.realUsers.length,
            realUsers: users.realUsers,
            totalUusPlayer: users.uusUsers.length,
            uusUsers: users.uusUsers,
            totalBots: bots.length,
            bots: bots,
        });

        return;
    } catch (err) {
        logger.logError(err);
    }

    res.send({ error: true });
};

export default (app) => {
    app.get(
        "/api/onlineusers",
        utils.authentication.useAuthenticate({
            authUrl: appConfigs.apiSettings.authUrl,
            audiences: appConfigs.authenticateSettings.audiences,
        }),
        (req, res) => onlineUsers(res)
    );
};
