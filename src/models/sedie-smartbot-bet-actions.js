import mongoose from "mongoose";

const schema = new mongoose.Schema({
    patId: { type: Number, required: true },
    time: { type: Number, required: true },
    round: { type: Number, required: true },
    second: { type: Number, required: true },
    choiceId: { type: Number, required: true },
    amount: { type: Number, required: true },
});

export default mongoose.model("smartbot_xocxoc_bets", schema);
