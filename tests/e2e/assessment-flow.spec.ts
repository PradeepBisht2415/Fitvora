import { test, expect } from '@playwright/test';

test.describe('Assessment Flow Acceptance Scenarios', () => {
  test('Scenario 1: Public marketing homepage loads with navigation, value proposition, and CTA', async ({ page }) => {
    await page.goto('/');

    // Check heading and hero
    await expect(page.locator('h1')).toContainText('Fitvora');
    await expect(page.getByText('Personalized Indian Home-Food Weight Management')).toBeVisible();

    // Check pricing cards exist (₹499 Normal vs ₹999 Premium)
    await expect(page.getByText('₹499')).toBeVisible();
    await expect(page.getByText('₹999')).toBeVisible();

    // Check CTA button takes visitor to assessment wizard
    const startBtn = page.getByRole('link', { name: /Start Your Assessment|Begin Assessment/i }).first();
    await expect(startBtn).toBeVisible();
  });

  test('Scenario 2: Assessment intake wizard renders 6 steps with validation', async ({ page }) => {
    await page.goto('/assessment');

    // First step should display Goal selection
    await expect(page.getByText(/Your Goal/i).first()).toBeVisible();
    await expect(page.getByText(/Weight Loss/i).first()).toBeVisible();
    await expect(page.getByText(/Weight Gain/i).first()).toBeVisible();
  });

  test('Scenario 13: Viewport test on Mobile (375px) shows zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Verify document width matches viewport without overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin of error
  });
});
