import { helpers } from "sc-common";
import PlaceBetConsumer from "sc-game-base/src/core/event-consumers/place-bet-consumer";

export default class SeDiePlaceBetConsumer extends PlaceBetConsumer {
    composeBettingTimeValidationCriteria() {
        const configs = this.gameData.gameConfigs;
        const shakeThePlateTime = this.definition.durations.placingBets + this.definition.durations.shakeThePlateDuration;

        return [
            {
                failure: !configs.enabled,
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
            {
                failure:
                    this.gameData.remainingTime >= this.definition.durations.placingBets &&
                    this.gameData.remainingTime <= shakeThePlateTime,
                notice: this.getNoticeObj(helpers.noticeHelper.cannotPlaceBet),
            },
            {
                failure:
                    this.gameData.remainingTime < this.definition.durations.lockingBet || this.gameData.remainingTime > shakeThePlateTime,
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
        ];
    }
}
