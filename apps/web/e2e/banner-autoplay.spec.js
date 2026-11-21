import {test,expect} from '@playwright/test';
test('banner rotates automatically and continues during hover',async({page})=>{
 await page.clock.install();await page.goto('/movies');
 const title=page.locator('.banner-copy h1');await expect(title).toBeVisible();
 const first=await title.textContent();await page.clock.fastForward(6100);await expect(title).not.toHaveText(first);
 await page.locator('.home-banner').hover();const current=await title.textContent();await page.clock.fastForward(6100);await expect(title).not.toHaveText(current);
 await expect(page.locator('.banner-autoplay')).toHaveCount(0);
});
