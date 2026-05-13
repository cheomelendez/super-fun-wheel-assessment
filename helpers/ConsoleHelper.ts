import type { Page, Request } from '@playwright/test';
import SuperFunWheel from '@pages/SuperFunWheel';
import WebActions from '@helpers/WebActions';
import ENV from '@utils/env-files/env';

export type LoadMeasurement = {
    run: number;
    requests: number;
    transferredMb: number;
    loadTimeMs: number;
    bundleJsMs: number;
};

export type LoadSummary = {
    totalRequests: number;
    initialFileSizeTransferredMb: number;
    minLoadTimeMs: number;
    maxLoadTimeMs: number;
    trimAverageLoadTimeMs: number;
    trimAverageBundleJsMs: number;
    measurements: LoadMeasurement[];
};

export type PerformanceMeasurement = {
    capture: string;
    fps: number;
    cpuUsagePercent: number;
    jsHeapSizeMb: number;
};

export type PerformanceSummary = {
    averageFps: number;
    averageCpuUsagePercent: number;
    averageJsHeapSizeMb: number;
    measurements: PerformanceMeasurement[];
};

export default class ConsoleHelper {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async disableCache(): Promise<void> {
        const client = await this.page.context().newCDPSession(this.page);
        await client.send('Network.enable');
        await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    }

    async captureLoadMeasurement(webActions: WebActions, superFunWheel: SuperFunWheel, run: number): Promise<LoadMeasurement> {
        const requestFinishedPromises: Promise<void>[] = [];
        const requests: { url: string; transferredBytes: number; durationMs: number }[] = [];
        const onRequestFinished = (request: Request) => {
            const requestFinishedPromise = (async () => {
                const sizes = await request.sizes();
                const timing = request.timing();
                requests.push({
                    url: request.url(),
                    transferredBytes: sizes.responseHeadersSize + sizes.responseBodySize,
                    durationMs: Math.max(0, timing.responseEnd),
                });
            })();
            requestFinishedPromises.push(requestFinishedPromise);
        };
        this.page.on('requestfinished', onRequestFinished);
        await webActions.navigateTo(ENV.BASE_URL);
        await superFunWheel.waitForPreloaderToAppear();
        await superFunWheel.waitForPreloaderToDisappear();
        await this.page.waitForLoadState('networkidle');
        this.page.off('requestfinished', onRequestFinished);
        await Promise.all(requestFinishedPromises);

        const navigationTiming = await this.page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return navigation.loadEventEnd > 0 ? navigation.loadEventEnd - navigation.startTime : performance.now();
        });
        const bundleRequest = requests.find((request) => /bundle.*\.js($|\?)/.test(request.url))
            ?? requests.find((request) => /\.js($|\?)/.test(request.url));
        return {
            run,
            requests: requests.length,
            transferredMb: this.bytesToMb(requests.reduce((sum, request) => sum + request.transferredBytes, 0)),
            loadTimeMs: Math.round(navigationTiming),
            bundleJsMs: Math.round(bundleRequest?.durationMs ?? 0),
        };
    }

    async captureFramesPerSecond(durationMs: number = 1000): Promise<number> {
        return await this.page.evaluate((durationMs) => {
            return new Promise<number>((resolve) => {
                let frames = 0;
                const startedAt = performance.now();
                const countFrame = () => {
                    frames += 1;
                    if (performance.now() - startedAt >= durationMs) {
                        resolve(Math.round((frames * 1000) / (performance.now() - startedAt)));
                        return;
                    }
                    requestAnimationFrame(countFrame);
                };
                requestAnimationFrame(countFrame);
            });
        }, durationMs);
    }

    async capturePerformanceMeasurement(capture: string): Promise<PerformanceMeasurement> {
        const client = await this.page.context().newCDPSession(this.page);
        await client.send('Performance.enable');
        const beforeMetrics = await client.send('Performance.getMetrics');
        const startedAt = Date.now();
        const fps = await this.captureFramesPerSecond();
        const afterMetrics = await client.send('Performance.getMetrics');
        const elapsedSeconds = (Date.now() - startedAt) / 1000;
        const taskDurationDelta = this.getMetric(afterMetrics.metrics, 'TaskDuration')
            - this.getMetric(beforeMetrics.metrics, 'TaskDuration');
        const jsHeapUsedSize = this.getMetric(afterMetrics.metrics, 'JSHeapUsedSize');
        return {
            capture,
            fps,
            cpuUsagePercent: this.round(Math.min(100, (taskDurationDelta / elapsedSeconds) * 100)),
            jsHeapSizeMb: this.bytesToMb(jsHeapUsedSize),
        };
    }

    buildLoadSummary(measurements: LoadMeasurement[]): LoadSummary {
        return {
            totalRequests: Math.round(this.average(measurements.map((measurement) => measurement.requests))),
            initialFileSizeTransferredMb: this.round(this.average(measurements.map((measurement) => measurement.transferredMb))),
            minLoadTimeMs: Math.min(...measurements.map((measurement) => measurement.loadTimeMs)),
            maxLoadTimeMs: Math.max(...measurements.map((measurement) => measurement.loadTimeMs)),
            trimAverageLoadTimeMs: Math.round(this.trimmedAverage(measurements.map((measurement) => measurement.loadTimeMs))),
            trimAverageBundleJsMs: Math.round(this.trimmedAverage(measurements.map((measurement) => measurement.bundleJsMs))),
            measurements,
        };
    }

    buildPerformanceSummary(measurements: PerformanceMeasurement[]): PerformanceSummary {
        return {
            averageFps: Math.round(this.average(measurements.map((measurement) => measurement.fps))),
            averageCpuUsagePercent: this.round(this.average(measurements.map((measurement) => measurement.cpuUsagePercent))),
            averageJsHeapSizeMb: this.round(this.average(measurements.map((measurement) => measurement.jsHeapSizeMb))),
            measurements,
        };
    }

    private bytesToMb(bytes: number): number {
        return Number((bytes / 1024 / 1024).toFixed(1));
    }

    private round(value: number): number {
        return Number(value.toFixed(1));
    }

    private average(values: number[]): number {
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    private trimmedAverage(values: number[]): number {
        const sortedValues = [...values].sort((a, b) => a - b);
        return this.average(sortedValues.slice(1, -1));
    }

    private getMetric(metrics: { name: string; value: number }[], metricName: string): number {
        return metrics.find((metric) => metric.name === metricName)?.value ?? 0;
    }
}
