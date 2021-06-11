import Chance from "chance";
import { stubMongooseModelStupidly } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { Table } from "sc-game-base";
import { BaseEventPublisher } from "sc-game-base/src/core/event-publishers";
import { TableGameBot } from "sc-game-base/src/table/crons";

import constants from "../../constants";
import gameSettings from "../../game-settings";
import { generateResult, getSettlementResult } from "../../helpers/result-helper";
import SedieBot from "../sedie-bot";

const definition = new Table.TableGameDefinition(gameSettings, generateResult, getSettlementResult);
const gameData = new Table.TableGameData(gameSettings.durations.wholeRound, constants.resetTotalBets);
gameData.gameConfigs = {
    choices_maxbet: {
        even: 2000,
        odd: 2000,
        red3: 1000,
        white3: 1000,
        red4: 100,
        white4: 100,
        red2: 2000,
    },
    minbet: 1,
    bot_maxbet: 1000,
};

/** @type {mongoose.Model}*/
const userInfosRepository = stubMongooseModelStupidly(mongoose.Model);
/** @type {mongoose.Model}*/
const tempBetsRepository = stubMongooseModelStupidly(mongoose.Model);
const publisher = new BaseEventPublisher(definition.name, gameData);
const chance = new Chance();

describe("SedieBot tests", () => {
    it("all bet amount of choices should be zero after initialize", () => {
        // arrange

        // act
        const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

        // assert
        expect(bot.allBets).toEqual(constants.resetTotalBets);
    });

    it("reset should call super.reset", async () => {
        // arrange
        const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
        spyOn(TableGameBot.prototype, "reset");

        // act
        await bot.reset();

        // assert
        expect(TableGameBot.prototype.reset).toHaveBeenCalled();
    });

    it("getAllBetAmount should return sum of bot bet amount", () => {
        // arrange
        const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
        let expected = 0;

        definition.choices.forEach((choice) => {
            const randomAmount = chance.integer();
            bot.allBets[choice] = randomAmount;
            expected += randomAmount;
        });

        // act
        const totalBetAmount = bot.getAllBetAmount();

        // assert
        expect(totalBetAmount).toEqual(expected);
    });

    describe("getMaxBet test", () => {
        it("should return the max value of small ticket if not reach smallTicketRatio", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const betChoice = chance.pickone(bot.mainOpts);

            // act
            const maxBet = bot.getMaxBet(null, betChoice);

            // assert
            expect(maxBet).toEqual(bot.getMinBet() * bot.smallTicketValueRatio);
        });

        it("betChoice is mainOpts should return the lowest-valued between bot_maxbet and choice_maxbet if already passed smallTicketRatio", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            bot.smallTickets = 1;
            bot.totalTickets = 1;
            const betChoice = chance.pickone(bot.mainOpts);

            // act
            const maxBet = bot.getMaxBet(null, betChoice);

            // assert
            expect(maxBet).toEqual(gameData.gameConfigs.bot_maxbet);
        });

        it("betChoice is subOpts should return totalBetAmount * subOptRatio if already passed smallTicketRatio", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            bot.smallTickets = 1;
            bot.totalTickets = 1;
            const totalBetAmount = 1000;
            const expected = (totalBetAmount * bot.betChoiceRatio.SubOpts) / 100;
            spyOn(bot, "getAllBetAmount").and.returnValue(totalBetAmount);
            const betChoice = chance.pickone(bot.subOpts);

            // act
            const maxBet = bot.getMaxBet(null, betChoice);

            // assert
            expect(maxBet).toEqual(expected);
        });

        it("betChoice is equalOpts should return totalBetAmount * equalOptRatio if already passed smallTicketRatio", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            bot.smallTickets = 1;
            bot.totalTickets = 1;
            const totalBetAmount = 1000;
            const expected = (totalBetAmount * bot.betChoiceRatio.EqualOpts) / 100;
            spyOn(bot, "getAllBetAmount").and.returnValue(totalBetAmount);
            const betChoice = chance.pickone(bot.equalOpts);

            // act
            const maxBet = bot.getMaxBet(null, betChoice);

            // assert
            expect(maxBet).toEqual(expected);
        });

        it("betChoice is rareOpts should return minBet * 10 if already passed smallTicketRatio", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            bot.smallTickets = 1;
            bot.totalTickets = 1;
            const totalBetAmount = 1000;
            const expected = gameData.gameConfigs.minbet * 10;
            spyOn(bot, "getAllBetAmount").and.returnValue(totalBetAmount);
            const betChoice = chance.pickone(bot.rareOpts);

            // act
            const maxBet = bot.getMaxBet({ betOnChoices: [] }, betChoice);

            // assert
            expect(maxBet).toEqual(expected);
        });
    });

    describe("getBetChoice test", () => {
        it("should return main choices when main choices have less than 90% bet amount", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

            // act
            const choice = bot.getBetChoice({ choices: [] });

            // assert
            expect(bot.mainOpts).toContain(choice);
        });
    });
});
