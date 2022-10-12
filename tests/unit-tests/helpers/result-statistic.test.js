import { randomModes, generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

describe("Result statistic: 100000 times", () => {
    Object.keys(randomModes).forEach((mode) => {
        it(`should generate results statistically correct with mode ${mode}`, () => {
            // Arrange
            let statisticResult = {
                odd: 0,
                even: 0,
                red2: 0,
                red3: 0,
                red4: 0,
                white3: 0,
                white4: 0,
            };
            const totalRounds = 100000;
            const dragonTails = {};
            let isEven = false;
            let continuity = 0;

            // Act
            for (let i = 0; i < totalRounds; i++) {
                const result = generateResult(mode);
                const settlementResult = getSettlementResult(result);

                statisticResult.odd += settlementResult.odd >> 0;
                statisticResult.even += settlementResult.even >> 0;
                statisticResult.red2 += settlementResult.red2 >> 0;
                statisticResult.red3 += settlementResult.red3 >> 0;
                statisticResult.red4 += settlementResult.red4 >> 0;
                statisticResult.white3 += settlementResult.white3 >> 0;
                statisticResult.white4 += settlementResult.white4 >> 0;
                if (i > 0) {
                    if (isEven && settlementResult.even) {
                        continuity++;
                    } else {
                        if (!isEven && settlementResult.odd) {
                            continuity++;
                        } else {
                            if (continuity >= 4) {
                                dragonTails[continuity] = dragonTails[continuity] ?? 0;
                                dragonTails[continuity] += 1;
                            }
                            continuity = 0;
                        }
                    }
                }
                isEven = settlementResult.even ? true : false;
            }

            // Assert
            const resultPercentage = Object.keys(statisticResult).reduce((percentage, key) => {
                percentage[key] = +parseFloat((statisticResult[key] / totalRounds) * 100).toFixed(2);

                return percentage;
            }, {});
            console.log(
                `Mode:${mode}, countResult: ${JSON.stringify(statisticResult)}, percentageResult: ${JSON.stringify(resultPercentage)}`
            );
            console.log(`dragon tails: ${JSON.stringify(dragonTails)}`);

            expect(resultPercentage.odd).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.even).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.red2).toBeGreaterThanOrEqual(37);
            expect(resultPercentage.red3).toBeGreaterThanOrEqual(24.5);
            expect(resultPercentage.red4).toBeGreaterThanOrEqual(6);
            expect(resultPercentage.white3).toBeGreaterThanOrEqual(24.5);
            expect(resultPercentage.white4).toBeGreaterThanOrEqual(6);
            expect(dragonTails[4]).toBeLessThan(1700);
            expect(dragonTails[5]).toBeLessThan(850);
            expect(dragonTails[6]).toBeLessThan(450);
            expect(dragonTails[7]).toBeLessThan(250);
            expect(dragonTails[8]).toBeLessThan(130);
            expect(dragonTails[9]).toBeLessThan(70);
            expect(dragonTails[10]).toBeLessThan(40);
        });
    });
});
