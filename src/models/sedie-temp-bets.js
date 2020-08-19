import mongoose from "mongoose";

let Schema = new mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    phien: { type: Number, required: true, index: true },
    red: { type: Number, required: true },

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
});

export default mongoose.model("XocXoc_tmpcuoc", Schema);
