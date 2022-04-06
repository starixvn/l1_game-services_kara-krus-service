import { randomModes, generateResult } from "../../../src/helpers/result-helper";

describe("Result statistic: 100000 times", () => {
    Object.keys(randomModes).forEach((mode) => {
        it(`should generate results statistically correct with mode ${mode}`, () => {
            // Arrange
            let statisticResult = {
                true: 0,
                false: 0,
            };
            const totalRounds = 100000;

            // Act
            for (let i = 0; i < totalRounds; i++) {
                const result = generateResult(mode);
                statisticResult[result.red1.toString()]++;
                statisticResult[result.red2.toString()]++;
                statisticResult[result.red3.toString()]++;
                statisticResult[result.red4.toString()]++;
            }

            // Assert
            const resultPercentage = Object.keys(statisticResult).reduce((percentage, key) => {
                percentage[key] = parseFloat((statisticResult[key] / (totalRounds * 4)) * 100).toFixed(2);

                return percentage;
            }, {});
            console.log(
                `Mode:${mode}, countResult: ${JSON.stringify(statisticResult)}, percentageResult: ${JSON.stringify(resultPercentage)}`
            );
            const allResultPercentGoodEnough = Object.keys(resultPercentage).every((key) => resultPercentage[key] >= 49.5);
            expect(allResultPercentGoodEnough).toBe(true);
        });
    });
});
