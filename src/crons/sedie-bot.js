import { helpers } from "sc-common";
import { Constants, Table } from "sc-game-base";

import constants from "../constants";

export default class SedieBot extends Table.Crons.TableGameBot {
    /**
     * @param {Table.TableGameDefinition} definition
     * @param {Table.TableGameData} gameData
     * @param {Core.BaseEventPublishers.BaseEventPublisher} publisher
     * @param {mongoose.Model} userInfosRepository
     * @param {mongoose.Model} tempBetsRepository
     * @param {Bots.TableGameSmartBot} tableGameSmartBot
     */

    constructor(definition, gameData, publisher, userInfosRepository, tempBetsRepository, tableGameSmartBot, logService) {
        super(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
        this.tableGameSmartBot = tableGameSmartBot;
        this.logService = logService;

        this.betChoiceRatio = {
            MainOpts: 90, //odd | even
            SubOpts: 5, //white3 | red3
            RareOpts: 1, //red4 | white4
            EqualOpts: 4, //red2
        };

        this.mainOpts = ["even", "odd"];
        this.subOpts = ["white3", "red3"];
        this.rareOpts = ["red4", "white4"];
        this.equalOpts = ["red2"];

        this.smallTicketRatio = 70;
        this.smallTickets = 0;
        this.smallTicketValueRatio = 50;
        this.resetAllBets();

        if (this.tableGameSmartBot) {
            this.tableGameSmartBot.registerRemoveAllBotEvent(this.removeAllSmartBots, this);
            this.tableGameSmartBot.registerPlaceBetEvent(this.smartBotAfterPlacingBet, this);
            this.tableGameSmartBot.registerAdjustBetEvent(this.insertOrUpdateBetForSmartBot, this);
            this.tableGameSmartBot.onError(this.logService.logError);
        }
    }

    async reset() {
        await super.reset();

        if (this.tableGameSmartBot) {
            await this.resetSmartBots();
        }
    }

    async resetSmartBots() {
        const { smartBotEnabled, choices_maxbet: maxBetOfChoices, name, smartBotGroupRatio } = this.gameData.gameConfigs;
        if (smartBotEnabled) {
            const { isExpired, smartBots } = await this.tableGameSmartBot.reset(
                { smartBotEnabled, maxBetOfChoices, smartBotGroupRatio, wholeRound: this.definition.durations.wholeRound },
                {
                    userResetFilters: { inRoom: true, inGameRoom: name },
                    userUpdateFilters: { inRoom: false, inGameRoom: "", disabled: false },
                    userUpdates: { inGameRoom: name, inRoom: true },
                    userProjections: { id: true, name: true, red: true, avatarId: true },
                }
            );

            if (isExpired && smartBots?.length > 0) {
                smartBots.forEach((smartBot) => {
                    this.addToPlayersAndPublish(smartBot);
                });

                this.maxNumberOfBots -= smartBots.length;
            }
        } else {
            await this.tableGameSmartBot.removeAll();
        }
    }

    addToPlayersAndPublish(bot) {
        this.gameData.players[bot.id] = bot;
        const payload = {
            player: {
                id: bot.id,
                name: bot.name,
                red: bot.red,
                avatarId: bot.avatarId,
                type: bot.patternId > 0 ? false : true,
            },
        };

        this.publisher.publishToAllUsersExceptSystem(Constants.Systems.Mobi, null, payload);
    }

    async resetInRoomTrackings() {
        await this.userInfosRepository.updateMany(
            { type: true, inGameRoom: this.definition.configName, patternId: 0 },
            { inRoom: false, inGameRoom: "" }
        );
    }

    async removeAllSmartBots(smartBots) {
        await Promise.all(
            smartBots.map(async (bot) => {
                await this.userInfosRepository.updateOne({ id: bot.id }, { inRoom: false, inGameRoom: "", patternId: 0 });

                this.publisher.publishToAllUsersExceptSystem(Constants.Systems.Mobi, null, { outgame: { playerId: bot.id } });

                delete this.gameData.players[bot.id];
            })
        );
    }

    resetAllBotData() {
        super.resetAllBotData();
        this.resetAllBets();
    }

    resetAllBets() {
        this.allBets = {
            odd: 0,
            even: 0,
            white3: 0,
            red2: 0,
            red3: 0,
            red4: 0,
            white4: 0,
        };

        this.smallTickets = 0;
    }

    async run() {
        await super.run();

        if (this.gameData.gameConfigs?.smartBotEnabled && this.gameData.remainingTime > this.definition.durations.lockingBet) {
            await this.tableGameSmartBot.run(this.gameData.roundId, this.gameData.remainingTime);
        }
    }

    getBetChoice(bot) {
        const totalBotBet = this.getAllBetAmount();

        const betChoiceRatios = [
            {
                group: this.mainOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.mainOpts) * 100) / totalBotBet < this.betChoiceRatio.MainOpts,
            },
            {
                group: this.subOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.subOpts) * 100) / totalBotBet < this.betChoiceRatio.SubOpts,
            },
            {
                group: this.rareOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.rareOpts) * 100) / totalBotBet < this.betChoiceRatio.RareOpts,
            },
            {
                group: this.equalOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.equalOpts) * 100) / totalBotBet < this.betChoiceRatio.EqualOpts,
            },
        ];

        const underRatioGroups = helpers.arrayHelper.shuffle(betChoiceRatios.filter((data) => data.underBetRatio));

        const choice =
            underRatioGroups.length > 0
                ? this.getRandomChoiceFromGroup(underRatioGroups[0].group)
                : this.getRandomChoiceFromGroup(this.mainOpts);

        const previousUniqueChoices = bot.choices.filter((betChoice) => this.mainOpts.includes(betChoice));

        return previousUniqueChoices.length > 0 ? previousUniqueChoices[0] : choice;
    }

    getMaxBet(bot, choice) {
        const gameConfigs = this.gameData.gameConfigs;
        const minBet = this.getMinBet();
        const isSmallTicket = this.totalTickets === 0 ? true : (this.smallTickets * 100) / this.totalTickets < this.smallTicketRatio;
        let maxBet = Math.min(gameConfigs.choices_maxbet[choice], gameConfigs.bot_maxbet);

        const maxBetOfSmallTicket = Math.min(minBet * this.smallTicketValueRatio, maxBet);

        if (this.rareOpts.includes(choice)) {
            maxBet = Math.min(minBet * 10, gameConfigs.bot_maxbet * 0.2, gameConfigs.choices_maxbet[choice]);
            const totalAmountOnRateOpts = this.getTotalAmountOfBotOnChoiceGroup(bot, this.rareOpts);

            if (totalAmountOnRateOpts > 0) {
                maxBet -= totalAmountOnRateOpts;
            }
        }

        if (this.subOpts.includes(choice)) {
            const totalBetOnSubOpt = this.getTotalAmountOnChoiceGroup(this.subOpts);

            maxBet = isSmallTicket
                ? Math.min(maxBetOfSmallTicket, gameConfigs.bot_maxbet * 0.2, gameConfigs.choices_maxbet[choice])
                : Math.min(
                      gameConfigs.bot_maxbet * 0.5,
                      (this.getAllBetAmount() * this.betChoiceRatio.SubOpts) / 100 - totalBetOnSubOpt,
                      gameConfigs.choices_maxbet[choice]
                  );
        }

        if (this.equalOpts.includes(choice)) {
            const totalBet = this.getTotalAmountOnChoiceGroup(this.equalOpts);

            maxBet = isSmallTicket
                ? Math.min(maxBetOfSmallTicket, gameConfigs.bot_maxbet * 0.2, gameConfigs.choices_maxbet[choice])
                : Math.min(
                      gameConfigs.bot_maxbet * 0.5,
                      (this.getAllBetAmount() * this.betChoiceRatio.EqualOpts) / 100 - totalBet,
                      gameConfigs.choices_maxbet[choice]
                  );
        }

        if (this.mainOpts.includes(choice)) {
            maxBet = isSmallTicket ? maxBetOfSmallTicket : maxBet;
        }

        return Math.max(maxBet, minBet);
    }

    getRandomChoiceFromGroup(group) {
        return this.chance.pickone(group);
    }

    getTotalAmountOnChoiceGroup(choices) {
        let total = 0;
        choices.forEach((choice) => (total += this.allBets[choice]));

        return total;
    }

    getTotalAmountOfBotOnChoiceGroup(bot, choices) {
        let total = 0;
        choices.forEach((choice) => (total += bot.betOnChoices[choice]));

        return total;
    }

    getAllBetAmount() {
        let total = 0;
        this.definition.choices.forEach((choice) => (total += this.allBets[choice]));

        return total;
    }

    isSmallTicket(amount) {
        return amount < this.getMinBet() * this.smallTicketValueRatio;
    }

    updateBotInRoomData(bot, choice, amount, balance) {
        super.updateBotInRoomData(bot, choice, amount, balance);

        this.allBets[choice] = this.allBets[choice] ? this.allBets[choice] + amount : amount;
        this.smallTickets += this.isSmallTicket(amount) ? 1 : 0;
    }

    convertAmountToChip(amount) {
        const chipList = constants.chips.filter((chip) => amount / chip >= 1);

        return chipList.length > 0 ? chipList[0] : this.getMinBet();
    }

    getTotalBetAmount(currentBet) {
        return currentBet ? this.definition.choices.reduce((total, choice) => total + currentBet[choice], 0) : 0;
    }

    smartBotAfterPlacingBet(bot, choice, amount, balance) {
        if (this.gameData.players[bot.id]) {
            this.gameData.players[bot.id].red = balance;
        }

        this.updateTotalBetsAndChips(choice, amount);
        this.updateBalanceAndPublishBetPayload(bot.id, choice, amount, balance);
    }

    async insertOrUpdateBetForSmartBot(bot, choice, amount) {
        const currentBet = await this.tempBetsRepository.findOne({ uid: bot.id, phien: this.gameData.roundId }).lean().exec();

        await this.insertOrUpdateBet(bot, choice, amount, currentBet);
    }
}
