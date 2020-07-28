import sedieRounds from './../models/sedie-rounds.js';

/**
 * @param {SocketIO.Socket} socketClient
 */
export default async (socketClient, gameData) => {
    const round = await sedieRounds
        .findOne({}, ['id', 'red1', 'red2', 'red3', 'red4'], { sort: { id: -1 } })
        .lean()
        .exec();

    if (round != null) {
        const payload = {
            phien: round.id + 1,
            dices: [round.red1, round.red2, round.red3, round.red4],
            time_remain: gameData.remainingTime,
        };

        socketClient.emit('message', { data: payload });
    }
};
