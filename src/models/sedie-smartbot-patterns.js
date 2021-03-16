import mongoose from "mongoose";

const schema = new mongoose.Schema({
    _id: { type: Number, required: true },
    time: { type: Date, required: true },
    memberId: { type: Number, required: true },
    group: { type: String, required: true },
});

export default mongoose.model("smartbot_xocxoc_patterns", schema);
