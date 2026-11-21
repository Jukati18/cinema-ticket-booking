import { test, expect } from '@playwright/test';
for (const method of ['MoMo', 'VNPAY-QR', 'Thẻ ATM', 'Thẻ quốc tế']) {
 test(`combo total and payment demo using ${method}`, async ({ page }) => {
  await page.goto('/booking/show-1-1/seats');
  await page.getByRole('button', { name: /Ghế A1,/ }).click();
  const add = page.getByRole('button', { name: 'Thêm Combo Phô Mai Đặc Biệt', exact: true });
  await add.click(); await add.click();
  await page.getByRole('button', { name: 'Giảm Combo Phô Mai Đặc Biệt', exact: true }).click();
  await expect(page.getByLabel('Đã chọn Combo Phô Mai Đặc Biệt')).toHaveText('1');
  await expect(page.getByLabel('Tóm tắt đặt vé')).toContainText('180.000');
  await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click();
  await page.getByLabel('Họ và tên').fill('Nguyễn An');
  await page.getByLabel('Email nhận vé').fill('an@example.com');
  await page.getByLabel('Số điện thoại', { exact: false }).fill('0901234567');
  await page.getByRole('radio', { name: new RegExp(method) }).check();
  await page.getByRole('button', { name: 'Thanh toán giả lập', exact: true }).click();
  await expect(page).toHaveURL(/\/payment$/);
  if (method === 'MoMo' || method === 'VNPAY-QR') await expect(page.getByAltText('Mã QR demo, không thể chuyển tiền')).toBeVisible();
  else await expect(page.getByText('Không cần nhập số thẻ, CVV hoặc OTP.', { exact: false })).toBeVisible();
  for (const width of [360, 768, 1280]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  if (method === 'MoMo') await page.screenshot({ path: 'test-results/payment-qr.png', fullPage: true });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mô phỏng thanh toán thành công', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mô phỏng thanh toán thành công', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Chỗ ngồi đã sẵn sàng' })).toBeVisible();
  await expect(page.getByText('1 × Combo Phô Mai Đặc Biệt')).toBeVisible();
  await expect(page.getByText('180.000', { exact: false }).first()).toBeVisible();
 });
}
test('cancel demo payment releases held seats', async ({ page }) => {
 await page.goto('/booking/show-1-1/seats'); await page.getByRole('button', { name: /Ghế A1,/ }).click(); await page.getByRole('button', { name: 'Tiếp tục với 1 ghế' }).click();
 await page.getByLabel('Họ và tên').fill('Nguyễn An'); await page.getByLabel('Email nhận vé').fill('an@example.com'); await page.getByLabel('Số điện thoại').fill('0901234567');
 await page.getByRole('button', { name: 'Thanh toán giả lập', exact: true }).click(); await page.getByRole('button', { name: 'Mô phỏng thất bại / Hủy' }).click();
 await expect(page.getByRole('heading', { name: 'Thanh toán chưa thành công' })).toBeVisible(); await page.goto('/booking/show-1-1/seats'); await expect(page.getByRole('button', { name: /Ghế A1,/ })).toBeEnabled();
});
