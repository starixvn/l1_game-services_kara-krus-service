import { Table } from "sc-game-base";
import { getSettlementResult } from "./result-helper.js";

export default class SeideInGameConsumer extends Table.EventConsumers.InGameConsumer {
    convertSettlementResult(roundResult) {
        return getSettlementResult(roundResult);
    }

    convertResult(round) {
        const { red1, red2, red3, red4 } = round;

        return { red1, red2, red3, red4 };
    }
}
