import { middlewares } from 'sc-common';
import mongoose from 'mongoose';

export default async (config) => {
    await middlewares.database.configureDatabase(mongoose, config);
};
