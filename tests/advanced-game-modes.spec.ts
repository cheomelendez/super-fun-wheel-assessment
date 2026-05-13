import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe('Advanced Game Modes ', () => {
    test.beforeEach(async ({ webActions, superFunWheel, gameHooks }) => {
        await webActions.navigateTo(ENV.BASE_URL);
        await superFunWheel.waitForPreloaderToAppear();
        await superFunWheel.waitForPreloaderToDisappear();
        await gameHooks.waitForHooks();
    });
    test.afterEach(async ({ webActions }) => {
        await webActions.clearLocalStorage();
        await webActions.closeBrowser();
    });

    test('Autoplay mode ON spins the wheel automatically after the first spin resolved', async ({ superFunWheel, gameHooks }) => {
        await superFunWheel.autoplay.click();
        const firstExpectedWheelStates = ['IDLE', 'BREATHE', 'SPINNING', 'RESOLVING', 'RESOLVED'];
        const firstWheelStatesPromise = gameHooks.waitForWheelStateSequence(firstExpectedWheelStates, 20000);
        await superFunWheel.spinButton.click();
        const firstWheelStates = await firstWheelStatesPromise;
        expect(firstWheelStates).toEqual(firstExpectedWheelStates);
        const secondExpectedWheelStates = ['RESOLVED', 'BREATHE', 'SPINNING'];
        const secondWheelStatesPromise = gameHooks.waitForWheelStateSequence(secondExpectedWheelStates, 20000);
        const secondWheelStates = await secondWheelStatesPromise;
        expect(secondWheelStates).toEqual(secondExpectedWheelStates);
    });
    test.fixme('Autoplay gets interrupted when balance is insufficient for the next spin', async ({ superFunWheel, gameHooks }) => {
        await gameHooks.setBalance(20);
        await gameHooks.setBet(20);
        await superFunWheel.autoplay.click();
        await gameHooks.setWheelLandIndex(2);
        const expectedWheelStates = ['IDLE', 'BREATHE', 'SPINNING', 'RESOLVING', 'RESOLVED'];
        const wheelStatesPromise = gameHooks.waitForWheelStateSequence(expectedWheelStates, 20000);
        await superFunWheel.spinButton.click();
        const wheelStates = await wheelStatesPromise;
        expect(wheelStates).toEqual(expectedWheelStates);
        await gameHooks.expectWheelStateToRemain('RESOLVED', 3000);
    });
});
