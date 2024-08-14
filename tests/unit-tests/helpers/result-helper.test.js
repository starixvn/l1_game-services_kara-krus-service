import { generateRawResultForHash, generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

describe("getSettlementResult tests", () => {
    describe("when results have ONE red", () => {
        it("should return white and red1", () => {
            // arrange
            const roundResult = { red1: true, red2: false, red3: false };
            const expected = {
                red: false,
                white: true,
                red3: false,
                red2: false,
                red1: true,
                white3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have TWO reds", () => {
        it("should should return red and red2 ", () => {
            // arrange
            const roundResult = { red1: true, red2: true, red3: false };
            const expected = {
                red: true,
                white: false,
                red3: false,
                red2: true,
                red1: false,
                white3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have THREE reds", () => {
        it("should should return red and red3", () => {
            // arrange
            const roundResult = { red1: true, red2: true, red3: true };
            const expected = {
                red: true,
                white: false,
                red3: true,
                red2: false,
                red1: false,
                white3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have NO reds", () => {
        it("should return white and white3", () => {
            // arrange
            const roundResult = { red1: false, red2: false, red3: false };
            const expected = {
                red: false,
                white: true,
                red3: false,
                red2: false,
                red1: false,
                white3: true,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });
});

describe("generateResult tests", () => {
    describe("when not passing mode", () => {
        it("should return enough results", () => {
            // act
            var result = generateResult();

            // assert
            expect(Object.keys(result).length).toBe(3);
        });
    });

    describe("when passing a out of range mode", () => {
        it("should return enough results", () => {
            // act
            var result = generateResult(10);

            // assert
            expect(Object.keys(result).length).toBe(3);
        });
    });

    describe("when passing a valid mode", () => {
        it("should return enough results", () => {
            // act
            var result = generateResult(2);

            // assert
            expect(Object.keys(result).length).toBe(3);
        });
    });
});

describe("generateRawResultForHash", () => {
    describe("when zero red", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { red1: false, red2: false, red3: false };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{⚪⚪⚪}");
        });
    });
    describe("when 1 red", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { red1: false, red2: false, red3: true };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{🔴⚪⚪}");
        });
    });
    describe("when 2 reds", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { red1: false, red2: true, red3: true };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{🔴🔴⚪}");
        });
    });
    describe("when 3 reds", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { red1: true, red2: true, red3: true };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{🔴🔴🔴}");
        });
    });
});
