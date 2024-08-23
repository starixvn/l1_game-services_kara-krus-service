import { generateResult, getSettlementResult, randomModes } from "../../../src/helpers/result-helper";

describe("Result statistic: 100000 times", () => {
    Object.keys(randomModes).forEach((mode) => {
        it(`should generate results statistically correct with mode ${mode}`, () => {
            // Arrange
            let statisticResult = {
                red: 0,
                white: 0,
                red3: 0,
                red2: 0,
                red1: 0,
                white3: 0,
            };
            const totalRounds = 100000;
            const dragonTails = {};
            let isRed = false;
            let continuity = 0;

            // Act
            for (let i = 0; i < totalRounds; i++) {
                const result = generateResult(mode);
                const settlementResult = getSettlementResult(result);

                statisticResult.red += settlementResult.red >> 0;
                statisticResult.white += settlementResult.white >> 0;
                statisticResult.red3 += settlementResult.red3 >> 0;
                statisticResult.red2 += settlementResult.red2 >> 0;
                statisticResult.red1 += settlementResult.red1 >> 0;
                statisticResult.white3 += settlementResult.white3 >> 0;
                if (i > 0) {
                    if (isRed && settlementResult.red) {
                        continuity++;
                    } else {
                        if (!isRed && settlementResult.white) {
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
                isRed = settlementResult.red ? true : false;
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
            console.log(`esultPercentage: `, resultPercentage);

            expect(+resultPercentage.red.toFixed(1)).toBeGreaterThanOrEqual(49.5);
            expect(+resultPercentage.white.toFixed(1)).toBeGreaterThanOrEqual(49.5);
            expect(+resultPercentage.red2.toFixed(1)).toBeGreaterThanOrEqual(37);
            expect(+resultPercentage.red1.toFixed(1)).toBeGreaterThanOrEqual(37);
            expect(+resultPercentage.red3.toFixed(1)).toBeGreaterThanOrEqual(12);
            expect(+resultPercentage.white3.toFixed(1)).toBeGreaterThanOrEqual(12);

            expect(dragonTails[4]).toBeLessThan(1700);
            expect(dragonTails[5]).toBeLessThan(850);
            expect(dragonTails[6]).toBeLessThan(450);
            expect(dragonTails[7]).toBeLessThan(250);
            expect(dragonTails[8]).toBeLessThan(130);
            expect(dragonTails[9]).toBeLessThan(75);
            expect(dragonTails[10]).toBeLessThan(40);
        });
    });
});
