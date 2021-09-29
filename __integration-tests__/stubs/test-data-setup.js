import mongoose from "mongoose";
import { middlewares } from "sc-common";
import { createDummyUser, createGameConfig } from "sc-game-service-integration";

import configs from "../../src/app-configs";
import SeDieRoundModel from "../../src/models/sedie-rounds";
import { gameConfig, rounds, user } from "./test-data";

const connectDatabase = async () => {
    await middlewares.database.configureDatabase(mongoose, configs.database);
    await clearAllData();
};

const clearAllData = async () => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.remove();
    }
};

const createTestData = async () => {
    await connectDatabase();
    await createGameConfig(gameConfig);
    await createDummyUser(user.id, user.name, user.currency);
    await createRounds();

    console.log("Create game config & dummy user for testing successfully!");

    process.exit(0);
};

const createRounds = async () => {
    return SeDieRoundModel.insertMany(rounds);
};

createTestData();
