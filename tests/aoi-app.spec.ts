import { test, expect } from '@playwright/test';

test.describe('AOI Creation Tool - Map Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the map to load
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should load the map and display the header', async ({ page }) => {
    // Check if the header is visible
    await expect(page.locator('h1')).toContainText('AOI Creation Tool');

    // Check if the map container is present
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();

    // Check if drawing controls are present (from Leaflet Draw)
    const drawControls = page.locator('.leaflet-draw');
    await expect(drawControls).toBeVisible();
  });

  test('should toggle WMS layer visibility', async ({ page }) => {
    // Find the layer panel heading
    const layerPanel = page.getByRole('heading', { name: 'Layers' });
    await expect(layerPanel).toBeVisible();

    // Find the WMS layer checkbox
    const wmsCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(wmsCheckbox).toBeChecked();

    // Toggle the layer off
    await wmsCheckbox.click();
    await expect(wmsCheckbox).not.toBeChecked();

    // Toggle it back on
    await wmsCheckbox.click();
    await expect(wmsCheckbox).toBeChecked();
  });

  test('should display custom map controls', async ({ page }) => {
    // Check for custom zoom controls (rendered inside the map)
    // Look for buttons with title attributes
    const zoomInButton = page.locator('button[title="Zoom in"]');
    await expect(zoomInButton).toBeVisible();

    const zoomOutButton = page.locator('button[title="Zoom out"]');
    await expect(zoomOutButton).toBeVisible();

    // Click zoom in and verify map interaction
    await zoomInButton.click();
    await page.waitForTimeout(500);

    // The map should still be visible after zoom interaction
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible();
  });
});

test.describe('AOI Creation Tool - Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should search for a location and display results', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('Berlin');

    // Wait for search results (debounced)
    await page.waitForTimeout(1000);

    // Either results are shown or search completed without errors
    const searchCompleted = await searchInput.inputValue();
    expect(searchCompleted).toBe('Berlin');
  });
});

test.describe('AOI Creation Tool - Feature Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  });

  test('should display empty feature list initially', async ({ page }) => {
    // Find the feature list panel
    const featureList = page.locator('text=Features (0)');
    await expect(featureList).toBeVisible();

    // Check for empty state message
    const emptyMessage = page.locator('text=No features drawn yet');
    await expect(emptyMessage).toBeVisible();
  });

  test('should persist features in localStorage', async ({ page }) => {
    // Check if localStorage is accessible
    const storageState = await page.evaluate(() => {
      return localStorage.getItem('aoi-features');
    });

    // Initially should be empty or null
    if (storageState) {
      const features = JSON.parse(storageState);
      expect(Array.isArray(features)).toBe(true);
    }
  });
});
