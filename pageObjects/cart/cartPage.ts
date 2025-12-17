import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class CartPage extends BasePage {
  readonly cartLink: Locator;
  readonly cartQty: Locator;
  readonly wishlistLink: Locator;
  readonly wishlistQty: Locator;
  readonly cartTable: Locator;
  readonly cartItemRows: Locator;
  readonly removeCheckbox: Locator;
  readonly productName: Locator;
  readonly productPicture: Locator;
  readonly productAttributes: Locator;
  readonly unitPrice: Locator;
  readonly quantityInput: Locator;
  readonly productSubtotal: Locator;
  readonly editItemLink: Locator;
  readonly updateCartButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly discountCouponInput: Locator;
  readonly applyDiscountButton: Locator;
  readonly couponErrorMessage: Locator;
  readonly giftCardInput: Locator;
  readonly applyGiftCardButton: Locator;
  readonly giftCardErrorMessage: Locator;
  readonly cartTotalTable: Locator;
  readonly subTotal: Locator;
  readonly shipping: Locator;
  readonly tax: Locator;
  readonly orderTotal: Locator;
  readonly termsOfServiceCheckbox: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly flyoutCart: Locator;
  readonly flyoutCartItems: Locator;
  readonly flyoutCartTotal: Locator;
  readonly goToCartButton: Locator;

  constructor(page: Page) {
    super(page);

    this.cartLink = page.locator('.header-links a.ico-cart').first();
    this.cartQty = page.locator('.cart-qty');
    this.wishlistLink = page.locator('.header-links a.ico-wishlist');
    this.wishlistQty = page.locator('.wishlist-qty');
    this.cartTable = page.locator('table.cart');
    this.cartItemRows = page.locator('.cart-item-row');
    this.removeCheckbox = page.locator('input[name="removefromcart"]');
    this.productName = page.locator('a.product-name');
    this.productPicture = page.locator('.product-picture img');
    this.productAttributes = page.locator('.attributes');
    this.unitPrice = page.locator('.product-unit-price');
    this.quantityInput = page.locator('input[name^="itemquantity"]');
    this.productSubtotal = page.locator('.product-subtotal');
    this.editItemLink = page.locator('.edit-item a');
    this.updateCartButton = page.locator('input[name="updatecart"]');
    this.continueShoppingButton = page.locator('input[name="continueshopping"]');
    this.checkoutButton = page.locator('button[name="checkout"]');
    this.discountCouponInput = page.locator('input[name="discountcouponcode"]');
    this.applyDiscountButton = page.locator('input[name="applydiscountcouponcode"]');
    this.couponErrorMessage = page.locator('.coupon-box .message');
    this.giftCardInput = page.locator('input[name="giftcardcouponcode"]');
    this.applyGiftCardButton = page.locator('input[name="applygiftcardcouponcode"]');
    this.giftCardErrorMessage = page.locator('.giftcard-box .message');
    this.cartTotalTable = page.locator('table.cart-total');
    this.subTotal = page.locator('.cart-total tbody tr:has-text("Sub-Total") .product-price');
    this.shipping = page.locator('.cart-total tbody tr:has-text("Shipping") td.cart-total-right');
    this.tax = page.locator('.cart-total tbody tr:has-text("Tax") .product-price');
    this.orderTotal = page.locator('.cart-total tbody tr').last().locator('td.cart-total-right');
    this.termsOfServiceCheckbox = page.locator('#termsofservice');
    this.termsOfServiceCheckbox = page.locator('#termsofservice');
    this.successMessage = page.locator('.bar-notification.success');
    this.errorMessage = page.locator('.message-error');
    this.flyoutCart = page.locator('#flyout-cart');
    this.flyoutCartItems = page.locator('#flyout-cart .item');
    this.flyoutCartTotal = page.locator('#flyout-cart .totals strong');
    this.goToCartButton = page.locator('#flyout-cart input.cart-button');
  }

  async navigateToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCartItemCount(): Promise<string> {
    const text = await this.cartQty.textContent();
    return text?.replace(/[()]/g, '') || '0';
  }

  async isCartEmpty(): Promise<boolean> {
    const count = await this.cartItemRows.count();
    return count === 0;
  }

  async getProductNames(): Promise<string[]> {
    await this.page.waitForLoadState('domcontentloaded');
    const names = await this.productName.allTextContents();
    return names;
  }

  async getProductUnitPrice(index: number = 0): Promise<string> {
    return (await this.unitPrice.nth(index).textContent()) || '';
  }

  async getProductSubtotal(index: number = 0): Promise<string> {
    return (await this.productSubtotal.nth(index).textContent()) || '';
  }

  async getProductQuantity(index: number = 0): Promise<string> {
    return await this.quantityInput.nth(index).inputValue();
  }

  async updateProductQuantity(quantity: number, index: number = 0): Promise<void> {
    await this.quantityInput.nth(index).clear();
    await this.quantityInput.nth(index).fill(quantity.toString());
  }

  async clickUpdateCart(): Promise<void> {
    await this.updateCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async removeProduct(index: number = 0): Promise<void> {
    await this.removeCheckbox.nth(index).check();
    await this.updateCartButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyDiscountCoupon(couponCode: string): Promise<void> {
    await this.discountCouponInput.fill(couponCode);
    await this.applyDiscountButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyGiftCard(giftCardCode: string): Promise<void> {
    await this.giftCardInput.fill(giftCardCode);
    await this.applyGiftCardButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getSubTotal(): Promise<string> {
    return (await this.subTotal.textContent()) || '';
  }

  async getTax(): Promise<string> {
    return (await this.tax.textContent()) || '';
  }

  async getOrderTotal(): Promise<string> {
    const text = await this.orderTotal.textContent();
    return text?.trim() || '';
  }

  async acceptTermsOfService(): Promise<void> {
    await this.termsOfServiceCheckbox.check();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickContinueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyProductInCart(productName: string): Promise<void> {
    await expect(this.productName.filter({ hasText: productName })).toBeVisible();
  }

  async verifyCartUpdated(expectedQuantity: string, index: number = 0): Promise<void> {
    const quantity = await this.getProductQuantity(index);
    expect(quantity).toBe(expectedQuantity);
  }

  async verifySubTotal(expectedTotal: string): Promise<void> {
    const subTotal = await this.getSubTotal();
    expect(subTotal).toBe(expectedTotal);
  }

  async verifySuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
  }

  async verifyErrorMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async getSuccessMessageText(): Promise<string> {
    return (await this.successMessage.textContent()) || '';
  }

  async getErrorMessageText(): Promise<string> {
    return (await this.errorMessage.textContent()) || '';
  }

  async hoverOverCartLink(): Promise<void> {
    await this.cartLink.hover();
  }

  async verifyFlyoutCartVisible(): Promise<void> {
    await expect(this.flyoutCart.locator('.active')).toBeVisible({ timeout: 5000 });
  }

  async getFlyoutCartItemCount(): Promise<number> {
    return await this.flyoutCartItems.count();
  }

  async getFlyoutCartTotal(): Promise<string> {
    return (await this.flyoutCartTotal.textContent()) || '';
  }

  async hasProductAttributes(index: number = 0): Promise<boolean> {
    const count = await this.productAttributes.nth(index).count();
    return count > 0;
  }

  async getProductAttributes(index: number = 0): Promise<string> {
    if (await this.hasProductAttributes(index)) {
      return (await this.productAttributes.nth(index).textContent()) || '';
    }
    return '';
  }

  async editCartItem(index: number = 0): Promise<void> {
    await this.editItemLink.nth(index).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async calculateExpectedTotal(unitPrice: number, quantity: number): Promise<number> {
    return unitPrice * quantity;
  }

  async verifyCartItemDetails(productName: string, price: string, quantity: string): Promise<void> {
    await this.verifyProductInCart(productName);
    const unitPrice = await this.getProductUnitPrice(0);
    const productQuantity = await this.getProductQuantity(0);

    expect(unitPrice).toContain(price);
    expect(productQuantity).toBe(quantity);
  }
}
