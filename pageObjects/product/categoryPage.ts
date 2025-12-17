import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class CategoryPage extends BasePage {
  readonly topMenuItems: Locator;
  readonly subCategoryLinks: Locator;
  readonly pageTitle: Locator;
  readonly productItems: Locator;
  readonly productTitles: Locator;
  readonly featuredProducts: Locator;
  readonly homepageProducts: Locator;

  constructor(page: Page) {
    super(page);
    this.topMenuItems = page.locator('.top-menu a');
    this.subCategoryLinks = page.locator('.sub-category-item a');
    this.pageTitle = page.locator('.page-title h1');
    this.productItems = page.locator('.product-item');
    this.productTitles = page.locator('.product-title a');
    this.featuredProducts = page.locator('.product-grid .product-item');
    this.homepageProducts = page.locator('.home-page-product-grid .product-item');
  }

  async navigateToCategory(categoryName: string) {
    await this.navigate('/');
    const categoryLink = this.topMenuItems.filter({ hasText: categoryName }).first();
    await categoryLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToSubCategory(subCategoryName: string) {
    const subCategoryLink = this.subCategoryLinks.filter({ hasText: subCategoryName }).first();
    await subCategoryLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickTopMenuCategory(categoryName: string) {
    const categoryLink = this.topMenuItems.filter({ hasText: categoryName }).first();
    await categoryLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickProductByTitle(productTitle: string) {
    const productLink = this.productTitles.filter({ hasText: productTitle }).first();
    await productLink.click();
  }

  async clickProductByIndex(index: number) {
    await this.productTitles.nth(index).click();
  }

  async clickFeaturedProduct(index: number) {
    await this.featuredProducts.nth(index).locator('.product-title a').click();
  }

  async clickHomepageProduct(index: number) {
    await this.homepageProducts.nth(index).locator('.product-title a').click();
  }

  async verifyCategoryPageLoaded(categoryName: string) {
    await expect(this.pageTitle).toContainText(categoryName);
  }

  async verifyProductsDisplayed() {
    const count = await this.productItems.count();
    if (count > 0) {
      await expect(this.productItems.first()).toBeVisible();
    }
  }

  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  async getProductTitles(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.productItems.first().waitFor({ state: 'visible' });
    return await this.productTitles.allTextContents();
  }

  async getFeaturedProductsCount(): Promise<number> {
    return await this.featuredProducts.count();
  }

  async getHomepageProductsCount(): Promise<number> {
    return await this.homepageProducts.count();
  }

  async verifySubCategoriesDisplayed() {
    await expect(this.subCategoryLinks.first()).toBeVisible();
  }

  async getSubCategoryNames(): Promise<string[]> {
    return await this.subCategoryLinks.allTextContents();
  }
}
