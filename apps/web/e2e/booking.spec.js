import { test, expect } from '@playwright/test';
async function chooseSeat(page) { await page.goto('/movies/movie-1'); await page.locator('.showtime-button').first().click(); await page.getByRole('button', { name: /Ghế A1,/ }).click(); }
async function confirmPayment(page) { await page.getByRole('button', { name: /^Mô phỏng thanh toán (thành công|thất bại)$/ }).click(); }
async function fillContact(page) { await page.getByLabel('Họ và tên').fill('Nguyễn An'); await page.getByLabel('Email nhận vé').fill('an@example.com'); await page.getByLabel('Số điện thoại').fill('0901234567'); }
test('guest checkout, invalid form, confirmation, refresh and responsive', async ({ page }) => {
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); await page.goto('/'); await expect(page.getByRole('heading', { name: 'Ngày Con Còn Mẹ', level: 1 })).toBeVisible(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `test-results/catalog-${width}.png`, fullPage: true }); }
  await page.screenshot({ path: 'test-results/catalog-desktop.png', fullPage: true }); await chooseSeat(page); await expect(page.getByRole('button', { name: /Ghế A3,/ })).toBeDisabled();
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await expect(page.getByRole('button', { name: 'Tiếp tục với 1 ghế' })).toBeVisible(); await page.screenshot({ path: `test-results/seats-${width}.png`, fullPage: true }); }
  await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click();
  await page.getByRole('button', { name: 'Thanh toán giả lập', exact: true }).click(); await expect(page.getByText('Nhập họ tên từ 2 ký tự')).toBeVisible();
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `test-results/checkout-${width}.png`, fullPage: true }); }
  await page.screenshot({ path: 'test-results/checkout-desktop.png', fullPage: true }); await fillContact(page); await page.getByRole('button', { name: 'Thanh toán giả lập', exact: true }).click();
  await confirmPayment(page); await expect(page.getByRole('heading', { name: 'Chỗ ngồi đã sẵn sàng' })).toBeVisible(); await expect(page.getByLabel('Mã đặt chỗ')).toContainText('DEMO-');
  await page.reload(); await expect(page.getByRole('heading', { name: 'Chỗ ngồi đã sẵn sàng' })).toBeVisible();
  await page.screenshot({ path: 'test-results/result-desktop.png', fullPage: true });
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `test-results/result-${width}.png`, fullPage: true }); }
  const reference = await page.getByLabel('Mã đặt chỗ').textContent();
  await page.goto('/lookup');
  await page.getByLabel('Mã đặt chỗ', { exact: false }).fill(reference.toLowerCase());
  await page.getByLabel('Số điện thoại đặt vé').fill('0909999999');
  await page.getByRole('button', { name: 'Tra cứu vé ngay' }).click();
  await expect(page.getByRole('alert')).toContainText('Không tìm thấy');
  await page.getByLabel('Số điện thoại đặt vé').fill('0901234567');
  await page.getByRole('button', { name: 'Tra cứu vé ngay' }).click();
  await expect(page.getByRole('heading', { name: 'Chỗ ngồi đã sẵn sàng' })).toBeVisible();
  await expect(page.getByLabel('Mã đặt chỗ')).toHaveText(reference);
});
test('lookup validates empty form and fits all target widths', async ({ page }) => {
  await page.goto('/lookup');
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: 'Tra cứu thông tin đặt vé' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/lookup-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Tra cứu vé ngay' }).click();
  await expect(page.getByText('Nhập mã đặt chỗ từ 3 ký tự')).toBeVisible();
  await expect(page.getByText('Nhập số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0')).toBeVisible();
});
test('seat conflict is actionable', async ({ page }) => { await chooseSeat(page); await page.getByText('Tình huống chạy thử', { exact: true }).click(); await page.getByLabel('Kết quả giữ ghế giả lập').selectOption('conflict'); await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click(); await expect(page.getByRole('alert')).toContainText('người khác giữ'); });
test('expired hold blocks checkout', async ({ page }) => { await chooseSeat(page); await page.getByText('Tình huống chạy thử', { exact: true }).click(); await page.getByLabel('Kết quả giữ ghế giả lập').selectOption('expired'); await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click(); await expect(page.getByRole('heading', { name: 'Không có lượt giữ ghế hợp lệ' })).toBeVisible({ timeout: 15000 }); await expect(page.getByRole('button', { name: 'Thanh toán giả lập', exact: true })).toHaveCount(0); });
test('failed payment and invalid direct checkout', async ({ page }) => { await chooseSeat(page); await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click(); await fillContact(page); await page.getByText('Tình huống chạy thử', { exact: true }).click(); await page.getByLabel('Kết quả thanh toán giả lập').selectOption('failed'); await page.getByRole('button', { name: 'Thanh toán giả lập', exact: true }).click(); await confirmPayment(page); await expect(page.getByRole('heading', { name: 'Thanh toán chưa thành công' })).toBeVisible(); await page.goto('/booking/show-1-1/checkout?hold=invalid'); await expect(page.getByRole('heading', { name: 'Không có lượt giữ ghế hợp lệ' })).toBeVisible(); });
