import { BaseEventPublishers } from "sc-game-base";

export default class SedieRoundResultPublisher extends BaseEventPublishers.RoundResultPublisher {
    publishRoundResult(roundResult) {
        const dots = Object.values(roundResult.result);
        this.publishToAllUsers({ finish: roundResult });

        this.publishToAllAdmins({
            finish: {
                dots,
                round: roundResult.round,
            },
        });
    }
}
