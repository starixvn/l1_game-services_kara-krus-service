import { userInfos } from "sc-base-database";
import { helpers } from "sc-common";
import { BaseEventPublishers } from "sc-game-base";
import appConfigs from "../app-configs.js";
import constants from "../constants.js";
import seDieTempBetLogs from "../models/sedie-temp-betlogs.js";
import storage from "../game-data.js";

const publisher = new BaseEventPublishers.BasePublisher(storage, appConfigs.gameName);

const modRoundToChangedTopBot = 6;

let botsInRoom = [];
let maxNumberOfBots = 0;
let currentBotRatio = 0;
let changedTopBots = false;

let betChoices = { 0: "chan", 1: "le", 2: "red3", 3: "white3", 4: "red4", 5: "white4" };

let dataBot = {
    chan: 0,
    le: 0,
    red3: 0,
    red4: 0,
    white3: 0,
    white4: 0,
};

let totalBotTickets = 0;
let totalSmallBotTickets = 0;

let betChoiceRatio = {
    MainOpts: 94, //odd | even
    SubOpts: 5, //white3 | red3
    RareOpts: 1, //red4 | white4
};

const resetBots = async () => {
    const configs = storage.gameConfigs;
    if (configs.botenabled) {
        const botRatio = helpers.configHelper.getMaxBotForCurrentHour(configs);
        if (currentBotRatio != botRatio) {
            currentBotRatio = botRatio;

            const botCount = await userInfos.countDocuments({ type: true });
            maxNumberOfBots = Math.floor(botCount * currentBotRatio);

            const disabledBots = await userInfos.find({ type: true, disabled: true }).lean();
            disabledBots.forEach((bot) => removeBot(bot.id));
        }

        changedTopBots = false;
    } else {
        removeAllBots();
    }

    resetBotData();
};

const removeAllBots = () => {
    const bots = Object.values(storage.gameData.usersAndBots).filter((player) => player.type);

    bots.forEach(async (bot) => await removeBot(bot.id));

    botsInRoom = [];
    maxNumberOfBots = 0;
    currentBotRatio = 0;
};

const addBots = async (time, roundId) => {
    const configs = storage.gameConfigs;
    if (!!configs && configs.botenabled && time > constants.settlementDuration) {
        let activeBots = Object.keys(botsInRoom);
        let random = (Math.random() * 5) >> 0;

        if ((activeBots.length <= 20 || random == 3) && activeBots.length <= maxNumberOfBots) {
            //bot in
            await botIn(time);
        }

        if (activeBots.length > 20 && random == 4) {
            //bot out
            await botOut(activeBots, time, roundId);
        }

        const maxTickets = Math.floor(activeBots.length / time) + 5;
        const userBet = Math.floor(Math.random() * maxTickets + 5);

        let botsToBet = Object.values(botsInRoom).filter((t) => t.totalBet < configs.bot_maxbet && t.remainTickets > 0);
        botsToBet = helpers.arrayHelper.shuffle(botsToBet);

        for (let i = 0; i < userBet; i++) {
            let bot = botsToBet[i];

            if (!!bot) {
                await botPlaceBet(bot, roundId, time);
            }
        }
    }
};

const botIn = async (time) => {
    const botsIn = [];
    const maxBotRandom = maxNumberOfBots / time;
    const length = Math.floor(Math.random() * maxBotRandom + 1);

    const botUsers = await userInfos.find({ type: true, inRoom: false, disabled: false }, "-_id id name red avatarId type");
    let botList = helpers.arrayHelper.shuffle(botUsers);
    botList = botList.slice(0, length);

    for (let i = 0; i < botList.length; i++) {
        let bot = botList[i];

        if (!!bot) {
            await userInfos.updateOne({ id: bot.id }, { inRoom: true, inGameRoom: appConfigs.gameName });

            botsInRoom[bot.id] = bot;
            resetBot(botsInRoom[bot.id]);

            botList.splice(i, 1);
            botsIn.push(bot);
        }

        if (!storage.gameData.usersAndBots[bot.id]) {
            const payload = {
                ingame: {
                    player: {
                        id: bot.id,
                        name: bot.name,
                        red: bot.red,
                        avatarId: bot.avatarId,
                        type: bot.type,
                    },
                },
            };
            publisher.publishToAllUsers(payload);
        }

        storage.gameData.usersAndBots[bot.id] = bot;
    }
};

const botOut = async (activeBots, time, roundId) => {
    const botsOut = [];
    let maxBotRemoveRandom = activeBots.length / time;

    if (maxBotRemoveRandom < 4) {
        maxBotRemoveRandom = 4;
    }

    let length = (Math.random() * maxBotRemoveRandom) >> 0;

    for (let i = 0; i < length; i++) {
        let index = (Math.random() * activeBots.length) >> 0;

        if (!changedTopBots && roundId % modRoundToChangedTopBot == 0) {
            // change top of bots
            index = (Math.random() * 8) >> 0;
            changedTopBots = true;
        }

        let playerId = activeBots[index];
        botsOut.push(botsInRoom[playerId]);

        await removeBot(playerId);
        delete botsInRoom[playerId];
    }

    return botsOut;
};

const removeBot = async (botId) => {
    await userInfos.updateOne({ id: botId }, { inRoom: false, inGameRoom: "" });

    publisher.publishToAllUsers({ outgame: { playerId: botId } });

    delete storage.gameData.usersAndBots[botId];
};

const botPlaceBet = async (bot, roundId, time) => {
    const box = getBetChoice(bot);
    const isSmallTicket = totalBotTickets == 0 ? Math.floor(Math.random() * 2) : (totalSmallBotTickets * 100) / totalBotTickets < 70;
    const maxBet = getMaxBet(isSmallTicket, box, bot);
    const minBet = getMinBet();

    let betAmount = maxBet > 0 ? helpers.numberHelper.getRandomNumberStep5(minBet, maxBet, true) : 0;

    if (betAmount > 0 && time > constants.settlementDuration) {
        const betChips = helpers.chipHelper.getRandomChips(betAmount);

        for (let index = 0; index < betChips.length; index++) {
            const chip = betChips[index];
            if (chip > 0) {
                betAmount = helpers.chipHelper.chipList[index];

                break;
            }
        }

        let currentTotalBet = 0;
        const currentBet = await seDieTempBetLogs.findOne({ uid: bot.id, phien: roundId, red: true });
        if (!!currentBet) {
            constants.choices.forEach((choice) => {
                currentTotalBet += currentBet[choice];
            });
        }
        if (!currentBet || currentTotalBet + betAmount <= maxBet) {
            let user = await userInfos.findOne({ id: bot.id }, "red");
            if (betAmount > 0 && user && user.red > betAmount) {
                user.red -= betAmount;
                await user.save();

                if (currentBet) {
                    currentBet[box] += betAmount;
                    await currentBet.save();
                } else {
                    const update = {};
                    update[box] = betAmount;

                    let create = {
                        uid: bot.id,
                        name: bot.name,
                        phien: roundId,
                        red: true,
                        time: new Date(),
                    };

                    await seDieTempBetLogs.updateOne(
                        { uid: bot.id, phien: roundId, red: true },
                        { $inc: update, $setOnInsert: create },
                        { upsert: true, setDefaultsOnInsert: true }
                    );
                }

                storage.gameData.totalBets[box] += betAmount;
                dataBot[box] += betAmount;

                if (!!botsInRoom[bot.id]) {
                    botsInRoom[bot.id].totalBet += betAmount;
                    botsInRoom[bot.id].choices.push(box);
                    botsInRoom[bot.id].red = user.red;
                    botsInRoom[bot.id].remainTickets--;
                    botsInRoom[bot.id].betOnChoices[box] += betAmount;
                }

                if (storage.gameData.usersAndBots[bot.id]) {
                    storage.gameData.usersAndBots[bot.id].red = user.red;
                }

                if (isSmallTicket) {
                    totalSmallBotTickets += 1;
                }

                totalBotTickets += 1;

                const payload = {
                    chip: { playerId: bot.id, box: box, cuoc: betAmount, red: user.red },
                };
                publisher.publishToAllUsers(payload);
            }
        }
    }
};

const getBetChoice = (bot) => {
    let box;
    let betChoice = 0;
    const totalBotBet = dataBot.chan + dataBot.le + dataBot.red3 + dataBot.red4 + dataBot.white3 + dataBot.white4;
    const totalBotBetMain = dataBot.chan + dataBot.le;

    let isMain = totalBotBet == 0 ? true : (totalBotBetMain * 100) / totalBotBet < betChoiceRatio.MainOpts;
    let isEvent = false;

    if (isMain) {
        betChoice = Math.floor(Math.random() * 2);
    } else {
        let totalBetSubEvent = dataBot.red3 + dataBot.white3;
        isEvent = (totalBetSubEvent * 100) / totalBotBet < betChoiceRatio.SubOpts;
        betChoice = isEvent ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 4;
    }

    box = betChoices[betChoice];

    if (!!bot) {
        if (box == "chan" && bot.choices.indexOf("le") != -1) {
            box = "le";
        } else if (box == "le" && bot.choices.indexOf("chan") != -1) {
            box = "chan";
        }
    }

    return box;
};

const getMaxBet = (isSmallTicket, box, bot) => {
    const configs = storage.gameConfigs;
    const converted = helpers.configHelper.convertBetChoiceName(box);
    const configMaxPerChoice = configs.choices_maxbet[converted];

    let maxBet = Math.min(configMaxPerChoice, configs.bot_maxbet);

    const minBet = getMinBet();
    const maxBetOfSmallTicket = Math.min(minBet * 50, maxBet);
    const totalBotBet = dataBot.chan + dataBot.le + dataBot.red3 + dataBot.white3 + dataBot.red4 + dataBot.white4;

    maxBet = isSmallTicket ? maxBetOfSmallTicket : maxBet;

    if (isRareOpt(box)) {
        maxBet = Math.min(minBet * 10, configs.bot_maxbet * 0.2, configMaxPerChoice);

        if (!!bot && bot.betOnChoices["red4"] + bot.betOnChoices["white4"] > 0) {
            maxBet = maxBet - bot.betOnChoices["red4"] - bot.betOnChoices["white4"];
        }
    }

    if (isSubOpt(box)) {
        const totalBetOnSubOpt = dataBot.red3 + dataBot.white3;

        maxBet = isSmallTicket
            ? Math.min(minBet * 50, configs.bot_maxbet * 0.2, configMaxPerChoice)
            : Math.min(configs.bot_maxbet * 0.5, (totalBotBet * betChoiceRatio.SubOpts) / 100 - totalBetOnSubOpt, configMaxPerChoice);
    }

    return Math.max(maxBet, minBet);
};

const getMinBet = () => {
    const defaultMinBet = 1;

    return Math.max(defaultMinBet, storage.gameConfigs.minbet);
};

const isSubOpt = (box) => {
    return box == "white3" || box == "red3";
};

const isRareOpt = (box) => {
    return box == "white4" || box == "red4";
};

const resetBotData = () => {
    Object.keys(botsInRoom).forEach((id) => resetBot(botsInRoom[id]));

    totalBotTickets = 0;
    totalSmallBotTickets = 0;

    dataBot = { ...constants.resetTotalBets };
};

const resetBot = (bot) => {
    if (!!bot) {
        bot.totalBet = 0;
        bot.remainTickets = Math.floor(Math.random() * 3 + 1 + 1);
        bot.choices = [];
        bot.betOnChoices = { ...constants.resetTotalBets };
    }
};

const updateBotBalance = (botId, red) => {
    if (!!botsInRoom[botId]) {
        botsInRoom[botId].red = red;
    }
};

export { resetBots, addBots, updateBotBalance };
