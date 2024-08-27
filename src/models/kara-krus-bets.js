import mongoose from "mongoose";

const bet = {
    uid: { type: String, required: true },
    name: { type: String, required: true },

    kara: { type: Number, default: 0 },
    krus: { type: Number, default: 0 },
    head2: { type: Number, default: 0 },
    head3: { type: Number, default: 0 },
    head1: { type: Number, default: 0 },
    tail3: { type: Number, default: 0 },

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

const bets = mongoose.model(
    "karakrus_bets",
    new mongoose.Schema({
        ...bet,
        currency: { type: String, require: true },
        rate: { type: Number, require: true },
        partnerId: { type: String, require: true },
    })
);
const tmpBets = mongoose.model("karakrus_tmpbets", new mongoose.Schema(bet));

export { bets, tmpBets };

