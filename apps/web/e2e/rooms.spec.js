import { test, expect } from '@playwright/test';
test('room-specific gaps, aisles, entrances and coupled seats preserve the physical layout', async ({ page }) => {
 for (const id of ['show-1-1', 'show-2-1', 'show-3-1']) {
  await page.goto(`/booking/${id}/seats`);
  const pair = page.getByRole('button', { name: /Ghế G1–G2, ghế đôi/ });
  await expect(pair).toBeVisible();
  await expect(page.getByRole('button', { name: /^Ghế A12,/ })).toHaveText('A12'); await expect(page.getByRole('button', { name: /^Ghế A3,/ })).toBeDisabled(); await expect(page.getByRole('button', { name: /^Ghế A3,/ }).locator('svg.lucide-x')).toHaveCount(1);
  await expect(page.getByText('Lối vào', { exact: true })).toBeVisible(); await expect(page.getByText('Lối ra', { exact: true })).toBeVisible();
  await pair.click(); await expect(pair).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Tóm tắt đặt vé')).toContainText('G1, G2'); await expect(page.getByLabel('Tóm tắt đặt vé')).toContainText('220.000');
  await pair.click(); await expect(pair).toHaveAttribute('aria-pressed', 'false');
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: `test-results/room-${id}.png`, fullPage: true });
 }
});
