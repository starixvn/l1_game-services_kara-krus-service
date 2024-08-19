import { helpers } from "sc-common";
import { Constants, Table } from "sc-game-base";

import constants from "../constants";

export default class SeDie3Bot extends Table.Crons.TableGameBot {
    /**
     * @param {Table.TableGameDefinition} definition
     * @param {Table.TableGameData} gameData
     * @param {Core.BaseEventPublishers.BaseEventPublisher} publisher
     * @param {mongoose.Model} userInfosRepository
     * @param {mongoose.Model} tempBetsRepository
     */

    constructor(definition, gameData, publisher, userInfosRepository, tempBetsRepository, logService) {
        super(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
        this.logService = logService;

        this.betChoiceRatio = {
            MainOpts: 94, // red | white
            SubOpts: 5, // red1 | red2
            RareOpts: 1, // red3 | white3
        };

        this.mainOpts = ["red", "white"];
        this.subOpts = ["red1", "red2"];
        this.rareOpts = ["red3", "white3"];

        this.smallTicketRatio = 70;
        this.smallTickets = 0;
        this.smallTicketValueRatio = 50;
        this.resetAllBets();
    }

    addToPlayersAndPublish(bot) {
        this.gameData.players[bot.id] = bot;
        const payload = {
            player: {
                id: bot.id,
                name: bot.name,
                red: bot.red,
                avatarId: bot.avatarId,
                type: bot.patternId <= 0,
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

    resetAllBotData() {
        super.resetAllBotData();
        this.resetAllBets();
    }

    resetAllBets() {
        this.allBets = {
            red: 0,
            white: 0,
            white3: 0,
            red1: 0,
            red2: 0,
            red3: 0,
        };

        this.smallTickets = 0;
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
}
