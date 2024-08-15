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

import { Core } from "sc-game-base";
import appConfigs from "../../../src/app-configs.IGT";
import { SeDie3Bets, SeDie3Rounds } from "../../../src/models";
import { currencyData, game, gameConfig, promotions, rounds, userBetData } from "./test-data";

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

const getUserId = async (playerId) => {
    const user = await users.findOne({ "local.playerId": playerId }, { _id: true }).lean();
    return user._id.toString();
};

const createRounds = async () => {
    return SeDie3Rounds.insertMany(rounds);
};

const createUserBetData = async () => {
    const userId = await getUserId(normalUser.playerId);
    const betData = userBetData(userId);
    return SeDie3Bets.insertMany(betData);
};

const createPromotionData = async () => {
    await Core.Models.Promotions.insertMany(promotions);
};

createTestData();
