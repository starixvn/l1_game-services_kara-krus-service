import mongoose from "mongoose";

const betLog = {
    uid: { type: String, required: true },
    name: { type: String, required: true },

    choice: { type: String, required: true },
    amount: { type: Number, default: 0, required: true },

    time: { type: Date },

    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    playerId: { type: String, required: true },
    operatorId: { type: String, required: true },
    roundId: { type: Number, default: 0, required: true },

    currency: { type: String, required: true },
    rate: { type: Number, required: true },

    clientSentTime: { type: Date },
    receivedTime: { type: Date },
};

const Schema = new mongoose.Schema(betLog);

export default mongoose.model("karakrus_betlogs", Schema);
