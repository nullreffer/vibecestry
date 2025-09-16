import { test, expect } from '@playwright/test';

test.describe('Person Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add');
    await page.fill('#flowName', 'Test Person Management');
    
    // Wait for initial data to load
    await expect(page.locator('.person-node')).toBeVisible();
  });

  test('should edit person information', async ({ page }) => {
    // Double-click on person node to edit
    await page.locator('.person-node').dblclick();
    
    // Person edit dialog should open
    await expect(page.locator('.dialog-content')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Edit Person');
    
    // Update person information
    await page.fill('#name', 'Updated Name');
    await page.selectOption('#biologicalSex', 'female');
    await page.fill('#birthDate', '1990-12-25');
    await page.fill('#deathDate', '2050-01-01');
    await page.fill('#location', 'San Francisco, CA');
    await page.fill('#occupation', 'Software Engineer');
    await page.fill('#notes', 'Updated person information');
    
    // Save changes
    await page.getByRole('button', { name: /save/i }).click();
    
    // Dialog should close and person should be updated
    await expect(page.locator('.dialog-content')).not.toBeVisible();
    await expect(page.locator('.person-node')).toContainText('Updated Name');
  });

  test('should delete a person', async ({ page }) => {
    // First add a second person
    await page.locator('.person-node').hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'Person to Delete');
    await page.selectOption('#relationshipType', 'biological-child');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should have 2 people now
    await expect(page.locator('.person-node')).toHaveCount(2);
    
    // Hover over the second person and click delete
    const secondNode = page.locator('.person-node').filter({ hasText: 'Person to Delete' });
    await secondNode.hover();
    await page.getByRole('button', { name: /delete/i }).click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Should be back to 1 person
    await expect(page.locator('.person-node')).toHaveCount(1);
    await expect(page.locator('.person-node')).not.toContainText('Person to Delete');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to add a person without required fields
    await page.locator('.person-node').hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should show validation error or prevent saving
    // The exact behavior depends on implementation, but dialog should remain open
    await expect(page.locator('.dialog-content')).toBeVisible();
    
    // Fill in required name field
    await page.fill('#name', 'Valid Name');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Now it should save successfully
    await expect(page.locator('.dialog-content')).not.toBeVisible();
    await expect(page.locator('.person-node')).toHaveCount(2);
  });

  test('should handle different gender options', async ({ page }) => {
    // Add male person
    await page.locator('.person-node').hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'Male Person');
    await page.selectOption('#biologicalSex', 'male');
    await page.selectOption('#relationshipType', 'biological-child');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Add female person
    await page.locator('.person-node').first().hover();
    await page.getByRole('button', { name: /add relative/i }).click();
    
    await page.fill('#name', 'Female Person');
    await page.selectOption('#biologicalSex', 'female');
    await page.selectOption('#relationshipType', 'biological-child');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Should have different styling based on gender
    const maleNode = page.locator('.person-node').filter({ hasText: 'Male Person' });
    const femaleNode = page.locator('.person-node').filter({ hasText: 'Female Person' });
    
    await expect(maleNode).toHaveClass(/male/);
    await expect(femaleNode).toHaveClass(/female/);
  });
});
