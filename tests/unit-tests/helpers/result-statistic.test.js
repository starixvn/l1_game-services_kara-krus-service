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
            }

            // Assert
            const resultPercentage = Object.keys(statisticResult).reduce((percentage, key) => {
                percentage[key] = +parseFloat((statisticResult[key] / totalRounds) * 100).toFixed(2);

                return percentage;
            }, {});
            console.log(
                `Mode:${mode}, countResult: ${JSON.stringify(statisticResult)}, percentageResult: ${JSON.stringify(resultPercentage)}`
            );

            expect(resultPercentage.odd).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.even).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.red2).toBeGreaterThanOrEqual(37);
            expect(resultPercentage.red3).toBeGreaterThanOrEqual(24.5);
            expect(resultPercentage.red4).toBeGreaterThanOrEqual(6);
            expect(resultPercentage.white3).toBeGreaterThanOrEqual(24.5);
            expect(resultPercentage.white4).toBeGreaterThanOrEqual(6);
        });
    });
});
