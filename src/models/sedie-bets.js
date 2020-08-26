import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true, index: true },

    odd: { type: Number, default: 0 },
    even: { type: Number, default: 0 },
    red3: { type: Number, default: 0 },
    red4: { type: Number, default: 0 },
    white3: { type: Number, default: 0 },
    white4: { type: Number, default: 0 },

    thanhtoan: { type: Boolean, default: false },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    memberId: { type: Number },
    siteId: { type: String },

    freeBet: { type: Boolean, default: false },
});

const bets = mongoose.model("XocXoc_cuoc", schema);
const tmpBets = mongoose.model("XocXoc_tmpcuoc", schema);

export { bets as SedieBets, tmpBets as SedieTmpBets };
