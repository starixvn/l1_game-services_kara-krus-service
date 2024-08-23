import Chance from "chance";
import { randomInt } from "crypto";
import randomLib1 from "random";
import { MersenneTwister19937, Random } from "random-js";

const settlementRuleEntries = Object.entries({
    red: (totalReds) => totalReds === 2 || totalReds === 3,
    white: (totalReds) => totalReds === 0 || totalReds === 1,
    red3: (totalReds) => totalReds === 3,
    red2: (totalReds) => totalReds === 2,
    red1: (totalReds) => totalReds === 1,
    white3: (totalReds) => totalReds === 0,
});

const mathRandom = () => {
    return Math.random();
};

const random1 = () => {
    return (mathRandom() * 2) >> 0 !== 0;
};

const random2 = () => {
    return Math.floor(mathRandom() * 6) + Math.floor(mathRandom() * 6) + Math.floor(mathRandom() * 6) + 3 <= 10;
};

const random3 = () => {
    return (Math.floor(mathRandom() * 6) + Math.floor(mathRandom() * 6) + Math.floor(mathRandom() * 6) + 3) % 2 === 0;
};

const random4 = () => {
    return (Math.floor(mathRandom() * 10000) + 1) % 2 !== 0;
};

const random5 = () => {
    return randomInt(1, 7) > 3;
};

const random6 = () => {
    const chance = new Chance();
    return chance.integer({ min: 1, max: 6 }) > 3;
};

const random7 = () => {
    return randomLib1.int(1, 6) > 3;
};

const random8 = () => {
    const randomJS = new Random(MersenneTwister19937.autoSeed());
    return randomJS.integer(1, 6) > 3;
};

export const randomModes = {
    1: [random1, random2, random3, random4],
    2: [random5, random6, random7, random8],
    3: [random1, random3, random5, random7],
};

export const generateResult = (mode) => {
    const selectedMode = mode >= 1 && mode <= 3 ? mode : 1;
    const methodsRandom = randomModes[selectedMode];
    const methodsLength = methodsRandom.length;
    const red1 = methodsRandom[Math.floor(Math.random() * methodsLength)]();
    const red2 = methodsRandom[Math.floor(Math.random() * methodsLength)]();
    const red3 = methodsRandom[Math.floor(Math.random() * methodsLength)]();

    return { red1, red2, red3 };
};

export const getSettlementResult = (roundResult) => {
    const totalReds = Object.values(roundResult).filter((value) => value === true).length;

    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalReds);

        return result;
    }, {});
};

export const generateRawResultForHash = (roundResult) => {
    const redCount = Object.entries(roundResult)
        .map((i) => i[1])
        .filter((i) => i).length;

    const resultByRedCountMapping = {
        0: "⚪⚪⚪",
        1: "🔴⚪⚪",
        2: "🔴🔴⚪",
        3: "🔴🔴🔴",
    };

    return `{${resultByRedCountMapping[redCount]}}`;
};
