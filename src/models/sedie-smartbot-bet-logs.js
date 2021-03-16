import mongoose from "mongoose";

const schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    round: { type: Number, required: true },
    patternId: { type: Number, required: true },
    time: { type: Date },
    second: { type: Number, required: true },
    choiceId: { type: Number, required: true },
    amount: { type: Number, required: true },
});

export default mongoose.model("smartbot_sedie_bet_logs", schema);
