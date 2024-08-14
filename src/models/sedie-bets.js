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

const bets = mongoose.model(
    "sedie3_bets",
    new mongoose.Schema({
        ...bet,
        currency: { type: String, require: true },
        rate: { type: Number, require: true },
        partnerId: { type: String, require: true },
    })
);
const tmpBets = mongoose.model("sedie3_tmpbets", new mongoose.Schema(bet));

export { bets as SedieBets, tmpBets as SedieTmpBets };
