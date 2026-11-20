import {test,expect} from '@playwright/test';
test('all ten movies have readable metadata and substantive synopsis',async({page})=>{
 for(let i=1;i<=10;i++){
  await page.goto(`/movies/movie-${i}`);
  await expect(page.locator('.movie-synopsis p')).toBeVisible();
  expect((await page.locator('.movie-synopsis p').textContent()).length).toBeGreaterThan(150);
  await expect(page.locator('.movie-facts svg')).toHaveCount(8);
  await expect(page.locator('.movie-detail')).toContainText('Đạo diễn:');
 }
 await page.goto('/movies/movie-4');
 await expect(page.locator('.movie-detail')).toContainText('Nguyễn Hữu Hoàng');
 await expect(page.locator('.movie-detail')).toContainText('Kỳ Duyên');
 for(const width of [1280,360]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/movie-metadata-${width}.png`,fullPage:true});}
});
