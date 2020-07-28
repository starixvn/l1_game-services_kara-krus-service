import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment-reworked';

let Schema = new mongoose.Schema({
    red1: { type: Boolean, required: true },
    red2: { type: Boolean, required: true },
    red3: { type: Boolean, required: true },
    red4: { type: Boolean, required: true },
    time: { type: Date, default: new Date() },
});

Schema.plugin(autoIncrement.MongooseAutoIncrementID.plugin, { modelName: 'XocXoc_phien', field: 'id' });

export default mongoose.model('XocXoc_phien', Schema);
