import * as prom from "prom-client";

export default class BetEventMetric {
    /**
     * @param {BaseMetrics} dependencies.baseMetrics
     */

    prefix = "bet_event";
    buckets = [5, 10, 30, 50, 100, 500, 1000, 2000];

    constructor({ baseMetrics }) {
        this.baseMetrics = baseMetrics;
    }

    collectEventLatency({ clientSentTime }) {
        if (!this.baseMetrics.metricsEnabled) {
            return;
        }

        if (!this.baseMetrics.socketIOMetrics.metrics.betEventLatency) {
            this.baseMetrics.socketIOMetrics.metrics.betEventLatency = this.initHistogram({
                name: `${this.prefix}_latency_miliseconds`,
                buckets: this.buckets,
            });
        }

        const latency = Date.now() - Date.parse(clientSentTime);
        this.baseMetrics.socketIOMetrics.metrics.betEventLatency.observe(latency);
    }

    initHistogram({ name, buckets }) {
        return new prom.Histogram({
            name: name,
            help: name,
            buckets: buckets,
        });
    }
}
