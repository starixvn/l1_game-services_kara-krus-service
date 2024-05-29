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

        const { metrics } = this.baseMetrics.socketIOMetrics;

        if (!metrics.betEventLatency) {
            metrics.betEventLatency = new prom.Histogram({
                name: "bet_event_latency_miliseconds",
                help: "Bet event latency",
            });
        }

        const latency = Date.now() - clientSentTime;
        metrics.betEventLatency.set(latency);
    }
}
