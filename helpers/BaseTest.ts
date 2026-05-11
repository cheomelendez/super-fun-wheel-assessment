import { test as base } from '@playwright/test';
import WebActions from '@helpers/WebActions';
import SuperFunWheel from '@pages/SuperFunWheel';
import GameHooks from '@helpers/gameHooks';

const test = base.extend<{
    webActions: WebActions;
    superFunWheel : SuperFunWheel;
    gameHooks: GameHooks;
}>({
  webActions: async ({ page }, use) => {
    const webActions = new WebActions(page);
    await use(webActions);
  },
  superFunWheel: async ({ page }, use) => {
    const superFunWheel = new SuperFunWheel(page);
    await use(superFunWheel);
  },
  gameHooks: async ({ page }, use) => {
    const gameHooks = new GameHooks(page);
    await use(gameHooks);
  }
});

export default test;
