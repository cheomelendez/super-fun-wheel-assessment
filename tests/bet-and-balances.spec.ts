import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe('Bet and Balances', () => {
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

    test('Increase and Decrease Bet Amount', async ({ superFunWheel }) => {
        const initialBetAmount = await superFunWheel.getBetAmount();;
        await superFunWheel.incrementButton.click();
        const increasedBetAmount = await superFunWheel.getBetAmount();
        expect(increasedBetAmount).toBeGreaterThan(initialBetAmount);
        expect(increasedBetAmount).toBe(initialBetAmount + 10);
        await superFunWheel.decrementButton.click();
        const decreasedBetAmount = await superFunWheel.getBetAmount();
        expect(decreasedBetAmount).toBe(initialBetAmount);
        expect(decreasedBetAmount).toBe(increasedBetAmount - 10);
    });

    test('Minimum Bet Amount is 10', async ({ superFunWheel, gameHooks }) => {
        await gameHooks.setBet(20);
        const initialBetAmount = await superFunWheel.getBetAmount();
        await superFunWheel.decreaseBet(5);
        const betAmountAfterDecrements = await superFunWheel.getBetAmount();
        expect(betAmountAfterDecrements).toBeLessThan(initialBetAmount);
        expect(betAmountAfterDecrements).toBe(10);
    });
    test.fixme('Spin is prevented when balance is less than bet', async ({ superFunWheel, gameHooks }) => {
        await gameHooks.setBalance(10);
        await gameHooks.setBet(20);
        await superFunWheel.spinButton.click();
        const wheelState = await gameHooks.getWheelState();
        expect(wheelState).toBe('idle');
    });
    test('Spin is allowed when balance is equal to bet', async ({ superFunWheel, gameHooks }) => {  
        await gameHooks.setBalance(20);
        await gameHooks.setBet(20);
        const expectedWheelStates = ['IDLE', 'BREATHE', 'SPINNING', 'RESOLVING', 'RESOLVED'];
        const wheelStatesPromise = gameHooks.waitForWheelStateSequence(expectedWheelStates);
        await superFunWheel.spinButton.click();
        const wheelStates = await wheelStatesPromise;
        expect(wheelStates).toEqual(expectedWheelStates);
    });
});
