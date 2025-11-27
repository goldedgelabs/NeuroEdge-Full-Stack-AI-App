
const { test, expect } = require('@playwright/test');
test('offline queue and flush', async ({ page }) => {
  await page.goto('/dashboard');
  // simulate offline
  await page.context().setOffline(true);
  // send chat message
  await page.fill('input[placeholder="Say something..."]', 'offline test');
  await page.click('text=Send');
  // expect queued message shown in UI
  await expect(page.locator('text=queued')).toHaveCount(1);
  // go online and flush
  await page.context().setOffline(false);
  // wait some time for flush
  await page.waitForTimeout(2000);
  // check queue is empty in UI
  await expect(page.locator('text=Pending Queue')).toHaveCount(1);
});
