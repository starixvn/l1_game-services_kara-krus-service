import { Core } from "sc-game-base";

export default class SedieProcessBetQueue extends Core.Crons.ProcessBetQueue {
    async upsertBet(player, roundId, bet, rate) {
        //TODO process bet.clientSentTime and bet.ReceivedTime
        // metrics socketLattency
        return super.upsertBet(player, roundId, bet, rate);
    }
}
