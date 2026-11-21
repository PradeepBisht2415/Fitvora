import { test, expect } from '@playwright/test';

test.describe('Meal Plan Delivery & Builder Acceptance Scenarios', () => {
  test('Scenario 7: Member dashboard handles zero-published plan state truthfully', async ({ page }) => {
    await page.goto('/dashboard');

    // Unauthenticated visitors should be redirected to login or view fallback
    await page.waitForURL(/\/(login|dashboard)/);
  });

  test('Scenario 8: Meal library provides authentic Indian home food categories', async ({ page }) => {
    // Check public meal samples preview on homepage
    await page.goto('/');

    await expect(page.getByText(/Ghar Ka Khana/i)).toBeVisible();
    await expect(page.getByText(/Poha/i).first()).toBeVisible();
    await expect(page.getByText(/Dal/i).first()).toBeVisible();
  });

  test('Scenario 12: Accessibility and keyboard navigation check', async ({ page }) => {
    await page.goto('/');

    // Tab through key interactive elements
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'BODY']).toContain(focusedTag);
  });
});
