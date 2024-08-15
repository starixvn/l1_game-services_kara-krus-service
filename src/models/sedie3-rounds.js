import mongoose from "mongoose";

const modelName = "sedie3_rounds";

const resultSchema = new mongoose.Schema(
    {
        red1: { type: Boolean, required: true },
        red2: { type: Boolean, required: true },
        red3: { type: Boolean, required: true },
    },
    { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
    {
        red: { type: Boolean, default: false },
        white: { type: Boolean, default: false },
        red1: { type: Boolean, default: false },
        red2: { type: Boolean, default: false },
        red3: { type: Boolean, default: false },
        white3: { type: Boolean, default: false },
    },
    { _id: false }
);

const Schema = new mongoose.Schema({
    id: { type: Number, required: true },
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Date, default: new Date() },
    exchangeRateId: { type: Number, require: true },
});

export default mongoose.model(modelName, Schema);
