import { helpers } from "sc-common";
import PlaceBetConsumer from "sc-game-base/src/core/event-consumers/place-bet-consumer";

export default class SeDie3PlaceBetConsumer extends PlaceBetConsumer {
    composeBettingTimeValidationCriteria(roundId) {
        const configs = this.gameData.gameConfigs;
        const shakeThePlateTime = this.definition.durations.placingBets + this.definition.durations.shakeThePlateDuration;

        return [
            {
                failure: !configs.enabled,
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
            {
                failure: roundId !== this.gameData.roundId,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, { gameRoundId: roundId }),
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
