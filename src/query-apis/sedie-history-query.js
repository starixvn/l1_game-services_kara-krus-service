import { Core } from "sc-game-base";

export default class SedieHistoryQuery extends Core.QueryApis.HistoryQuery {
    convertBet(bet) {
        if (bet.chan || bet.le) {
            return { ...bet, even: bet.chan, odd: bet.le };
        }

        return bet;
    }
}
