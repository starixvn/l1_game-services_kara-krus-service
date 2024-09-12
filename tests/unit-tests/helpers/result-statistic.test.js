import { randomModes, generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

describe("Result statistic: 100000 times", () => {
    Object.keys(randomModes).forEach((mode) => {
        it(`should generate results statistically correct with mode ${mode}`, () => {
            // Arrange
            let statisticResult = {
                kara: 0,
                krus: 0,
                head1: 0,
                head2: 0,
                head3: 0,
                tail3: 0,
            };
            const totalRounds = 100000;
            const dragonTails = {};
            let isKara = false;
            let continuity = 0;

            // Act
            for (let i = 0; i < totalRounds; i++) {
                const result = generateResult(mode);
                const settlementResult = getSettlementResult(result);

                statisticResult.kara += settlementResult.kara >> 0;
                statisticResult.krus += settlementResult.krus >> 0;
                statisticResult.head1 += settlementResult.head1 >> 0;
                statisticResult.head2 += settlementResult.head2 >> 0;
                statisticResult.head3 += settlementResult.head3 >> 0;
                statisticResult.tail3 += settlementResult.tail3 >> 0;
                if (i > 0) {
                    if (isKara && settlementResult.kara) {
                        continuity++;
                    } else {
                        if (!isKara && settlementResult.krus) {
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
                isKara = settlementResult.kara ? true : false;
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
            console.log(`resultPercentage: `, resultPercentage);

            expect(resultPercentage.kara).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.krus).toBeGreaterThanOrEqual(49.5);
            expect(resultPercentage.head1).toBeGreaterThanOrEqual(37);
            expect(resultPercentage.head2).toBeGreaterThanOrEqual(37);
            expect(resultPercentage.head3).toBeGreaterThanOrEqual(12);
            expect(resultPercentage.tail3).toBeGreaterThanOrEqual(12);
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
