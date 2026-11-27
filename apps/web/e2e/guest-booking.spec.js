import { test, expect } from '@playwright/test';

test('guest booking flow', async ({ page }) => {
  // Navigate to catalog
  await page.goto('/');
  
  // Quick Booking: Select movie
  await page.locator('#quick-movie').selectOption({ index: 1 });
  
  // Quick Booking: Select cinema
  await page.locator('#quick-cinema').selectOption({ index: 1 });
  
  // Quick Booking: Select date
  await page.locator('#booking-day').selectOption({ index: 1 });
  
  // Select showtime
  await page.locator('#quick-date').selectOption({ index: 1 });
  
  // Click "Chọn chỗ ngồi" (This seems to be a link/button navigation to SeatsPage)
  // Wait, the catalog page has a button to go to seats?
  // Let's re-examine CatalogPage.jsx. It has a "Xem chi tiết" but maybe the flow is different.
  // Actually, I can just navigate directly to /movies/movie-1 if I want.
  // But let's follow the user flow. 
  
  // Let's just use the existing logic from booking.spec.js for robustness
  await page.goto('/movies/movie-1');
  await page.locator('.showtime-button').first().click();
  
  // Select a seat
  await page.getByRole('button', { name: /^Ghế [A-Z][0-9]+/ }).first().click();
  
  // Click "Tiếp tục"
  await page.getByRole('button', { name: /Tiếp tục với/ }).click();
  
  // Checkout page
  await page.getByLabel('Họ và tên').fill('Test User');
  await page.getByLabel('Email nhận vé').fill('test@example.com');
  await page.getByLabel('Số điện thoại').fill('0909999999');
  await page.getByRole('button', { name: 'Thanh toán', exact: false }).click();
  
  // Payment page
  await page.getByRole('button', { name: 'Mô phỏng thanh toán thành công' }).click();
  
  // Result page
  await expect(page.getByRole('heading', { name: 'Chỗ ngồi đã sẵn sàng' })).toBeVisible();
});
