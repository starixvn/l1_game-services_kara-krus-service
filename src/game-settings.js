export default {
    id: 96,
    name: "KaraKrus",
    configName: "karakrus",
    durations: {
        wholeRound: 39,
        placingBets: 30,
        lockingBet: 3,
        shakeThePlateDuration: 2,
    },
    choices: ["kara", "krus", "head3", "head2", "head1", "tail3"],
    choicesMapper: { kara: 1, krus: 2, head3: 3, head2: 4, head1: 5, tail3: 6 },
    defaultBetTracks: {},
    hedgeBetGroups: [["kara", "krus"]],
};
