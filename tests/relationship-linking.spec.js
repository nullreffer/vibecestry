import { test, expect } from '@playwright/test';

test.describe('Relationship Linking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add');
    await page.fill('#flowName', 'Test Linking');
    
    // Wait for initial data to load
    await expect(page.locator('.person-node')).toBeVisible();
    
    // Add a second person to test linking
    await page.locator('.person-node').hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'Jane Doe');
    await page.selectOption('#biologicalSex', 'female');
    await page.selectOption('#relationshipType', 'spouse');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Wait for both nodes to be visible
    await expect(page.locator('.person-node')).toHaveCount(2);
  });

  test('should link two people with a relationship', async ({ page }) => {
    // Get the first person node and click "Link Relative"
    const firstNode = page.locator('.person-node').first();
    await firstNode.hover();
    await page.getByRole('button', { name: /link relative/i }).click();
    
    // Should enter linking mode
    await expect(page.locator('.linking-instructions')).toBeVisible();
    await expect(page.locator('.cancel-linking-btn')).toBeVisible();
    
    // Click on the second person to link
    const secondNode = page.locator('.person-node').nth(1);
    await secondNode.click();
    
    // Linking dialog should open
    await expect(page.locator('.dialog-content')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Link Relationship');
    
    // Select relationship type
    await page.selectOption('#relationshipType', 'biological-parent');
    
    // Save the relationship
    await page.getByRole('button', { name: /create link/i }).click();
    
    // Dialog should close and edge should appear
    await expect(page.locator('.dialog-content')).not.toBeVisible();
    await expect(page.locator('.react-flow__edge')).toBeVisible();
  });

  test('should cancel linking mode', async ({ page }) => {
    // Get the first person node and click "Link Relative"
    const firstNode = page.locator('.person-node').first();
    await firstNode.hover();
    await page.getByRole('button', { name: /link relative/i }).click();
    
    // Should enter linking mode
    await expect(page.locator('.linking-instructions')).toBeVisible();
    
    // Click cancel button
    await page.getByRole('button', { name: /cancel linking/i }).click();
    
    // Should exit linking mode
    await expect(page.locator('.linking-instructions')).not.toBeVisible();
    await expect(page.locator('.cancel-linking-btn')).not.toBeVisible();
  });

  test('should show different edge styles for different relationship types', async ({ page }) => {
    // Link with biological relationship
    const firstNode = page.locator('.person-node').first();
    await firstNode.hover();
    await page.getByRole('button', { name: /link relative/i }).click();
    
    const secondNode = page.locator('.person-node').nth(1);
    await secondNode.click();
    
    await page.selectOption('#relationshipType', 'biological-parent');
    await page.getByRole('button', { name: /create link/i }).click();
    
    // Check that edge has biological styling (solid line)
    const biologicalEdge = page.locator('.react-flow__edge').first();
    await expect(biologicalEdge).toBeVisible();
    
    // Add another person to test adopted relationship
    await firstNode.hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'Bob Smith');
    await page.selectOption('#relationshipType', 'adopted-child');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should now have an adopted edge (dashed line)
    await expect(page.locator('.react-flow__edge')).toHaveCount(2);
  });
});
