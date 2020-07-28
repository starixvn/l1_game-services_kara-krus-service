import { BaseEventPublishers } from 'sc-game-base';

export default class SedieUserBetResultPublisher extends BaseEventPublishers.UserBetResultPublisher {
    publish({ bet, betResult }) {
        this.publishToUser(bet.uid, { status: betResult });
    }

    publishEndGameError(userId, apiError) {
        this.publishToUser(userId, apiError);
    }
}
