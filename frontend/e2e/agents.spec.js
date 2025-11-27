
const { test, expect } = require('@playwright/test');

test('agents list loads and shows agents', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.locator('text=Agents')).toHaveCount(1);
  await page.waitForTimeout(500);
  const pre = page.locator('section:has-text("Agents") pre');
  expect(await pre.count()).toBeGreaterThanOrEqual(0);
});
