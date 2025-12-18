import { test, expect } from '@playwright/test';
import { SearchPage } from '../../pageObjects/product/searchPage';

test.describe('Product Discovery - Search and Filter', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigateToHomePage();
  });

  test('should search for products and display relevant results', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifyOnSearchResultsPage();
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.verifyProductsContainKeyword('phone');

    const count = await searchPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should apply sort by price low to high filter', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Price: Low to High');
    await searchPage.verifyProductsSortedByPriceAscending();
  });

  test('should apply sort by price high to low filter', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Price: High to Low');
    await searchPage.verifyProductsSortedByPriceDescending();
  });

  test('should apply sort by name A to Z filter', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Name: A to Z');
    await searchPage.verifyProductsSortedByNameAscending();
  });

  test('should apply sort by name Z to A filter', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Name: Z to A');
    await searchPage.verifyProductsSortedByNameDescending();
  });

  test('should filter products by price range using sort and verification', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Price: Low to High');

    const prices = await searchPage.getProductPrices();
    await searchPage.verifyPriceInRange(0, 200);

    expect(prices.length).toBeGreaterThan(0);
    expect(Math.min(...prices)).toBeGreaterThan(0);
  });

  test('should change page size and verify correct number of items displayed', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.setPageSize('4');
    await searchPage.verifyPageSizeLimit(4);
    await searchPage.setPageSize('8');
    await searchPage.verifyPageSizeLimit(8);
  });

  test('should change view mode between grid and list', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.changeViewMode('List');
    await expect(page).toHaveURL(/viewmode=list/);
    await searchPage.changeViewMode('Grid');
    await expect(page).toHaveURL(/viewmode=grid/);
  });

  test('should handle search with no results - edge case', async ({ page }) => {
    await searchPage.searchForProduct('xyznonexistentproduct123');
    await searchPage.verifyOnSearchResultsPage();
    await searchPage.verifyNoResultsDisplayed();

    const count = await searchPage.getProductCount();
    expect(count).toBe(0);
  });

  test('should combine multiple filters - search, sort, and page size', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();
    await searchPage.sortByOption('Price: Low to High');
    await searchPage.setPageSize('4');
    await searchPage.verifyProductsSortedByPriceAscending();
    await searchPage.verifyPageSizeLimit(4);
    await searchPage.verifyProductsContainKeyword('phone');
  });

  test('should verify specific products appear in search results', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();

    const titles = await searchPage.getProductTitles();
    const expectedProducts = ['Phone Cover', 'Smartphone', 'Used phone'];

    for (const expectedProduct of expectedProducts) {
      const found = titles.some((title) => title.includes(expectedProduct));
      expect(found).toBeTruthy();
    }
  });

  test('should verify product details are displayed correctly in search results', async ({ page }) => {
    await searchPage.searchForProduct('phone');
    await searchPage.verifySearchResultsDisplayed();

    const firstProduct = searchPage.productItems.first();
    await expect(firstProduct.locator('.product-title')).toBeVisible();
    await expect(firstProduct.locator('.price')).toBeVisible();

    const hasDescription = (await firstProduct.locator('.description').count()) > 0;
    const hasImage = (await firstProduct.locator('.picture img').count()) > 0;

    expect(hasDescription || hasImage).toBeTruthy();
  });
});
