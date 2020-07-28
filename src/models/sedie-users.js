import mongoose from 'mongoose';

let Schema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    red: { type: Number, default: 0 },
    red_lost: { type: Number, default: 0 },
    redPlay: { type: Number, default: 0 },
    xu: { type: Number, default: 0 },
    xu_lost: { type: Number, default: 0 },
    xuPlay: { type: Number, default: 0 },
    thuong: { type: Number, default: 0 },
});

export default mongoose.model('XocXoc_users', Schema);
