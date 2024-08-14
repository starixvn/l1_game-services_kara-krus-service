export default {
    id: 2,
    name: "SeDie3",
    configName: "sedie3",
    durations: {
        wholeRound: 39,
        placingBets: 27,
        lockingBet: 3,
        shakeThePlateDuration: 2,
    },
    choices: ["red", "white", "red3", "red2", "red1", "white3"],
    choicesMapper: { red: 1, white: 2, red3: 3, red2: 4, red1: 5, white3: 6 },
    defaultBetTracks: {},
    hedgeBetGroups: [["red", "white"]],
};
