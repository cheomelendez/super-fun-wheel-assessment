import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe.serial('Signals Dispatched', () => {
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
    test('Verify Win box signal is dispatched', async ({ superFunWheel, gameHooks }) => {
        await gameHooks.setBalance(100);
        await gameHooks.setBet(30);
        await gameHooks.setWheelLandIndex(1);
        const winSignalPromise = gameHooks.waitForWinSignal();
        await superFunWheel.spinButton.click();
        await gameHooks.waitForWheelState('RESOLVED');
        expect(await winSignalPromise).toBe(150);
    });
    test('Verify balance box signal is dispatched', async ({ superFunWheel, gameHooks }) => {
        await gameHooks.setBalance(100);
        await gameHooks.setBet(30);
        await gameHooks.setWheelLandIndex(1);
        const balanceSignalPromise = gameHooks.waitForBalanceSignal();
        await superFunWheel.spinButton.click();
        await gameHooks.waitForWheelState('RESOLVED');
        expect(await balanceSignalPromise).toBe(220);
    });
    test('Verify Wheel resolved state signal is dispatched', async ({ superFunWheel, gameHooks }) => {
        const wheelResolvedSignalValue = gameHooks.waitForWheelResolvedSignal();              
        await superFunWheel.spinButton.click();
        await gameHooks.waitForWheelState('RESOLVED');
        const wheelState = await gameHooks.getWheelState();
        expect(wheelState).toBe('RESOLVED');  
    });

});
