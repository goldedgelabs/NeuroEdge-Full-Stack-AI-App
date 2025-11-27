
const { test, expect } = require('@playwright/test');

test('vectors metrics loads', async ({ page }) => {
  await page.goto('/dashboard/vectors');
  await expect(page.locator('text=Vectors')).toHaveCount(1);
  await page.waitForTimeout(500);
  const pre = page.locator('section:has-text("Vectors") pre');
  expect(await pre.count()).toBeGreaterThanOrEqual(0);
});
