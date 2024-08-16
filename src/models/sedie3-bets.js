import mongoose from "mongoose";

const bet = {
    uid: { type: String, required: true },
    name: { type: String, required: true },

    red: { type: Number, default: 0 },
    white: { type: Number, default: 0 },
    red1: { type: Number, default: 0 },
    red2: { type: Number, default: 0 },
    red3: { type: Number, default: 0 },
    white3: { type: Number, default: 0 },

    totalAmount: { type: Number, default: 0 },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    odds: { type: Object },

    siteId: { type: String },
    freeBet: { type: Boolean, default: false },

    playerId: { type: String },
    operatorId: { type: String, required: false },
    roundId: { type: Number, default: 0 },
    paid: { type: Boolean, default: false },
};

const SeDie3Bets = mongoose.model(
    "sedie3_bets",
    new mongoose.Schema({
        ...bet,
        currency: { type: String, require: true },
        rate: { type: Number, require: true },
        partnerId: { type: String, require: true },
    })
);

const SeDie3TmpBets = mongoose.model("sedie3_tmpbets", new mongoose.Schema(bet));

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

const SeDie3BetLogs = mongoose.model("sedie3_betlogs", new mongoose.Schema(betLog));

export { SeDie3BetLogs, SeDie3Bets, SeDie3TmpBets };
