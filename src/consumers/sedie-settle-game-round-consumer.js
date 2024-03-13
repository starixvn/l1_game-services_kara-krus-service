import { TableSettleGameRoundConsumer } from "sc-game-base/src/table/event-consumers/";

export default class SeDieSettleGameRoundConsumer extends TableSettleGameRoundConsumer {
    collectRoundResult(result, settlementResult, roundId) {
        return {
            result,
            settlementResult,
            roundId,
        };
    }
}
