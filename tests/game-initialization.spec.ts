import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe.serial('Advanced Game Modes', () => {
    test.beforeAll(async ({ webActions }) => {
        await webActions.navigateTo(ENV.BASE_URL);
    });

    test('Verify loading screen appears on launch', async ({ webActions, superFunWheel }) => {
        // Implement steps to verify loading screen appears on game launch
        await webActions.waitForFewSeconds(5); //test
        
    });

    test('Verify loading screen disappears after load', async ({ webActions, superFunWheel }) => {
        // TODO
    });     
    
    test('Verify all UI Elements are visible after game is fully loaded', async ({ webActions, superFunWheel }) => {
        // TODO
    });

});