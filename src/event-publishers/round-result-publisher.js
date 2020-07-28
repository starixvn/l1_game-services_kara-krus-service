import { BaseEventPublishers } from 'sc-game-base';

export default class SedieRoundResultPublisher extends BaseEventPublishers.RoundResultPublisher {
    publishRoundResult(roundResult) {
        const dots = Object.values(roundResult.result);
        this.publishToAllUsers({
            finish: {
                dots,
                round: roundResult.roundId,
                winClients: roundResult.winClients,
            },
        });

        this.publishToAllAdmins({
            finish: {
                dots,
                round: roundResult.round,
            },
        });
    }
}
