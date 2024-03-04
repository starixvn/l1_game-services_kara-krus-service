import Chance from "chance";
import { stub, stubMongoose } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import { logger } from "sc-common";
import { Table } from "sc-game-base";
import { BaseEventPublisher } from "sc-game-base/src/core/event-publishers";
import { TableGameBot } from "sc-game-base/src/table/crons";

import constants from "../../../src/constants";
import SedieBot from "../../../src/crons/sedie-bot";
import gameSettings from "../../../src/game-settings";
import { generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

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
const userInfosRepository = stubMongoose(mongoose.Model);
/** @type {mongoose.Model}*/
const tempBetsRepository = stubMongoose(mongoose.Model);
const publisher = new BaseEventPublisher(definition.name, gameData);

const tableSmartBot = {
    registerRemoveAllBotEvent: jest.fn(),
    registerPlaceBetEvent: jest.fn(),
    registerAdjustBetEvent: jest.fn(),
    onError: jest.fn(),
    removeAll: jest.fn(),
};
const logService = stub(logger);

const chance = new Chance();

describe("SedieBot tests", () => {
    describe("when after initialize", () => {
        it("all bet amount of choices should be zero", () => {
            // arrange

            // act
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

            // assert
            expect(bot.allBets).toEqual(constants.resetTotalBets);
        });
    });

    describe("when after initialize with smartbot", () => {
        it("all bet amount of choices should be zero", () => {
            // arrange

            // act
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository, tableSmartBot, logService);

            // assert
            expect(bot.allBets).toEqual(constants.resetTotalBets);
        });
    });

    describe("reset", () => {
        it("should call super.reset", async () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            jest.spyOn(TableGameBot.prototype, "reset");

            // act
            await bot.reset();

            // assert
            expect(TableGameBot.prototype.reset).toHaveBeenCalled();
        });
    });

    describe("run", () => {
        it("should call super.run", async () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            jest.spyOn(TableGameBot.prototype, "run");

            // act
            await bot.run();

            // assert
            expect(TableGameBot.prototype.run).toHaveBeenCalled();
        });
    });

    describe("resetAllBotData", () => {
        it("should call super.resetAllBotData", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            jest.spyOn(TableGameBot.prototype, "resetAllBotData");

            // act
            bot.resetAllBotData();

            // assert
            expect(TableGameBot.prototype.resetAllBotData).toHaveBeenCalled();
        });
    });

    describe("resetInRoomTrackings", () => {
        it("should call userInfosRepository.updateMany", async () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            jest.spyOn(userInfosRepository, "updateMany");

            // act
            await bot.resetInRoomTrackings();

            // assert
            expect(userInfosRepository.updateMany).toHaveBeenCalledWith(
                { type: true, inGameRoom: definition.configName, patternId: 0 },
                { inRoom: false, inGameRoom: "" }
            );
        });
    });

    describe("getAllBetAmount", () => {
        it("should return sum of bot bet amount", () => {
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
    });

    describe("isSmallTicket test", () => {
        describe("when amount less than minBet * smallTicketValueRatio", () => {
            it("should return true", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                const randomAmount = chance.integer({ min: bot.getMinBet(), max: bot.getMinBet() * bot.smallTicketValueRatio - 1 });

                // act
                const result = bot.isSmallTicket(randomAmount);

                // assert
                expect(result).toBeTrue();
            });
        });

        describe("amount greater than minBet * smallTicketValueRatio", () => {
            it("should return false", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                const randomAmount = chance.integer({
                    min: bot.getMinBet() * bot.smallTicketValueRatio,
                    max: gameData.gameConfigs.bot_maxbet,
                });

                // act
                const result = bot.isSmallTicket(randomAmount);

                // assert
                expect(result).toBeFalse();
            });
        });
    });

    describe("updateBotInRoomData test", () => {
        it("should call super.updateBotInRoomData", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            jest.spyOn(TableGameBot.prototype, "updateBotInRoomData").mockImplementationOnce(jest.fn());

            // act
            bot.updateBotInRoomData({}, chance.pickone(bot.mainOpts), chance.integer(), chance.integer());

            // assert
            expect(TableGameBot.prototype.updateBotInRoomData).toHaveBeenCalled();
        });

        it("should update small tickets count", () => {
            // arrange
            jest.spyOn(TableGameBot.prototype, "updateBotInRoomData").mockImplementationOnce(jest.fn());
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const randomAmount = chance.integer({ min: bot.getMinBet(), max: bot.getMinBet() * bot.smallTicketValueRatio - 1 });
            const choice = chance.pickone(bot.mainOpts);

            // act
            bot.updateBotInRoomData({}, choice, randomAmount, 1000);

            // assert
            expect(bot.smallTickets).toEqual(1);
        });

        it("should update allBets", () => {
            // arrange
            jest.spyOn(TableGameBot.prototype, "updateBotInRoomData").mockImplementationOnce(jest.fn());
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const randomAmount = chance.integer({ min: bot.getMinBet(), max: bot.getMinBet() * bot.smallTicketValueRatio - 1 });
            const choice = chance.pickone(bot.mainOpts);

            // act
            bot.updateBotInRoomData({}, choice, randomAmount, 1000);

            // assert
            expect(bot.allBets[choice]).toEqual(randomAmount);
        });
    });

    describe("convertAmountToChip test", () => {
        it("should return correct chip", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

            // act
            const chip = bot.convertAmountToChip(50);

            // assert
            expect(chip).toBe(50);
        });

        it("should return correct chip if amount nearby", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

            // act
            const chip = bot.convertAmountToChip(70);

            // assert
            expect(chip).toBe(50);
        });

        it("should return minBet if amount less than minBet", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);

            // act
            const chip = bot.convertAmountToChip(0.5);

            // assert
            expect(chip).toBe(bot.getMinBet());
        });
    });

    describe("getTotalBetAmount test", () => {
        it("should return correct amount", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const randomAmount = chance.integer({ min: bot.getMinBet(), max: bot.getMinBet() * bot.smallTicketValueRatio - 1 });
            const choice = chance.pickone(bot.mainOpts);
            const currentBet = constants.resetTotalBets;
            currentBet[choice] = randomAmount;

            // act
            const totalAmount = bot.getTotalBetAmount(currentBet);

            // assert
            expect(totalAmount).toBe(randomAmount);
        });
    });

    describe("getMaxBet test", () => {
        describe("when not reach smallTicketRatio", () => {
            it("should return the max value of small ticket", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                const betChoice = chance.pickone(bot.mainOpts);

                // act
                const maxBet = bot.getMaxBet(null, betChoice);

                // assert
                expect(maxBet).toEqual(bot.getMinBet() * bot.smallTicketValueRatio);
            });
        });

        describe("when betChoice is mainOpts and already passed smallTicketRatio", () => {
            it("should return the lowest-valued between bot_maxbet and choice_maxbet ", () => {
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
        });

        describe("when betChoice is subOpts and passed smallTicketRatio", () => {
            it("should return totalBetAmount * subOptRatio ", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                bot.smallTickets = 1;
                bot.totalTickets = 1;
                const totalBetAmount = 1000;
                const expected = (totalBetAmount * bot.betChoiceRatio.SubOpts) / 100;
                jest.spyOn(bot, "getAllBetAmount").mockReturnValueOnce(totalBetAmount);
                const betChoice = chance.pickone(bot.subOpts);

                // act
                const maxBet = bot.getMaxBet(null, betChoice);

                // assert
                expect(maxBet).toEqual(expected);
            });
        });

        describe("when betChoice is equalOpts and passed smallTicketRatio", () => {
            it("should return totalBetAmount * equalOptRatio", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                bot.smallTickets = 1;
                bot.totalTickets = 1;
                const totalBetAmount = 1000;
                const expected = (totalBetAmount * bot.betChoiceRatio.EqualOpts) / 100;
                jest.spyOn(bot, "getAllBetAmount").mockReturnValueOnce(totalBetAmount);
                const betChoice = chance.pickone(bot.equalOpts);

                // act
                const maxBet = bot.getMaxBet(null, betChoice);

                // assert
                expect(maxBet).toEqual(expected);
            });
        });

        describe("when betChoice is rareOpts and passed smallTicketRatio", () => {
            it("should return minBet * 10", () => {
                // arrange
                const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
                bot.smallTickets = 1;
                bot.totalTickets = 1;
                const totalBetAmount = 1000;
                const expected = gameData.gameConfigs.minbet * 10;
                jest.spyOn(bot, "getAllBetAmount").mockReturnValueOnce(totalBetAmount);
                const betChoice = chance.pickone(bot.rareOpts);

                // act
                const maxBet = bot.getMaxBet({ betOnChoices: [] }, betChoice);

                // assert
                expect(maxBet).toEqual(expected);
            });
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

    describe("addToPlayersAndPublish test", () => {
        it("should add to players", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const botPlayer = { id: "23" };
            jest.spyOn(publisher, "publishToAllUsersExceptSystem");

            // act
            bot.addToPlayersAndPublish(botPlayer);

            // assert
            expect(gameData.players[botPlayer.id]).toEqual(botPlayer);
        });

        it("should publish to all users", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const botPlayer = { id: "23" };
            jest.spyOn(publisher, "publishToAllUsersExceptSystem");

            // act
            bot.addToPlayersAndPublish(botPlayer);

            // assert
            expect(publisher.publishToAllUsersExceptSystem).toHaveBeenCalled();
        });
    });

    describe("smartBotAfterPlacingBet test", () => {
        it("should call super to update bets ", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const botPlayer = { id: "23" };
            gameData.players[botPlayer.id] = botPlayer;
            jest.spyOn(TableGameBot.prototype, "updateTotalBetsAndChips");
            jest.spyOn(TableGameBot.prototype, "updateBalanceAndPublishBetPayload");

            // act
            bot.smartBotAfterPlacingBet(botPlayer, chance.pickone(bot.equalOpts), 20, 1000);

            // assert
            expect(TableGameBot.prototype.updateTotalBetsAndChips).toHaveBeenCalled();
        });

        it("should  publish payload", () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const botPlayer = { id: "23" };
            gameData.players[botPlayer.id] = botPlayer;
            jest.spyOn(TableGameBot.prototype, "updateTotalBetsAndChips");
            jest.spyOn(TableGameBot.prototype, "updateBalanceAndPublishBetPayload");

            // act
            bot.smartBotAfterPlacingBet(botPlayer, chance.pickone(bot.equalOpts), 20, 1000);

            // assert
            expect(TableGameBot.prototype.updateBalanceAndPublishBetPayload).toHaveBeenCalled();
        });
    });

    describe("insertOrUpdateBetForSmartBot test", () => {
        it("should call super.insertOrUpdateBet", async () => {
            // arrange
            const bot = new SedieBot(definition, gameData, publisher, userInfosRepository, tempBetsRepository);
            const botPlayer = { id: "23" };
            gameData.players[botPlayer.id] = botPlayer;
            jest.spyOn(TableGameBot.prototype, "insertOrUpdateBet");
            jest.spyOn(tempBetsRepository, "findOne");

            // act
            await bot.insertOrUpdateBetForSmartBot(botPlayer, chance.pickone(bot.equalOpts), 20);

            // assert
            expect(TableGameBot.prototype.insertOrUpdateBet).toHaveBeenCalled();
        });
    });
});
