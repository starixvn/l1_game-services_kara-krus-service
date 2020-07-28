import { BaseEventPublishers } from 'sc-game-base';

export default class SediePlaceBetPublisher extends BaseEventPublishers.BasePublisher {
    publishGameFailedBet(userId, payload) {
        this.publishToUser(userId, payload);
    }

    publishGeneralFailedBet(userId, payload) {
        this.publishToUser(userId, payload, 'message');
    }

    publishSuccessBet(payload) {
        this.publishToUser(payload.userId, payload.currentUser);
        this.publishToAllUsersExcept(payload.userId, payload.otherUsers);
    }
}
