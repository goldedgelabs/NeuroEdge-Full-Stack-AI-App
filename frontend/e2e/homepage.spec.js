
const { test, expect } = require('@playwright/test');
test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=NeuroEdge Console')).toHaveCount(1);
});
