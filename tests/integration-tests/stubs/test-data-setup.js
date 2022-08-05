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

import appConfigs from "../../../src/app-configs.IGT";
import { SedieBets, SeDieRounds } from "../../../src/models";
import { currencyData, game, gameConfig, rounds, userBetData, promotions } from "./test-data";
import { Core } from "sc-game-base";

const connectDatabase = async () => {
    console.log("connect database");
    await middlewares.database.configureDatabase(mongoose, appConfigs.database);

    await clearAllData();
};

const clearAllData = async () => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.remove();
    }
};

export const createTestData = async () => {
    await connectDatabase();
    await createExchangeRate();
    await createGameConfig(gameConfig);
    const partnerConfig = await createPartnerConfig(game.id);

    const currency = await createDummyCurrency(partnerConfig.partnerId, currencyData.code, currencyData.name);
    await createCurrencyGroupGames(currency.groupId, game.id, gameConfig);
    await createDummyUsers(currency);
    await createRounds();
    await createUserBetData();
    await createPromotionData();

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

const createPromotionData = async () => {
    await Core.Models.Promotions.insertMany(promotions);
};

createTestData();
