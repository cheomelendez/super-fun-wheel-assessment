import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe('Wheel Mechanics', () => {
    test.beforeEach(async ({ webActions, superFunWheel, gameHooks }) => {
        await webActions.navigateTo(ENV.BASE_URL);
        await superFunWheel.waitForPreloaderToAppear();
        await superFunWheel.waitForPreloaderToDisappear();
        await gameHooks.waitForHooks();
    });
    test.afterEach(async ({ webActions }) => {
        await webActions.clearLocalStorage();
        //await webActions.closeBrowser();
    });

    test.fixme('Wheel slices config is correct', async ({ gameHooks }) => {
        const isValidWheelConfig = await gameHooks.validateWheelConfig();
        expect(isValidWheelConfig).toBeTruthy();

    });  
        
    test.fixme('Spin button became disabled after clicking and re-enabled after spin completes', async ({ superFunWheel, gameHooks }) => {
        await superFunWheel.spinButton.click();
        expect(await superFunWheel.spinButton.isDisabled()).toBeTruthy();
        await gameHooks.waitForWheelState('RESOLVED');
        expect(await superFunWheel.spinButton.isDisabled()).toBeFalsy();
    });
});

