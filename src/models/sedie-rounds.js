import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment-reworked";

let resultSchema = new mongoose.Schema(
    {
        red1: { type: Boolean, required: true },
        red2: { type: Boolean, required: true },
        red3: { type: Boolean, required: true },
        red4: { type: Boolean, required: true },
    },
    { _id: false }
);

let settlementResultSchema = new mongoose.Schema(
    {
        odd: { type: Boolean, default: false },
        even: { type: Boolean, default: false },
        red3: { type: Boolean, default: false },
        red4: { type: Boolean, default: false },
        white3: { type: Boolean, default: false },
        white4: { type: Boolean, default: false },
    },
    { _id: false }
);

let Schema = new mongoose.Schema({
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Date, default: new Date() },
});

Schema.plugin(autoIncrement.MongooseAutoIncrementID.plugin, { modelName: "XocXoc_phien", field: "id" });

export default mongoose.model("XocXoc_phien", Schema);
