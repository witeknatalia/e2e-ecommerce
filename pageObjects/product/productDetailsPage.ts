import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class ProductDetailsPage extends BasePage {
  readonly productName: Locator;
  readonly productImage: Locator;
  readonly shortDescription: Locator;
  readonly fullDescription: Locator;
  readonly productPrice: Locator;
  readonly oldPrice: Locator;
  readonly stockStatus: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly emailFriendButton: Locator;
  readonly addToCompareButton: Locator;
  readonly productReviewsLink: Locator;
  readonly addReviewLink: Locator;
  readonly productRating: Locator;
  readonly productTags: Locator;
  readonly alsoPurchasedSection: Locator;
  readonly alsoPurchasedProducts: Locator;
  readonly relatedProductsSection: Locator;
  readonly relatedProducts: Locator;
  readonly freeShipping: Locator;
  readonly successNotification: Locator;
  readonly errorNotification: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.locator('.product-name h1');
    this.productImage = page.locator('.gallery .picture img, .picture img').first();
    this.shortDescription = page.locator('.short-description');
    this.fullDescription = page.locator('.full-description');
    this.productPrice = page.locator('.product-price span[itemprop="price"]').first();
    this.oldPrice = page.locator('.product-essential .old-product-price span').first();
    this.stockStatus = page.locator('.stock .value');
    this.addToCartButton = page.locator('.add-to-cart-button, input[value="Add to cart"]').first();
    this.quantityInput = page.locator('.qty-input, input.qty');
    this.emailFriendButton = page.locator('.email-a-friend-button');
    this.addToCompareButton = page.locator('.add-to-compare-list-button');
    this.productReviewsLink = page.locator('.product-review-links a').first();
    this.addReviewLink = page.locator('.product-review-links a').nth(1);
    this.productRating = page.locator('.product-review-box .rating');
    this.productTags = page.locator('.product-tags-box');
    this.alsoPurchasedSection = page.locator('.also-purchased-products-grid');
    this.alsoPurchasedProducts = page.locator('.also-purchased-products-grid .product-item');
    this.relatedProductsSection = page.locator('.related-products-grid');
    this.relatedProducts = page.locator('.related-products-grid .product-item');
    this.freeShipping = page.locator('.free-shipping');
    this.successNotification = page.locator('.bar-notification.success');
    this.errorNotification = page.locator('.bar-notification.error');
  }

  async navigateToProduct(productUrl: string) {
    await this.navigate(productUrl);
  }

  async verifyOnProductDetailsPage() {
    await expect(this.productName).toBeVisible();
    await expect(this.productPrice).toBeVisible();
  }

  async verifyProductName(expectedName: string) {
    await expect(this.productName).toContainText(expectedName);
  }

  async verifyProductHasImage() {
    await expect(this.productImage).toBeVisible();
  }

  async verifyProductHasDescription() {
    const hasShortDesc = await this.shortDescription.isVisible().catch(() => false);
    const hasFullDesc = await this.fullDescription.isVisible().catch(() => false);
    expect(hasShortDesc || hasFullDesc).toBeTruthy();
  }

  async verifyProductPrice() {
    await expect(this.productPrice).toBeVisible();
    const priceText = await this.productPrice.textContent();
    expect(priceText).toBeTruthy();
    expect(parseFloat(priceText!.trim())).toBeGreaterThan(0);
  }

  async verifyStockStatus() {
    await expect(this.stockStatus).toBeVisible();
  }

  async verifyProductReviewsDisplayed() {
    await expect(this.productReviewsLink).toBeVisible();
  }

  async verifyAlsoPurchasedSection() {
    await expect(this.alsoPurchasedSection).toBeVisible();
  }

  async getAlsoPurchasedProductsCount(): Promise<number> {
    return await this.alsoPurchasedProducts.count();
  }

  async verifyProductTags() {
    const tagsCount = await this.productTags.locator('.product-tags-list li.tag').count();
    if (tagsCount > 0) {
      await expect(this.productTags).toBeVisible();
      await expect(this.productTags.locator('.product-tags-list li.tag').first()).toBeVisible();
    }
  }

  async hasProductTags(): Promise<boolean> {
    const tagsCount = await this.productTags.locator('.product-tags-list li.tag').count();
    return tagsCount > 0;
  }

  async clickAddToCart() {
    await this.addToCartButton.click();
  }

  async clickEmailFriend() {
    await this.emailFriendButton.click();
  }

  async clickAddToCompare() {
    await this.addToCompareButton.click();
  }

  async clickReviews() {
    await this.productReviewsLink.click();
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.fill(quantity.toString());
  }

  async getProductPrice(): Promise<number> {
    const priceText = await this.productPrice.textContent();
    return parseFloat(priceText!.trim());
  }

  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) || '';
  }

  async hasOldPrice(): Promise<boolean> {
    try {
      const count = await this.oldPrice.count();
      if (count === 0) return false;
      return await this.oldPrice.first().isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  async clickAlsoPurchasedProduct(index: number) {
    await this.alsoPurchasedProducts.nth(index).locator('.product-title a').click();
  }

  async verifyRelatedProductsSection() {
    await expect(this.relatedProductsSection).toBeVisible();
  }

  async getRelatedProductsCount(): Promise<number> {
    return await this.relatedProducts.count();
  }

  async clickRelatedProduct(index: number) {
    await this.relatedProducts.nth(index).locator('.product-title a').click();
  }

  async verifyFreeShipping() {
    await expect(this.freeShipping).toBeVisible();
    await expect(this.freeShipping).toContainText('Free shipping');
  }

  async hasFreeShipping(): Promise<boolean> {
    return await this.freeShipping.isVisible().catch(() => false);
  }

  async addToCart(quantity: number = 1): Promise<void> {
    if (quantity > 1) {
      await this.setQuantity(quantity);
    }
    await this.clickAddToCart();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyAddToCartSuccess(): Promise<void> {
    await expect(this.successNotification).toBeVisible({ timeout: 5000 });
  }

  async verifyAddToCartError(): Promise<void> {
    await expect(this.errorNotification).toBeVisible({ timeout: 5000 });
  }

  async getSuccessNotificationText(): Promise<string> {
    return (await this.successNotification.textContent()) || '';
  }

  async closeSuccessNotification(): Promise<void> {
    const closeButton = this.successNotification.locator('.close');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}
