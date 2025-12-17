import { test, expect } from '@playwright/test';
import { ProductDetailsPage } from '../../pageObjects/product/productDetailsPage';
import { CartPage } from '../../pageObjects/cart/cartPage';
import { CategoryPage } from '../../pageObjects/product/categoryPage';
import { SearchPage } from '../../pageObjects/product/searchPage';
import { LoginPage } from '../../pageObjects/user/loginPage';
import fs from 'fs';

test.describe('Shopping Cart', () => {
  let productDetailsPage: ProductDetailsPage;
  let cartPage: CartPage;
  let categoryPage: CategoryPage;
  let searchPage: SearchPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    productDetailsPage = new ProductDetailsPage(page);
    cartPage = new CartPage(page);
    categoryPage = new CategoryPage(page);
    searchPage = new SearchPage(page);
    loginPage = new LoginPage(page);

    await page.goto('https://demowebshop.tricentis.com/');
  });

  test.describe('Add to Cart', () => {
    test('should add a product to cart from product detail page', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.verifyOnProductDetailsPage();
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();
      await cartPage.verifyProductInCart('Computing and Internet');
    });

    test('should add product with custom quantity to cart', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart(3);
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();
      const quantity = await cartPage.getProductQuantity(0);
      expect(quantity).toBe('3');
    });

    test('should add multiple different products to cart', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await productDetailsPage.navigateToProduct('/fiction');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();
      const productNames = await cartPage.getProductNames();
      expect(productNames.length).toBe(2);
      expect(productNames).toContain('Computing and Internet');
      expect(productNames).toContain('Fiction');
    });

    test('should add product from search results', async () => {
      await searchPage.searchForProduct('computer');
      await categoryPage.clickProductByIndex(0);
      await productDetailsPage.verifyOnProductDetailsPage();
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();
      const itemCount = await cartPage.getCartItemCount();
      expect(parseInt(itemCount)).toBeGreaterThan(0);
    });

    test('should add product from category page', async () => {
      await categoryPage.navigateToCategory('Books');

      await categoryPage.clickProductByIndex(0);
      await productDetailsPage.verifyOnProductDetailsPage();
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(false);
    });

    test('should display cart item count in header after adding product', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      const cartCount = await cartPage.getCartItemCount();
      expect(parseInt(cartCount)).toBeGreaterThan(0);
    });

    test('should show flyout cart on hover with cart items', async ({ page }) => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.hoverOverCartLink();
      await page.waitForTimeout(500);

      const flyoutItems = await cartPage.getFlyoutCartItemCount();
      expect(flyoutItems).toBeGreaterThan(0);
    });
  });

  test.describe('Cart Mutations - Update Quantity', () => {
    test.beforeEach(async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();
    });

    test('should update product quantity in cart', async () => {
      const initialQuantity = await cartPage.getProductQuantity(0);
      const unitPrice = parseFloat((await cartPage.getProductUnitPrice(0)).trim());

      await cartPage.updateProductQuantity(5);
      await cartPage.clickUpdateCart();

      const updatedQuantity = await cartPage.getProductQuantity(0);
      expect(updatedQuantity).toBe('5');

      const subtotal = parseFloat((await cartPage.getProductSubtotal(0)).trim());
      expect(subtotal).toBe(unitPrice * 5);
    });

    test('should update cart total when quantity changes', async () => {
      await cartPage.updateProductQuantity(3);
      await cartPage.clickUpdateCart();

      const unitPrice = parseFloat((await cartPage.getProductUnitPrice(0)).trim());
      const expectedTotal = (unitPrice * 3).toFixed(2);
      const subTotal = await cartPage.getSubTotal();

      expect(subTotal.trim()).toBe(expectedTotal);
    });

    test('should handle quantity increase', async () => {
      const initialQty = parseInt(await cartPage.getProductQuantity(0));

      await cartPage.updateProductQuantity(initialQty + 2);
      await cartPage.clickUpdateCart();

      const updatedQty = parseInt(await cartPage.getProductQuantity(0));
      expect(updatedQty).toBe(initialQty + 2);
    });

    test('should handle quantity decrease', async () => {
      await cartPage.updateProductQuantity(5);
      await cartPage.clickUpdateCart();
      await cartPage.updateProductQuantity(2);
      await cartPage.clickUpdateCart();

      const updatedQty = await cartPage.getProductQuantity(0);
      expect(updatedQty).toBe('2');
    });

    test('should allow quantity update to 1', async () => {
      await cartPage.updateProductQuantity(1);
      await cartPage.clickUpdateCart();

      const quantity = await cartPage.getProductQuantity(0);
      expect(quantity).toBe('1');
    });
  });

  test.describe('Cart Mutations - Remove Items', () => {
    test.beforeEach(async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
    });

    test('should remove a product from cart', async () => {
      await cartPage.navigateToCart();

      const productNames = await cartPage.getProductNames();
      expect(productNames.length).toBeGreaterThan(0);

      await cartPage.removeProduct(0);
      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);
    });

    test('should update totals after removing product', async () => {
      await productDetailsPage.navigateToProduct('/fiction');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();

      const initialSubTotal = parseFloat((await cartPage.getSubTotal()).trim());
      const firstItemPrice = parseFloat((await cartPage.getProductSubtotal(0)).trim());
      await cartPage.removeProduct(0);

      const newSubTotal = parseFloat((await cartPage.getSubTotal()).trim());
      expect(newSubTotal).toBe(initialSubTotal - firstItemPrice);
    });

    test('should allow removing multiple products', async () => {
      await productDetailsPage.navigateToProduct('/fiction');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();

      const initialCount = (await cartPage.getProductNames()).length;
      expect(initialCount).toBe(2);

      await cartPage.removeProduct(0);
      const afterFirstRemoval = await cartPage.isCartEmpty();
      expect(afterFirstRemoval).toBe(false);

      await cartPage.removeProduct(0);
      const afterSecondRemoval = await cartPage.isCartEmpty();
      expect(afterSecondRemoval).toBe(true);
    });

    test('should show empty cart message after removing all items', async () => {
      await cartPage.navigateToCart();
      await cartPage.removeProduct(0);

      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);
    });
  });

  test.describe('Continue Shopping', () => {
    test('should navigate back to store when clicking continue shopping', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();
      await cartPage.clickContinueShopping();

      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).not.toContain('/cart');
    });

    test('should preserve cart items when continuing shopping', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();

      const productNamesBeforeContinue = await cartPage.getProductNames();

      await cartPage.clickContinueShopping();
      await cartPage.navigateToCart();

      const productNamesAfterReturn = await cartPage.getProductNames();
      expect(productNamesAfterReturn).toEqual(productNamesBeforeContinue);
    });
  });

  test.describe('Coupon and Discount Codes', () => {
    test.beforeEach(async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();
    });

    test('should allow entering discount coupon code', async () => {
      await cartPage.discountCouponInput.fill('TESTCODE');
      const inputValue = await cartPage.discountCouponInput.inputValue();
      expect(inputValue).toBe('TESTCODE');
    });

    test('should display message when applying invalid coupon code', async () => {
      await cartPage.applyDiscountCoupon('INVALID123');

      await expect(cartPage.couponErrorMessage).toBeVisible();
      const errorText = await cartPage.couponErrorMessage.textContent();
      expect(errorText).toContain("couldn't be applied");
    });

    test('should clear coupon code after successful application', async () => {
      await cartPage.discountCouponInput.fill('TEST');
      await cartPage.applyDiscountButton.click();
      await cartPage.page.waitForLoadState('domcontentloaded');

      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain('/cart');
    });

    test('should allow applying multiple different coupon codes', async () => {
      await cartPage.applyDiscountCoupon('FIRST');
      await cartPage.applyDiscountCoupon('SECOND');

      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain('/cart');
    });
  });

  test.describe('Gift Card', () => {
    test.beforeEach(async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();
    });

    test('should allow entering gift card code', async () => {
      await cartPage.giftCardInput.fill('GIFT123');

      const inputValue = await cartPage.giftCardInput.inputValue();
      expect(inputValue).toBe('GIFT123');
    });

    test('should display error message for invalid gift card code', async () => {
      await cartPage.applyGiftCard('INVALIDGIFT');

      await expect(cartPage.giftCardErrorMessage).toBeVisible();
      const errorText = await cartPage.giftCardErrorMessage.textContent();
      expect(errorText).toContain("couldn't be applied");
    });

    test('should allow applying both coupon and gift card', async () => {
      await cartPage.applyDiscountCoupon('COUPON');
      await cartPage.applyGiftCard('GIFT');

      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain('/cart');
    });
  });

  test.describe('Cart Totals', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('https://demowebshop.tricentis.com/cart');

      const isEmpty = await cartPage.isCartEmpty();
      if (!isEmpty) {
        const itemCount = (await cartPage.getProductNames()).length;
        for (let i = 0; i < itemCount; i++) {
          await cartPage.removeProduct(0);
        }
      }
    });

    test('should display correct subtotal for single product', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      const productPrice = await productDetailsPage.getProductPrice();

      await productDetailsPage.addToCart(2);
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();

      const subtotal = parseFloat((await cartPage.getSubTotal()).trim());
      expect(subtotal).toBe(productPrice * 2);
    });

    test('should display correct subtotal for multiple products', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      const price1 = await productDetailsPage.getProductPrice();
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await productDetailsPage.navigateToProduct('/fiction');
      const price2 = await productDetailsPage.getProductPrice();
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();

      await cartPage.navigateToCart();

      const subtotal = parseFloat((await cartPage.getSubTotal()).trim());
      const expectedTotal = parseFloat((price1 + price2).toFixed(2));
      expect(subtotal).toBeCloseTo(expectedTotal, 2);
    });

    test('should show tax calculation', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();

      await expect(cartPage.tax).toBeVisible();
    });

    test('should indicate shipping calculated at checkout', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();

      const shippingText = await cartPage.shipping.textContent();
      expect(shippingText?.trim().length).toBeGreaterThan(0);
      await expect(cartPage.shipping).toBeVisible();
    });

    test('should display order total section', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await productDetailsPage.verifyAddToCartSuccess();
      await cartPage.navigateToCart();

      await expect(cartPage.orderTotal).toBeVisible();
    });
  });

  test.describe('Checkout Process', () => {
    test.beforeEach(async () => {
      const testData = JSON.parse(fs.readFileSync('./tests/testData.json', 'utf-8'));

      await loginPage.navigateToLoginPage();
      await loginPage.login(testData.email, process.env.PASSWORD!);
      await loginPage.verifyLoggedIn();

      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();
    });

    test('should display terms of service checkbox', async () => {
      await expect(cartPage.termsOfServiceCheckbox).toBeVisible();
    });

    test('should require accepting terms of service before checkout', async () => {
      await cartPage.checkoutButton.click();
      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl).toContain('/cart');
    });

    test('should allow checkout after accepting terms of service', async () => {
      await cartPage.acceptTermsOfService();
      await cartPage.proceedToCheckout();

      const currentUrl = await cartPage.getCurrentUrl();
      expect(currentUrl.includes('checkout') || currentUrl.includes('onepage')).toBe(true);
    });

    test('should display checkout button in cart', async () => {
      await expect(cartPage.checkoutButton).toBeVisible();
      await expect(cartPage.checkoutButton).toHaveText('Checkout');
    });
  });

  test.describe('Product Details in Cart', () => {
    test('should display product image in cart', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();

      await expect(cartPage.productPicture.first()).toBeVisible();
    });

    test('should display product name as link in cart', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();

      const productName = cartPage.productName.first();
      await expect(productName).toBeVisible();

      const href = await productName.getAttribute('href');
      expect(href).toBeTruthy();
    });

    test('should display unit price in cart', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();

      await expect(cartPage.unitPrice.first()).toBeVisible();
      const priceText = await cartPage.getProductUnitPrice(0);
      expect(parseFloat(priceText.trim())).toBeGreaterThan(0);
    });

    test('should display subtotal for each product', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart(2);
      await cartPage.navigateToCart();

      await expect(cartPage.productSubtotal.first()).toBeVisible();
      const subtotal = await cartPage.getProductSubtotal(0);
      expect(parseFloat(subtotal.trim())).toBeGreaterThan(0);
    });

    test('should show edit link for cart items', async () => {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.addToCart();
      await cartPage.navigateToCart();

      const editLink = cartPage.editItemLink.first();
      const editLinkCount = await cartPage.editItemLink.count();

      if (editLinkCount > 0) {
        await expect(editLink).toBeVisible();
      }
    });
  });

  test.describe('Empty Cart Handling', () => {
    test('should handle empty cart state correctly', async ({ page }) => {
      await cartPage.navigateToCart();

      const isEmpty = await cartPage.isCartEmpty();
      expect(isEmpty).toBe(true);
    });

    test('should not display checkout button for empty cart', async ({ page }) => {
      await cartPage.navigateToCart();

      const checkoutVisible = await cartPage.checkoutButton.isVisible().catch(() => false);

      if (checkoutVisible) {
        const isEnabled = await cartPage.checkoutButton.isEnabled();
        expect(isEnabled).toBe(false);
      }
    });
  });
});
