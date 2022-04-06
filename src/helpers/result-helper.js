import Chance from "chance";
import randomLib1 from "random";
import { Random, MersenneTwister19937 } from "random-js";
import { randomInt } from "crypto";

const settlementRuleEntries = Object.entries({
    odd: (totalReds) => totalReds % 2 === 1,
    even: (totalReds) => totalReds % 2 === 0,
    red2: (totalReds) => totalReds === 2,
    red3: (totalReds) => totalReds === 3,
    red4: (totalReds) => totalReds === 4,
    white3: (totalReds) => totalReds === 1,
    white4: (totalReds) => totalReds === 0,
});

const random1 = () => {
    return (Math.random() * 2) >> 0 !== 0;
};

const random2 = () => {
    return Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3 <= 10;
};

const random3 = () => {
    return (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 3) % 2 === 0;
};

const random4 = () => {
    return (Math.floor(Math.random() * 10000) + 1) % 2 !== 0;
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
    const red1 = randomModes[selectedMode][0]();
    const red2 = randomModes[selectedMode][1]();
    const red3 = randomModes[selectedMode][2]();
    const red4 = randomModes[selectedMode][3]();

    return { red1, red2, red3, red4 };
};

export const getSettlementResult = (roundResult) => {
    const totalReds = Object.values(roundResult).filter((value) => value === true).length;

    return settlementRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(totalReds);

        return result;
    }, {});
};

export const generateRawResultForHash = (roundResult) => {
    let result = "";
    const redCount = Object.entries(roundResult)
        .map((i) => i[1])
        .filter((i) => i).length;
    switch (redCount) {
        case 0:
            result = "⚪⚪⚪⚪";
            break;
        case 1:
            result = "🔴⚪⚪⚪";
            break;
        case 2:
            result = "🔴🔴⚪⚪";
            break;
        case 3:
            result = "🔴🔴🔴⚪";
            break;
        case 4:
            result = "🔴🔴🔴🔴";
            break;
    }

    return `{${result}}`;
};
