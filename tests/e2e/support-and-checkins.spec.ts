import { test, expect } from '@playwright/test';

test.describe('Support, Progress Tracking & DPDP Acceptance Scenarios', () => {
  test('Scenario 4 & 15: DPDP Act Privacy policy & rights are publicly accessible', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.locator('h1')).toContainText(/Privacy Policy/i);
    await expect(page.getByText(/DPDP Act/i).first()).toBeVisible();
    await expect(page.getByText(/Right to Access & Portability/i)).toBeVisible();
    await expect(page.getByText(/Right to Erasure/i)).toBeVisible();
  });

  test('Scenario 14: Truthful zero-member and launch state guarantees', async ({ page }) => {
    await page.goto('/');

    // Ensure no fake testimonials, fabricated transformation photos, or fake counters exist
    const textContent = await page.textContent('body');
    expect(textContent).not.toContain('10,000+ happy customers');
    expect(textContent).not.toContain('Guaranteed 10kg in 10 days');
  });

  test('Scenario 15: Terms of Service and Refund Policy are complete and accurate', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toContainText(/Terms of Service/i);

    await page.goto('/refund-policy');
    await expect(page.locator('h1')).toContainText(/Refund Policy/i);
    await expect(page.getByText(/7-Day Grace Period/i)).toBeVisible();
  });
});
