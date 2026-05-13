import type {Page, ConsoleMessage } from '@playwright/test';

type PlayerData = Partial<{
    balance: number;
    bet: number;
    win: number;
}>;

export default class GameHooks {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForHooks(timeout: number = 5000): Promise<void> {
        await this.page.waitForFunction(
            () => typeof (window as any).setPlayerData === 'function'
                && typeof (window as any).setWheelLandIndex === 'function'
                && Boolean((window as any).game),
            undefined,
            { timeout },
        );
    }

    async setPlayerData(playerData: PlayerData): Promise<void> {
        await this.page.evaluate((data) => {
            (window as any).setPlayerData(data);
        }, playerData);
    }

    async setBalance(balance: number): Promise<void> {
        await this.setPlayerData({ balance });
    }

    async setBet(bet: number): Promise<void> {
        await this.setPlayerData({ bet });
    }

    async setWin(win: number): Promise<void> {
        await this.setPlayerData({ win });
    }

    async setWheelLandIndex(index: number): Promise<void> {
        await this.page.evaluate((landIndex) => {
            (window as any).setWheelLandIndex(landIndex);
        }, index);
    }

    async resetWheelLandIndex(): Promise<void> {
        await this.page.evaluate(() => {
            (window as any).setWheelLandIndex(undefined);
        });
    }

    async getWheelState(): Promise<unknown> {
        return await this.page.evaluate(() => (window as any).game.wheel.state);
    }

    async getActionQueue(): Promise<unknown> {
        return await this.page.evaluate(() => (window as any).game.queue);
    }

    async getWheelConfig(): Promise<unknown> {
        return await this.page.evaluate(() => (window as any).game.wheel.config);
    }

    async getLandTargetIndex(): Promise<number | undefined> {
        return await this.page.evaluate(() => (window as any).game.wheel.landTargetIndex);
    }

    async getSliceByIndex(index: number): Promise<unknown> {
        return await this.page.evaluate((sliceIndex) => {
            return (window as any).game.wheel.config.slices[sliceIndex];
        }, index);
    }

    async isPlateWinVisible(): Promise<boolean> {
        return await this.page.evaluate(() => (window as any).game.winDialog.visible);
    }

    async waitForWheelState(expectedState: string, timeout: number = 10000): Promise<void> {
        await this.page.waitForFunction(
            (state) => (window as any).game.wheel.state === state,
            expectedState,
            { timeout },
        );
    }

    async expectWheelStateToRemain(expectedState: string, duration: number = 10000): Promise<void> {
        await this.page.evaluate(
            ({ expectedState, duration }) => {
                return new Promise<void>((resolve, reject) => {
                    const startedAt = Date.now();
                    const checkState = () => {
                        const currentState = (window as any).game.wheel.state;
                        if (currentState !== expectedState) {
                            reject(new Error(`Expected wheel state to remain ${expectedState}, but it changed to ${currentState}`));
                            return;
                        }
                        if (Date.now() - startedAt >= duration) {
                            resolve();
                            return;
                        }
                        requestAnimationFrame(checkState);
                    };
                    checkState();
                });
            },
            { expectedState, duration },
        );
    }
    
    async waitForWheelStateSequence(expectedStates: string[], timeout: number = 10000): Promise<string[]> {
        return await this.page.evaluate(
            ({ expectedStates, timeout }) => {
                return new Promise<string[]>((resolve, reject) => {
                    const matchedStates: string[] = [];
                    let expectedIndex = 0;
                    const startedAt = Date.now();
                    const checkState = () => {
                        const currentState = (window as any).game.wheel.state;
                        if (currentState === expectedStates[expectedIndex]) {
                            matchedStates.push(currentState);
                            expectedIndex += 1;
                        }
                        if (expectedIndex === expectedStates.length) {
                            resolve(matchedStates);
                            return;
                        }
                        if (Date.now() - startedAt > timeout) {
                            reject(new Error(`Expected wheel states ${expectedStates.join(' -> ')}, received ${matchedStates.join(' -> ')}`));
                            return;
                        }
                        requestAnimationFrame(checkState);
                    };
                    checkState();
                });
            },
            { expectedStates, timeout },
        );
    }

    async validateWheelConfig(): Promise<boolean> {
        const wheelConfig = await this.getWheelConfig() as {
            slices: { sprite: string; winMultiplier: number }[];
        };
        if (!wheelConfig.slices || wheelConfig.slices.length !== 12) {
            console.log(`Invalid number of slices: expected 12, got ${wheelConfig.slices?.length}`);
            return false;
        }
        for (const slice of wheelConfig.slices) {
            const spriteMultiplier = Number(slice.sprite.match(/images\/(\d+(?:\.\d+)?)x\.png$/)?.[1]);
            if (slice.winMultiplier !== spriteMultiplier) {
                console.log(`Invalid win multiplier for slice ${slice.sprite}: expected ${spriteMultiplier}, got ${slice.winMultiplier}`);
                return false;
            }
        }
        return true;
    }
    async listenToWinSignal(): Promise<void> {
        await this.page.evaluate(() => {
            (window as any).listenToWinSignal();
        });
    }

    async listenToBalanceSignal(): Promise<void> {
        await this.page.evaluate(() => {
            (window as any).listenToBalanceSignal();
        });
    }

    async listenToWheelResolvedSignal(): Promise<void> {
        await this.page.evaluate(() => {
            (window as any).listenToWheelResolvedSignal();
        });
    }

    async waitForWinSignal(timeout: number = 10000): Promise<number> {
        const signalPromise = this.waitForConsoleNumber(/\[Signal #\d+\] Win updated: (\d+(?:\.\d+)?)/, timeout);
        await this.listenToWinSignal();
        return await signalPromise;
    }

    async waitForBalanceSignal(timeout: number = 10000): Promise<number> {
        const signalPromise = this.waitForConsoleNumber(/\[Signal #\d+\] Balance updated: (\d+(?:\.\d+)?)/, timeout);
        await this.listenToBalanceSignal();
        return await signalPromise;
    }

    async waitForWheelResolvedSignal(timeout: number = 10000): Promise<number> {
        const signalPromise = this.waitForConsoleNumber(/\[Signal #\d+\] Wheel resolved at index: (\d+)/, timeout);
        await this.listenToWheelResolvedSignal();
        return await signalPromise;
    }

     private async waitForConsoleNumber(pattern: RegExp, timeout: number): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.page.off('console', onConsoleMessage);
                reject(new Error(`Timed out waiting for console message matching ${pattern}`));
            }, timeout);
            const onConsoleMessage = (message: ConsoleMessage) => {
                const match = message.text().match(pattern);
                if (!match) {
                    return;
                }
                clearTimeout(timeoutId);
                this.page.off('console', onConsoleMessage);
                resolve(Number(match[1]));
            };
            this.page.on('console', onConsoleMessage);
        });
    }

}
