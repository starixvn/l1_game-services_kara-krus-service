import { Table } from "sc-game-base";
import { helpers } from "sc-common";

export default class SedieBot extends Table.TableGameBot {
    constructor(definition, gameData, publisher = null) {
        super(definition, gameData, publisher);

        this.betChoiceRatio = {
            MainOpts: 94, //odd | even
            SubOpts: 5, //white3 | red3
            RareOpts: 1, //red4 | white4
        };

        this.mainOpts = ["even", "odd"];
        this.subOpts = ["white3", "red3"];
        this.rareOpts = ["red4", "white4"];

        this.smallTicketRatio = 70;
        this.smallTickets = 0;

        resetAllBets();
    }

    async resetBots() {
        await super.resetBots();
        resetAllBets();
    }

    resetAllBets() {
        this.allBets = {
            odd: 0,
            even: 0,
            white3: 0,
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
        ];

        const underRatioGroups = helpers.arrayHelper.shuffle(betChoiceRatios.filter((data) => data.underBetRatio));

        const choice =
            underRatioGroups.length > 0 ? this.getRandomChoiceFromGroup(underRatioGroups[0]) : this.getRandomChoiceFromGroup(this.mainOpts);

        const previousUniqueChoices = bot.choices.filter((betChoice) => this.mainOpts.includes(betChoice));

        return previousUniqueChoices.length > 0 ? previousUniqueChoices[0] : choice;
    }

    getMaxBet(bot, choice) {
        const gameConfigs = super.gameData.gameConfigs;
        const isSmallTicket = super.totalTickets == 0 ? true : (this.smallTickets * 100) / super.totalTickets < this.smallTicketRatio;
        let maxBet = Math.min(gameConfigs.choices_maxbet[choice], gameConfigs.bot_maxbet);

        const maxBetOfSmallTicket = Math.min(super.getMinBet() * 50, maxBet);

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
                      this.getAllBetAmount() / 100 - totalBetOnSubOpt,
                      gameConfigs.choices_maxbet[choice]
                  );
        }

        return Math.max(maxBet, minBet);
    }

    getRandomChoiceFromGroup(group) {
        return group[(Math.random() * group.length) >> 0];
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
        super.definition.choices.forEach((choice) => (total += this.allBets[choice]));

        return total;
    }
}
