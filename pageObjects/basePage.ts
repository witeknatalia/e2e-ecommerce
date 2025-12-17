import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseUrl: string = 'https://demowebshop.tricentis.com';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }
}
