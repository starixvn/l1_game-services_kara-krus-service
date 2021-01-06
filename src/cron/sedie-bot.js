import { helpers } from "sc-common";
import { Table } from "sc-game-base";

import constants from "./../constants";

export default class SedieBot extends Table.TableGameBot {
    constructor(definition, gameData) {
        super(definition, gameData, null);

        this.betChoiceRatio = {
            MainOpts: 90, //odd | even
            SubOpts: 5, //white3 | red3
            RareOpts: 1, //red4 | white4
            EqualOpts: 4, //red2
        };

        this.mainOpts = ["even", "odd"];
        this.subOpts = ["white3", "red3", "red2"];
        this.rareOpts = ["red4", "white4"];
        this.equalOpts = ["red2"];

        this.smallTicketRatio = 70;
        this.smallTickets = 0;
        this.resetAllBets();
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

        const maxBetOfSmallTicket = Math.min(minBet * 50, maxBet);

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
        const randomIndex = (Math.random() * group.length) >> 0;
        return group[randomIndex];
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
        return amount < this.getMinBet() * 50;
    }

    updateBotInRoomData(bot, choice, amount, balance) {
        super.updateBotInRoomData(bot, choice, amount, balance);

        this.allBets[choice] = this.allBets[choice] ? this.allBets[choice] + amount : amount;
        this.smallTickets += this.isSmallTicket(amount) ? 1 : 0;
    }

    convertAmountToChip(amount) {
        const chipList = constants.chips.filter((chip) => amount % chip === 0);

        return chipList.length > 0 ? chipList[0] : this.getMinBet();
    }

    getTotalBetAmount(currentBet) {
        return currentBet ? this.definition.choices.reduce((total, choice) => total + currentBet[choice], 0) : 0;
    }
}
