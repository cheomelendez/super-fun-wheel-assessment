import { test as base } from '@playwright/test';
import WebActions from '@helpers/WebActions';
import SuperFunWheel from '@pages/SuperFunWheel';

const test = base.extend<{
    webActions: WebActions;
    superFunWheel : SuperFunWheel;
}>({
  webActions: async ({ page }, use) => {
    const webActions = new WebActions(page);
    await use(webActions);
  },
  superFunWheel: async ({ page }, use) => {
    const superFunWheel = new SuperFunWheel(page);
    await use(superFunWheel);
  }
});

export default test;