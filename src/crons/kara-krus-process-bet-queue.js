import { Table } from "sc-game-base";

export default class KaraKrusProcessBetQueue extends Table.Crons.TableProcessBetQueue {
    isCountOnTotalBets(player) {
        return this.gameData.currencies.some(
            (currency) =>
                currency.partnerId === player.session.operatorId &&
                currency.name === player.session.currencyName &&
                !(currency.isTest && currency.isUncountOnTotal)
        );
    }
}