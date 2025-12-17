import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly viewModeSelect: Locator;
  readonly sortBySelect: Locator;
  readonly pageSizeSelect: Locator;
  readonly productGrid: Locator;
  readonly productItems: Locator;
  readonly productTitles: Locator;
  readonly productPrices: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#small-searchterms');
    this.searchButton = page.locator('.search-box-button');
    this.viewModeSelect = page.locator('#products-viewmode');
    this.sortBySelect = page.locator('#products-orderby');
    this.pageSizeSelect = page.locator('#products-pagesize');
    this.productGrid = page.locator('.product-grid');
    this.productItems = page.locator('.product-item');
    this.productTitles = page.locator('.product-title a');
    this.productPrices = page.locator('.price.actual-price');
    this.noResultsMessage = page.locator('.no-result');
  }

  async navigateToHomePage() {
    await this.navigate('/');
  }

  async searchForProduct(searchTerm: string) {
    await this.searchInput.click();
    await this.searchInput.clear();
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyOnSearchResultsPage() {
    await expect(this.page).toHaveURL(/.*\/search/);
  }

  async sortByOption(option: 'Position' | 'Name: A to Z' | 'Name: Z to A' | 'Price: Low to High' | 'Price: High to Low' | 'Created on') {
    await this.sortBySelect.selectOption({ label: option });
    await this.page.waitForLoadState('networkidle');
  }

  async changeViewMode(mode: 'Grid' | 'List') {
    await this.viewModeSelect.selectOption({ label: mode });
    await this.page.waitForLoadState('networkidle');
  }

  async setPageSize(size: '4' | '8' | '12') {
    await this.pageSizeSelect.selectOption({ label: size });
    await this.page.waitForLoadState('networkidle');
  }

  async verifySearchResultsDisplayed() {
    await expect(this.productItems.first()).toBeVisible();
  }

  async verifyNoResultsDisplayed() {
    const count = await this.productItems.count();
    expect(count).toBe(0);
  }

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  async getProductTitles(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.productItems.first().waitFor({ state: 'visible' });
    return await this.productTitles.allTextContents();
  }

  async getProductPrices(): Promise<number[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.productItems.first().waitFor({ state: 'visible' });
    const priceTexts = await this.productPrices.allTextContents();
    return priceTexts.map((price) => parseFloat(price.trim()));
  }

  async verifyProductsContainKeyword(keyword: string) {
    const titles = await this.getProductTitles();
    const lowerKeyword = keyword.toLowerCase();

    for (const title of titles) {
      expect(title.toLowerCase()).toContain(lowerKeyword);
    }
  }

  async verifyProductsSortedByPriceAscending() {
    const prices = await this.getProductPrices();

    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  }

  async verifyProductsSortedByPriceDescending() {
    const prices = await this.getProductPrices();

    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  }

  async verifyProductsSortedByNameAscending() {
    const titles = await this.getProductTitles();
    const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));

    expect(titles).toEqual(sortedTitles);
  }

  async verifyProductsSortedByNameDescending() {
    const titles = await this.getProductTitles();
    const sortedTitles = [...titles].sort((a, b) => b.localeCompare(a));

    expect(titles).toEqual(sortedTitles);
  }

  async verifyPageSizeLimit(expectedSize: number) {
    const count = await this.getProductCount();
    expect(count).toBeLessThanOrEqual(expectedSize);
  }

  async verifyPriceInRange(minPrice: number, maxPrice: number) {
    const prices = await this.getProductPrices();

    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(minPrice);
      expect(price).toBeLessThanOrEqual(maxPrice);
    }
  }

  async getProductByTitle(title: string): Promise<Locator> {
    return this.page.locator('.product-item').filter({ hasText: title });
  }

  async clickProduct(title: string) {
    const product = await this.getProductByTitle(title);
    await product.locator('.product-title a').click();
  }
}
