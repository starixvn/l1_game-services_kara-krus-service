import { TableSettleGameRoundConsumer } from "sc-game-base/src/table/event-consumers/";

export default class SeDie3SettleGameRoundConsumer extends TableSettleGameRoundConsumer {
    collectRoundResult(result, settlementResult, roundId) {
        this.gameData.winningPlayers = {};

        return {
            result,
            settlementResult,
            roundId,
        };
    }
}
