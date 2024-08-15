import Chance from "chance";
import { helpers } from "sc-common";
import { Core } from "sc-game-base";

import SeDie3PlaceBetConsumer from "../../../src/consumers/sedie3-place-bet-consumer";

describe("composeBettingTimeValidationCriteria tests", () => {
    const playerName = "nhanvat01";
    const player = {
        UID: "123",
        profile: {
            name: playerName,
            minBet: 1,
            maxBet: 500,
        },
        session: {
            currency: "US",
        },
    };

    const chance = new Chance();

    const gameData = new Core.GameData();
    gameData.ingame = {
        [playerName]: {
            name: player.profile.name,
            betTracks: {},
            betQueue: [],
        },
    };
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

    describe("when game was disabled", () => {
        it("should return placeBetNextRound notice", () => {
            // arrange
            gameData.gameConfigs.enabled = false;
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions).not.toBeEmpty();
            expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            });
        });
    });

    describe("when bet comes in settlement time", () => {
        it("should return cannotPlaceBet notice", () => {
            // arrange
            gameData.gameConfigs.enabled = true;
            gameData.remainingTime = chance.integer({
                min: gameDefinition.durations.placingBets,
                max: gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration,
            });
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions).not.toBeEmpty();
            expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.cannotPlaceBet },
            });
        });
    });

    describe("when bet comes in locking bet time", () => {
        it("should return placeBetNextRound notice", () => {
            // arrange
            gameData.gameConfigs.enabled = true;
            gameData.remainingTime = chance.integer({
                min: 0,
                max: gameDefinition.durations.lockingBet - 1,
            });
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions).not.toBeEmpty();
            expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            });
        });
    });

    describe("when bet comes in shaking plate time", () => {
        it("should return placeBetNextRound notice", () => {
            // arrange
            gameData.gameConfigs.enabled = true;
            gameData.remainingTime = chance.integer({
                min: gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration + 1,
                max: gameDefinition.durations.wholeRound,
            });
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions).not.toBeEmpty();
            expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            });
        });
    });

    describe("when roundId not match running round", () => {
        it("should return placeBetNextRound notice ", () => {
            // arrange
            gameData.roundId = 2;
            gameData.gameConfigs.enabled = true;
            gameData.remainingTime = chance.integer({
                min: gameDefinition.durations.placingBets + gameDefinition.durations.shakeThePlateDuration + 1,
                max: gameDefinition.durations.wholeRound,
            });
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions).not.toBeEmpty();
            expect(criterions.filter((x) => x.failure)[0]).toStrictEqual({
                failure: true,
                notice: { errorCode: helpers.noticeHelper.invalidBet, gameRoundId: 1 },
            });
        });
    });

    describe("when valid", () => {
        it("should not return any failures", () => {
            // arrange
            gameData.roundId = 1;
            gameData.gameConfigs.enabled = true;
            gameData.remainingTime = chance.integer({
                min: gameDefinition.durations.lockingBet + 1,
                max: gameDefinition.durations.placingBets,
            });
            const placeBetConsumer = new SeDie3PlaceBetConsumer(gameDefinition, gameData);

            // act
            var criterions = placeBetConsumer.composeBettingTimeValidationCriteria(1);

            // assert
            expect(criterions.filter((x) => x.failure)).toBeEmpty();
        });
    });
});
