import mongoose from "mongoose";

const modelName = "karakrus_rounds";

const resultSchema = new mongoose.Schema(
    {
        head1: { type: Boolean, required: true },
        head2: { type: Boolean, required: true },
        head3: { type: Boolean, required: true },
    },
    { _id: false }
);

const settlementResultSchema = new mongoose.Schema(
    {
        kara: { type: Boolean, default: false },
        krus: { type: Boolean, default: false },
        head1: { type: Boolean, default: false },
        head2: { type: Boolean, default: false },
        head3: { type: Boolean, default: false },
        tail3: { type: Boolean, default: false },
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
