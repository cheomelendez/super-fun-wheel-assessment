import { Page } from '@playwright/test';
import WebActions from '@helpers/WebActions';

export default class SuperFunWheel extends WebActions {
    constructor(page: Page) {
        super(page);
    }

}