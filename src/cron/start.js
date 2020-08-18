import sedieRounds from "../models/sedie-rounds.js";
import storage from "../game-data.js";
import runGame from "./run-game.js";

const start = async () => {
    const lastRound = await sedieRounds
        .findOne({}, "id", { sort: { _id: -1 } })
        .lean()
        .exec();

    if (!!lastRound) {
        storage.gameData.roundId = lastRound.id + 1;
    }

    runGame(storage.gameData);
};

export default start;
