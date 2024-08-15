import { GameDefinition } from "sc-game-base/src/core";

export default class SeDieDefinition extends GameDefinition {
    constructor(
        {
            id = 0,
            name = "",
            configName = "",
            durations = {},
            choices = [],
            choicesMapper = {},
            hedgeBetGroups = [],
            numberOfRoundHistory = 100,
            historyPageSize = 8,
        },
        generateResult,
        settle,
        generateRawResultForHash
    ) {
        super(
            { id, name, durations, choices, choicesMapper, hedgeBetGroups, numberOfRoundHistory, historyPageSize },
            generateResult,
            settle,
            generateRawResultForHash
        );
        this.configName = configName;
    }
}
