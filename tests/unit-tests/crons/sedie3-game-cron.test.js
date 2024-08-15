import Chance from "chance";
import { Core } from "sc-game-base";

import SeDie3GameCron from "../../../src/crons/sedie3-game-cron";

describe("isStartingTime tests", () => {
    const gameData = new Core.GameData();
    gameData.remainingTime = 20;
    gameData.gameConfigs = {
        enabled: true,
        minbet: 1,
        maxbet: 1000,
        choices_maxbet: {
            choice01: 200,
        },
    };

    const gameDefinition = new Core.GameDefinition({
        choices: ["choice01"],
        durations: {
            wholeRound: 39,
            placingBets: 30,
            lockingBet: 3,
            shakeThePlateDuration: 2,
        },
    });

    const chance = new Chance();

    describe("when remainingTime equals placingBets + shakeThePlateDuration", () => {
        it("should return true", () => {
            // arrange
            gameData.remainingTime = gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration;
            const cron = new SeDie3GameCron(gameDefinition, gameData);

            // act
            var result = cron.isStartingTime(gameData.remainingTime, gameDefinition.durations);

            // assert
            expect(result).toBeTrue();
        });
    });

    describe("when remainingTime does not equal placingBets + shakeThePlateDuration", () => {
        it("should return false", () => {
            // arrange
            gameData.remainingTime = chance.integer({
                min: gameDefinition.durations.lockingBet,
                max: gameDefinition.durations.placingBets,
            });
            const cron = new SeDie3GameCron(gameDefinition, gameData);

            // act
            var result = cron.isStartingTime(gameData.remainingTime, gameDefinition.durations);

            // assert
            expect(result).toBeFalse();
        });
    });
});
