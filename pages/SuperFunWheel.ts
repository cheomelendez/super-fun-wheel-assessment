import { Locator, Page } from '@playwright/test';

export default class SuperFunWheel {
    readonly page: Page;
    readonly preloader: Locator;
    readonly spinButton: Locator;
    readonly decrementButton: Locator;
    readonly incrementButton: Locator;
    readonly bet: Locator;
    readonly balance: Locator;
    readonly win: Locator;
    readonly autoplay: Locator;
    readonly quickSpin: Locator;
    readonly canvas: Locator;

    constructor(page: Page) {
        this.page = page;
        this.preloader = page.locator('#preloader');
        this.spinButton = this.page.locator("#spin-button");
        this.decrementButton = this.page.locator("#decrement-button");
        this.incrementButton = this.page.locator("#increment-button");
        this.bet = this.page.locator("#bet-button");
        this.balance = this.page.locator("#balance");
        this.win = this.page.locator("#win");
        this.autoplay = this.page.locator("#autoplay-button");
        this.quickSpin = this.page.locator("#quick-spin-button");
        this.canvas = this.page.locator("canvas");
    }

    async waitForPreloaderToAppear(timeout: number = 10000): Promise<void> {
        await this.preloader.waitFor({ state: 'attached', timeout });
    }
    async waitForPreloaderToDisappear(timeout: number = 10000): Promise<void> {
        await this.preloader.waitFor({ state: 'detached', timeout });
    }
    async isPreloaderVisible(): Promise<boolean> {
        return await this.preloader.isVisible();
    }

    async areConsoleElementsVisible(): Promise<boolean> {
        const consoleElements = [
            { name: 'Spin button', locator: this.spinButton },
            { name: 'Decrement button', locator: this.decrementButton },
            { name: 'Increment button', locator: this.incrementButton },
            { name: 'Bet button', locator: this.bet },
            { name: 'Balance', locator: this.balance },
            { name: 'Win', locator: this.win },
            { name: 'Autoplay button', locator: this.autoplay },
            { name: 'Quick spin button', locator: this.quickSpin },
        ];
        for (const element of consoleElements) {
            if (!(await element.locator.isVisible())) {
                console.log(`Element not visible: ${element.name}`);
                return false;
            }
        }
        return true;
    }

    async getBetAmount(): Promise<number> {
        const betText = await this.bet.innerText();
        const betAmount = Number(betText.match(/\d+(\.\d+)?/)?.[0]);
        return betAmount;
    }

    async getBalance(): Promise<number> {
        const balanceText = await this.balance.innerText();
        const balanceAmount = Number(balanceText.match(/\d+(\.\d+)?/)?.[0]);

        return balanceAmount;
    }

    async getWinAmount(): Promise<number> {
        const winText = await this.win.innerText();
        const winAmount = Number(winText.match(/\d+(\.\d+)?/)?.[0]);
        return winAmount;
    }
    
    async decreaseBet(times:number): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.decrementButton.click();
        }
    }

    async increaseBet(times:number): Promise<void> {
        for (let i = 0; i < times; i++) {
            await this.incrementButton.click();
        }
    }
}