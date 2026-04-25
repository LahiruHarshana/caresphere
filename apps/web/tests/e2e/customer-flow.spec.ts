import { test, expect } from '@playwright/test';

test.describe('Customer Flow', () => {
  test('should login as customer', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/customer/dashboard');
  });

  test('should browse caregivers', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'customer1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to caregivers
    await page.click('text=Find Caregivers');
    await expect(page).toHaveURL('/caregivers');
    // Verify caregiver cards appear
    await expect(page.locator('[data-testid="caregiver-card"]').first()).toBeVisible();
  });

  test('should complete a booking', async ({ page }) => {
    // Login → Browse → Select Caregiver → Book → Pay
    // ... detailed flow placeholder
  });
});
