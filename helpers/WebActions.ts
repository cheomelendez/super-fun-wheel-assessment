import type { Page } from '@playwright/test';

export default class WebActions {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
        console.log(`Navigating to: ${url}`);
    }
    async waitForFewSeconds(seconds: number): Promise<void> {
        await this.page.waitForTimeout(seconds * 1000);
        console.log(`Waiting for ${seconds} seconds`);
    }
    async refreshPage(): Promise<void> {
        await this.page.reload();
        console.log('Page refreshed');
    }
}