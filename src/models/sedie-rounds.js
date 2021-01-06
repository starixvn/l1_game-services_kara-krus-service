import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment-reworked";

const modelName = "XocXoc_phien";

const resultSchema = new mongoose.Schema(
    {
        red1: { type: Boolean, required: true },
        red2: { type: Boolean, required: true },
        red3: { type: Boolean, required: true },
        red4: { type: Boolean, required: true },
    },
    { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
    {
        odd: { type: Boolean, default: false },
        even: { type: Boolean, default: false },
        red2: { type: Boolean, default: false },
        red3: { type: Boolean, default: false },
        red4: { type: Boolean, default: false },
        white3: { type: Boolean, default: false },
        white4: { type: Boolean, default: false },
    },
    { _id: false }
);

const Schema = new mongoose.Schema({
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Date, default: new Date() },
});

Schema.plugin(autoIncrement.MongooseAutoIncrementID.plugin, { modelName, field: "id" });

export default mongoose.model(modelName, Schema);
