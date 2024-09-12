import { generateResult, getSettlementResult, generateRawResultForHash } from "../../../src/helpers/result-helper";

describe("getSettlementResult tests", () => {
    describe("when results have ONE head", () => {
        it("should return krus and head1", () => {
            // arrange
            const roundResult = { head1: true, head2: false, head3: false };
            const expected = {
                kara: false,
                krus: true,
                head3: false,
                head2: false,
                head1: true,
                tail3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have TWO heads", () => {
        it("should should return kara and head2 ", () => {
            // arrange
            const roundResult = { head1: true, head2: true, head3: false };
            const expected = {
                kara: true,
                krus: false,
                head3: false,
                head2: true,
                head1: false,
                tail3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have THREE heads", () => {
        it("should should return kara and head3", () => {
            // arrange
            const roundResult = { head1: true, head2: true, head3: true };
            const expected = {
                kara: true,
                krus: false,
                head3: true,
                head2: false,
                head1: false,
                tail3: false,
            };

            // act
            var result = getSettlementResult(roundResult);

            // assert
            expect(result).toStrictEqual(expected);
        });
    });

    describe("when results have NO head", () => {
        it("should return krus and tail3", () => {
            // arrange
            const roundResult = { head1: false, head2: false, head3: false };
            const expected = {
                kara: false,
                krus: true,
                head3: false,
                head2: false,
                head1: false,
                tail3: true,
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
    describe("when zero head", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { head1: false, head2: false, head3: false };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{Ⓧ, Ⓧ, Ⓧ}");
        });
    });
    describe("when 1 head", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { head1: true, head2: false, head3: false };
            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{◯, Ⓧ, Ⓧ}");
        });
    });
    describe("when 2 heads", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { head1: true, head2: true, head3: false };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{◯, ◯, Ⓧ}");
        });
    });
    describe("when 3 heads", () => {
        it("should format result in unicode", () => {
            // Arrange
            const roundResult = { head1: true, head2: true, head3: true };

            // Act
            const result = generateRawResultForHash(roundResult);

            // Assert
            expect(result).toBe("{◯, ◯, ◯}");
        });
    });
});
