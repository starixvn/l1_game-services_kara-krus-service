import { Core } from "sc-game-base";

import { ResultHelper } from "./../helpers";

export default class SedieRoundQuery extends Core.QueryApis.RoundQuery {
    convertSettlementResult(roundResult) {
        return ResultHelper.getSettlementResult(roundResult);
    }

    convertResult(round) {
        const { red1, red2, red3, red4 } = round;

        return { red1, red2, red3, red4 };
    }
}
