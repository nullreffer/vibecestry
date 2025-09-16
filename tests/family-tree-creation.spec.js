import { test, expect } from '@playwright/test';

test.describe('Family Tree Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page with navigation', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Vibecestry/);
    
    // Check navigation elements
    await expect(page.locator('h1')).toContainText('Vibecestry');
    await expect(page.getByRole('link', { name: /create new/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /my charts/i })).toBeVisible();
  });

  test('should create a new family tree', async ({ page }) => {
    // Click "Create New Chart" button
    await page.getByRole('link', { name: /create new/i }).click();
    
    // Should navigate to add flow page
    await expect(page).toHaveURL(/\/add/);
    
    // Fill in chart details
    await page.fill('#flowName', 'Test Family Tree');
    await page.fill('#flowDescription', 'A test family tree for E2E testing');
    
    // Wait for initial data to load
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Verify the initial person node is present
    await expect(page.locator('.person-node')).toContainText('Start Person');
    
    // Save the chart
    await page.getByRole('button', { name: /save chart/i }).click();
    
    // Should show success message or redirect
    await expect(page.locator('.success-message, .flow-list')).toBeVisible();
  });

  test('should add a relative to the family tree', async ({ page }) => {
    // Navigate to create new chart
    await page.getByRole('link', { name: /create new/i }).click();
    await page.fill('#flowName', 'Test Add Relative');
    
    // Wait for initial node to load
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Hover over the person node to show action buttons
    await page.locator('.person-node').hover();
    
    // Click "Add Relative" button
    await page.getByRole('button', { name: /add relative/i }).click();
    
    // Fill in the relative dialog
    await expect(page.locator('.dialog-content')).toBeVisible();
    await page.fill('#name', 'John Smith');
    await page.selectOption('#biologicalSex', 'male');
    await page.selectOption('#relationshipType', 'biological-child');
    await page.fill('#birthDate', '1980-05-15');
    await page.fill('#location', 'Boston, MA');
    
    // Save the relative
    await page.getByRole('button', { name: /save/i }).click();
    
    // Dialog should close and new node should appear
    await expect(page.locator('.dialog-content')).not.toBeVisible();
    await expect(page.locator('.person-node')).toHaveCount(2);
    
    // Verify the new person node contains the entered data
    await expect(page.locator('.person-node').filter({ hasText: 'John Smith' })).toBeVisible();
  });
});
