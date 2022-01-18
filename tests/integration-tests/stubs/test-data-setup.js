import mongoose from "mongoose";
import { users } from "sc-base-database";
import { middlewares } from "sc-common";
import {
    createCurrencyGroupGames,
    createDummyCurrency,
    createDummyUsers,
    createExchangeRate,
    createGameConfig,
    createPartnerConfig,
    normalUser,
} from "sc-game-service-integration-utils";

import configs from "../../../src/app-configs";
import { SedieBets, SeDieRounds } from "../../../src/models";
import { currencyData, game, gameConfig, rounds, userBetData } from "./test-data";

const connectDatabase = async () => {
    console.log("connect database");
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
    await createExchangeRate();
    await createGameConfig(gameConfig);
    const partnerConfig = await createPartnerConfig(game.id);
    const currency = await createDummyCurrency(partnerConfig.partnerId, currencyData.code, currencyData.name);
    await createCurrencyGroupGames(currency.groupId, game.id, gameConfig);
    await createDummyUsers(currency);
    await createRounds();
    await createUserBetData();

    console.log("Create exchange rate, game config & dummy user for testing successfully!");

    process.exit(0);
};

const getUserId = async (memberId) => {
    const user = await users.findOne({ "local.memberId": memberId }, { _id: true }).lean();
    return user._id.toString();
};

const createRounds = async () => {
    return SeDieRounds.insertMany(rounds);
};

const createUserBetData = async () => {
    const userId = await getUserId(normalUser.memberId);
    const betData = userBetData(userId);
    return SedieBets.insertMany(betData);
};

createTestData();
