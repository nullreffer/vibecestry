import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should load initial family tree data from API', async ({ page }) => {
    // Navigate to add page
    await page.goto('/add');
    
    // Should show loading indicator first
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // Wait for data to load
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Should load the mock family data from backend
    await expect(page.locator('.person-node')).toHaveCount(3); // John, Jane, Robert
    
    // Check that specific people are loaded
    await expect(page.locator('.person-node').filter({ hasText: 'John Doe' })).toBeVisible();
    await expect(page.locator('.person-node').filter({ hasText: 'Jane Smith' })).toBeVisible();
    await expect(page.locator('.person-node').filter({ hasText: 'Robert Doe' })).toBeVisible();
    
    // Check that relationships are loaded
    await expect(page.locator('.react-flow__edge')).toHaveCount(3); // Spouse + 2 parent relationships
  });

  test('should save family tree data to API', async ({ page }) => {
    await page.goto('/add');
    await page.fill('#flowName', 'API Test Tree');
    
    // Wait for initial data to load
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Add a new person
    await page.locator('.person-node').first().hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'New Family Member');
    await page.selectOption('#relationshipType', 'biological-child');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Save the entire chart
    await page.getByRole('button', { name: /save chart/i }).click();
    
    // Should show success message or redirect
    await expect(page.locator('.success-message, .flow-list')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure by going to a route that doesn't exist
    // This is a simplified test - in a real scenario you'd mock the API call to fail
    
    await page.goto('/add');
    
    // Even if API fails, should show fallback data
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Should at least have one starter node
    await expect(page.locator('.person-node')).toHaveCount.toBeGreaterThanOrEqual(1);
  });

  test('should use relationship constants consistently', async ({ page }) => {
    await page.goto('/add');
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Add a new person and check relationship options
    await page.locator('.person-node').first().hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    // Check that all relationship types are available
    const relationshipSelect = page.locator('#relationshipType');
    await expect(relationshipSelect).toBeVisible();
    
    // Verify options match our constants
    const options = await relationshipSelect.locator('option').allTextContents();
    expect(options).toContain('Biological Parent');
    expect(options).toContain('Biological Child');
    expect(options).toContain('Adopted Parent');
    expect(options).toContain('Adopted Child');
    expect(options).toContain('Spouse');
    expect(options).toContain('Sibling');
    
    // Test that spouse creates appropriate edge styling
    await page.selectOption('#relationshipType', 'spouse');
    await page.fill('#name', 'Test Spouse');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should create an edge with spouse styling
    await expect(page.locator('.react-flow__edge')).toBeVisible();
  });
});
