import Chance from "chance";
import randomLib1 from "random";
import { Random, MersenneTwister19937 } from "random-js";
import { randomInt } from "crypto";

const settlementRuleEntries = Object.entries({
    kara: (totalReds) => totalReds === 2 || totalReds === 3,
    krus: (totalReds) => totalReds === 0 || totalReds === 1,
    head3: (totalReds) => totalReds === 3,
    head2: (totalReds) => totalReds === 2,
    head1: (totalReds) => totalReds === 1,
    tail3: (totalReds) => totalReds === 0,
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
    const head1 = methodsRandom[Math.floor(Math.random() * methodsLength)]();
    const head2 = methodsRandom[Math.floor(Math.random() * methodsLength)]();
    const head3 = methodsRandom[Math.floor(Math.random() * methodsLength)]();

    return { head1, head2, head3 };
};

export const getSettlementResult = (roundResult) => {
    const totalReds = Object.values(roundResult).filter((value) => value === true).length;

    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalReds);

        return result;
    }, {});
};

export const generateRawResultForHash = (roundResult) => {
    const headCount = Object.entries(roundResult)
        .map((i) => i[1])
        .filter((i) => i).length;

    const resultMappings = [
        "tail, tail, tail", // 0 heads
        "head, tail, tail", // 1 head
        "head, head, tail", // 2 heads
        "head, head, head", // 3 heads
    ];

    return `{${resultMappings[headCount]}}`;
};
