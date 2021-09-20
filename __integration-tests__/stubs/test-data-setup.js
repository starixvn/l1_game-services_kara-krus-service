import mongoose from "mongoose";
import { middlewares } from "sc-common";

import configs from "../../src/app-configs";
import { createGameConfig } from "./game-config-stubs";
import { gameConfig, user } from "./test-data";
import { createDummyUser } from "./user-stubs";

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

    console.log("Create game config & dummy user for testing successfully!");

    process.exit(0);
};

createTestData();
