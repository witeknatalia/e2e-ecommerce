import { test, expect } from '@playwright/test';
import { CategoryPage } from '../../pageObjects/product/categoryPage';
import { ProductDetailsPage } from '../../pageObjects/product/productDetailsPage';

test.describe('Product Discovery - Browse / Category / Featured', () => {
  let categoryPage: CategoryPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    categoryPage = new CategoryPage(page);
    productDetailsPage = new ProductDetailsPage(page);
  });

  test('should browse products via top menu category navigation', async ({ page }) => {
    await categoryPage.navigateToCategory('Books');
    await categoryPage.verifyCategoryPageLoaded('Books');
    await categoryPage.verifyProductsDisplayed();

    const productCount = await categoryPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    await categoryPage.clickProductByIndex(0);
    await productDetailsPage.verifyOnProductDetailsPage();
  });

  test('should navigate through Computers category and open product details', async ({ page }) => {
    await categoryPage.navigateToCategory('Computers');
    await categoryPage.verifyCategoryPageLoaded('Computers');
    await categoryPage.verifySubCategoriesDisplayed();

    await categoryPage.navigateToSubCategory('Desktops');
    await categoryPage.verifyProductsDisplayed();
    await categoryPage.clickProductByIndex(0);

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyProductHasImage();
    await productDetailsPage.verifyProductHasDescription();
    await productDetailsPage.verifyProductPrice();
  });

  test('should browse Apparel & Shoes category and view product details', async ({ page }) => {
    await categoryPage.navigateToCategory('Apparel & Shoes');
    await categoryPage.verifyCategoryPageLoaded('Apparel');

    const titles = await categoryPage.getProductTitles();
    expect(titles.length).toBeGreaterThan(0);

    await categoryPage.clickProductByTitle(titles[0]);

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyStockStatus();
  });

  test('should access product via Electronics category path', async ({ page }) => {
    await categoryPage.navigateToCategory('Electronics');
    await categoryPage.verifyCategoryPageLoaded('Electronics');
    await categoryPage.verifySubCategoriesDisplayed();

    await categoryPage.navigateToSubCategory('Cell phones');
    await categoryPage.verifyProductsDisplayed();
    await categoryPage.clickProductByIndex(0);

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyProductHasImage();
    await productDetailsPage.verifyProductPrice();
    await productDetailsPage.verifyStockStatus();
  });

  test('should view featured products from homepage', async ({ page }) => {
    await categoryPage.navigate('/');

    const featuredCount = await categoryPage.getFeaturedProductsCount();
    expect(featuredCount).toBeGreaterThan(0);

    await categoryPage.clickFeaturedProduct(0);

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyProductHasImage();
    await productDetailsPage.verifyProductPrice();
  });

  test('should verify all product detail page elements are displayed', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/used-phone');

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyProductName('Used phone');
    await productDetailsPage.verifyProductHasImage();
    await productDetailsPage.verifyProductHasDescription();
    await productDetailsPage.verifyProductPrice();
    await productDetailsPage.verifyStockStatus();

    await expect(productDetailsPage.emailFriendButton).toBeVisible();
    await expect(productDetailsPage.addToCompareButton).toBeVisible();

    await productDetailsPage.verifyProductReviewsDisplayed();
  });

  test('should verify "also purchased" recommendations section', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/used-phone');
    await productDetailsPage.verifyAlsoPurchasedSection();

    const recommendedCount = await productDetailsPage.getAlsoPurchasedProductsCount();
    expect(recommendedCount).toBeGreaterThan(0);

    await productDetailsPage.clickAlsoPurchasedProduct(0);
    await productDetailsPage.verifyOnProductDetailsPage();
  });

  test('should verify product tags are displayed when available', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/used-phone');

    const hasTags = await productDetailsPage.hasProductTags();
    if (hasTags) {
      await productDetailsPage.verifyProductTags();
    } else {
      await productDetailsPage.navigateToProduct('/computing-and-internet');
      await productDetailsPage.verifyProductTags();
    }
  });

  test('should verify related products section and navigation', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/computing-and-internet');

    await productDetailsPage.verifyRelatedProductsSection();

    const relatedCount = await productDetailsPage.getRelatedProductsCount();
    expect(relatedCount).toBeGreaterThan(0);

    await productDetailsPage.clickRelatedProduct(0);
    await productDetailsPage.verifyOnProductDetailsPage();
  });

  test('should verify free shipping indicator when available', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/computing-and-internet');

    const hasFreeShipping = await productDetailsPage.hasFreeShipping();
    if (hasFreeShipping) {
      await productDetailsPage.verifyFreeShipping();
    }
  });

  test('should verify product with old price displays both prices', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/computing-and-internet');

    const hasOldPrice = await productDetailsPage.hasOldPrice();
    expect(hasOldPrice).toBeTruthy();

    await expect(productDetailsPage.oldPrice).toBeVisible();
    await expect(productDetailsPage.productPrice).toBeVisible();
  });

  test('should navigate through multiple categories and verify products', async ({ page }) => {
    const categories = ['Books', 'Jewelry', 'Apparel & Shoes'];

    for (const category of categories) {
      await categoryPage.navigateToCategory(category);
      await categoryPage.verifyProductsDisplayed();

      const productCount = await categoryPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    }
  });

  test('should verify product price is correctly displayed', async ({ page }) => {
    await productDetailsPage.navigateToProduct('/used-phone');

    const price = await productDetailsPage.getProductPrice();
    expect(price).toBeGreaterThan(0);
  });

  test('should browse Jewelry category and view product', async ({ page }) => {
    await categoryPage.navigateToCategory('Jewelry');
    await categoryPage.verifyCategoryPageLoaded('Jewelry');
    await categoryPage.verifyProductsDisplayed();
    await categoryPage.clickProductByIndex(0);

    await productDetailsPage.verifyOnProductDetailsPage();
    await productDetailsPage.verifyProductHasImage();
    await productDetailsPage.verifyProductPrice();
  });

  test('should verify product details page has all required sections', async ({ page }) => {
    await categoryPage.navigateToCategory('Books');
    await categoryPage.verifyProductsDisplayed();
    await categoryPage.clickProductByIndex(0);

    await expect(productDetailsPage.productName).toBeVisible();
    await expect(productDetailsPage.productImage).toBeVisible();
    await expect(productDetailsPage.productPrice).toBeVisible();
    await expect(productDetailsPage.stockStatus).toBeVisible();
    await expect(productDetailsPage.emailFriendButton).toBeVisible();
    await expect(productDetailsPage.addToCompareButton).toBeVisible();
  });
});
