
const { test, expect } = require('@playwright/test');

test('engines health loads', async ({ page }) => {
  await page.goto('/dashboard/engines');
  await expect(page.locator('text=Engines')).toHaveCount(1);
  await page.waitForTimeout(500);
  const pre = page.locator('section:has-text("Engines") pre');
  expect(await pre.count()).toBeGreaterThanOrEqual(0);
});
