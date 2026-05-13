import test from '@helpers/BaseTest';
import { expect } from '@playwright/test';
import ENV from '@utils/env-files/env';

test.describe('Win Layout and Calculations', () => {
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
    test.fixme('Win Balance calculation and Plate layout for Wins under 1x Bet', async ({ superFunWheel, gameHooks }) => {
        const initBalance = 100;
        const betAmount = 20;
        const scenarios = [
            { name: '0x', wheelLandIndex: 2, winMultiplier: 0 },
            { name: '0x', wheelLandIndex: 8, winMultiplier: 0 },
            { name: '0.5x', wheelLandIndex: 5, winMultiplier: 0.5 },
            { name: '0.5x', wheelLandIndex: 11, winMultiplier: 0.5 }
        ];
        for (const scenario of scenarios) {
            await test.step(`Validate ${scenario.name} win`, async () => {
                await gameHooks.setPlayerData({ balance: initBalance, bet: betAmount, win: 0 });
                await gameHooks.setWheelLandIndex(scenario.wheelLandIndex);

                await superFunWheel.spinButton.click();
                await gameHooks.waitForWheelState('RESOLVED');

                const expectedWinAmount = betAmount * scenario.winMultiplier;
                const actualWinAmount = await superFunWheel.getWinAmount();
                expect(actualWinAmount).toBe(expectedWinAmount);

                const expectedBalance = initBalance - betAmount + expectedWinAmount;
                const actualBalance = await superFunWheel.getBalance();
                expect(actualBalance).toBe(expectedBalance);

                const plateLayout = await gameHooks.isPlateWinVisible();
                expect(plateLayout).toBeFalsy();
            });
        }

    }); 
    test.fixme('Win Balance calculation and Plate layout for Wins over 1x Bet', async ({ superFunWheel, gameHooks }) => {
        const initBalance = 100;
        const betAmount = 20;
        const scenarios = [
            { name: '1x', wheelLandIndex: 4, winMultiplier: 1 },
            { name: '1x', wheelLandIndex: 10, winMultiplier: 1 },
            { name: '2x', wheelLandIndex: 3, winMultiplier: 2 },
            { name: '2x', wheelLandIndex: 9, winMultiplier: 2 },
            { name: '5x', wheelLandIndex: 1, winMultiplier: 5 },
            { name: '5x', wheelLandIndex: 7, winMultiplier: 5 },
            { name: '10x', wheelLandIndex: 0, winMultiplier: 10 },
            { name: '10x', wheelLandIndex: 6, winMultiplier: 10 }
        ];  
        for (const scenario of scenarios) {
            await test.step(`Validate ${scenario.name} win`, async () => {
                await gameHooks.setPlayerData({ balance: initBalance, bet: betAmount, win: 0 });
                await gameHooks.setWheelLandIndex(scenario.wheelLandIndex);

                await superFunWheel.spinButton.click();
                await gameHooks.waitForWheelState('RESOLVED');

                const expectedWinAmount = betAmount * scenario.winMultiplier;
                const actualWinAmount = await superFunWheel.getWinAmount();
                expect(actualWinAmount).toBe(expectedWinAmount);

                const expectedBalance = initBalance - betAmount + expectedWinAmount;
                const actualBalance = await superFunWheel.getBalance();
                expect(actualBalance).toBe(expectedBalance);

                const plateLayout = await gameHooks.isPlateWinVisible();
                expect(plateLayout).toBeTruthy();
            });
        }
    });
    test('Win Plate fade out after changing bet amount or spinning again', async ({ superFunWheel, gameHooks }) => {
        let plateLayout: boolean;
        const scenarios = [
            { name: 'increase', action: async () => await superFunWheel.increaseBet(1) },
            { name: 'decrease', action: async () => await superFunWheel.decreaseBet(1) },
            { name: 'spin again', action: async () => await superFunWheel.spinButton.click() },
            { name: 'refresh', action: async () => await superFunWheel.page.reload() }
        ];
        await gameHooks.setWheelLandIndex(1);
        for (const scenario of scenarios) {
            await test.step(`Validate plate fade out after ${scenario.name}`, async () => {
                await superFunWheel.spinButton.click();
                await gameHooks.waitForWheelState('RESOLVED');
                await scenario.action();
                if (scenario.name === 'refresh') {
                    await superFunWheel.waitForPreloaderToDisappear();
                }            
                plateLayout = await gameHooks.isPlateWinVisible();
                expect(plateLayout).toBeFalsy();
            });
        }
    });
});
