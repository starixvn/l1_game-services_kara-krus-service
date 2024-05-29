import { Core } from "sc-game-base";
import * as prom from "prom-client";

export default class SedieProcessBetQueue extends Core.Crons.ProcessBetQueue {
    async proceedBet(player, payload) {
        this.collectEventLatency(payload);

        return super.proceedBet(player, payload);
    }

    collectEventLatency({ clientSentTime }) {
        if (!this.baseMetrics.metricsEnabled) {
            return;
        }

        if (!this.baseMetrics.socketIOMetrics.metrics.betEventLatency) {
            this.baseMetrics.socketIOMetrics.metrics.betEventLatency = new prom.Histogram({
                name: "bet_event_latency_miliseconds",
                help: "Bet event latency",
            });
        }

        const latency = Date.now() - clientSentTime;
        this.baseMetrics.socketIOMetrics.metrics.betEventLatency.set(latency);
    }
}
