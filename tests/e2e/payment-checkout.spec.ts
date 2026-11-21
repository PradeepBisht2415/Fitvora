import { test, expect } from '@playwright/test';

test.describe('Payment Checkout & Subscription Acceptance Scenarios', () => {
  test('Scenario 5: Checkout page requires mandatory consent check before payment modal', async ({ page }) => {
    await page.goto('/checkout?plan=normal');

    await expect(page.getByText(/Order Summary/i)).toBeVisible();
    await expect(page.getByText('₹499')).toBeVisible();

    // Verify checkbox for recurring subscription and refund policy is present
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await expect(consentCheckbox).toBeVisible();

    // Pay button should be disabled until consent is checked
    const payBtn = page.getByRole('button', { name: /Proceed to Payment|Pay/i });
    await expect(payBtn).toBeDisabled();

    // Check consent
    await consentCheckbox.check();
    await expect(payBtn).toBeEnabled();
  });

  test('Scenario 6: Pricing preview correctly distinguishes Normal (₹499) vs Premium (₹999)', async ({ page }) => {
    await page.goto('/plans');

    await expect(page.getByText('Normal Plan')).toBeVisible();
    await expect(page.getByText('₹499')).toBeVisible();

    await expect(page.getByText('Premium Plan')).toBeVisible();
    await expect(page.getByText('₹999')).toBeVisible();

    // Check invariant: identical high quality home meal planning
    await expect(page.getByText(/Customized 7-day Indian home food plan/i).first()).toBeVisible();
  });
});
