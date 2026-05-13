import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import type {
    LoadMeasurement,
    LoadSummary,
    PerformanceMeasurement,
    PerformanceSummary,
} from '@helpers/ConsoleHelper';
import ENV from '@utils/env-files/env';

test.describe('Load and Performance Measurements', () => {
    test.afterEach(async ({ webActions }) => {
        await webActions.clearLocalStorage();
        await webActions.closeBrowser();
    });

    test('Capture load time metrics with trim averages', async ({ webActions, superFunWheel, gameHooks, consoleHelper }) => {
        let summary: LoadSummary;
        await test.step('Capture load metrics over 5 cache-disabled page loads', async () => {
            await consoleHelper.disableCache();
            const measurements: LoadMeasurement[] = [];
            for (let run = 1; run <= 5; run++) {
                measurements.push(await consoleHelper.captureLoadMeasurement(webActions, superFunWheel, run));
                await gameHooks.waitForHooks();
            }
            summary = consoleHelper.buildLoadSummary(measurements);
        });

        await test.step('Attach load metrics summary', async () => {
            await test.info().attach('load-metrics-summary', {
                body: JSON.stringify(summary, null, 2),
                contentType: 'application/json',
            });
        });

        await test.step('Validate load metrics summary', async () => {
            //TBD: Define expected ranges for load times based on requirements or historical data
        });
    });

    test('Capture runtime performance metrics averages', async ({ webActions, superFunWheel, gameHooks, consoleHelper }) => {
        let summary: PerformanceSummary;
        await test.step('Capture performance after page load', async () => {
            await webActions.navigateTo(ENV.BASE_URL);
            await superFunWheel.waitForPreloaderToAppear();
            await superFunWheel.waitForPreloaderToDisappear();
            await gameHooks.waitForHooks();
        });

        await test.step('Capture performance at idle, mid-spin, and after several spins', async () => {
            const measurements: PerformanceMeasurement[] = [];
            measurements.push(await consoleHelper.capturePerformanceMeasurement('Right after page load (idle)'));
            await gameHooks.setPlayerData({ balance: 1000, bet: 20, win: 0 });
            await superFunWheel.quickSpin.click();
            const firstSpinPromise = gameHooks.waitForWheelStateSequence(['BREATHE', 'SPINNING', 'RESOLVING', 'RESOLVED'], 20000);
            await superFunWheel.spinButton.click();
            await gameHooks.waitForWheelState('SPINNING');
            measurements.push(await consoleHelper.capturePerformanceMeasurement('During gameplay (mid-spin)'));
            await firstSpinPromise;
            for (let spin = 1; spin <= 3; spin++) {
                const spinPromise = gameHooks.waitForWheelStateSequence(['BREATHE', 'SPINNING', 'RESOLVING', 'RESOLVED'], 20000);
                await superFunWheel.spinButton.click();
                await spinPromise;
            }
            measurements.push(await consoleHelper.capturePerformanceMeasurement('After several spins'));
            summary = consoleHelper.buildPerformanceSummary(measurements);
        });

        await test.step('Attach performance metrics summary', async () => {
            await test.info().attach('performance-metrics-summary', {
                body: JSON.stringify(summary, null, 2),
                contentType: 'application/json',
            });
        });

        await test.step('Validate performance metrics summary', async () => {
            //TBD: Define expected ranges for performance metrics based on requirements or historical data
        });
    });
});
