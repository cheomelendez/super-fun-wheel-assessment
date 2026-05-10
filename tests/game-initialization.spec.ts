import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe.serial('Game Initialization', () => {
    test.beforeEach(async ({ webActions }) => {
        await webActions.navigateTo(ENV.BASE_URL);
    });
    test.afterEach(async ({ webActions }) => {
        await webActions.clearLocalStorage();
        //await webActions.closeBrowser();
    });

    test('Verify loading screen appears on launch', async ({ webActions, superFunWheel }) => {
        await superFunWheel.waitForPreloaderToAppear();
        const preloaderVisible = await superFunWheel.isPreloaderVisible();
        expect(preloaderVisible).toBeTruthy();
    });

    test('Verify loading screen disappears after load', async ({ webActions, superFunWheel }) => {
        await superFunWheel.waitForPreloaderToAppear();
        await superFunWheel.waitForPreloaderToDisappear();
        const preloaderVisibleAfterLoad = await superFunWheel.isPreloaderVisible();
        expect(preloaderVisibleAfterLoad).toBeFalsy();
    });     
    
    test('Verify all UI Elements are visible after game is fully loaded', async ({ webActions, superFunWheel }) => {
        await superFunWheel.waitForPreloaderToAppear();
        await superFunWheel.waitForPreloaderToDisappear();
        const areConsoleElementsVisible = await superFunWheel.areConsoleElementsVisible();
        expect(areConsoleElementsVisible).toBeTruthy();
    });

});