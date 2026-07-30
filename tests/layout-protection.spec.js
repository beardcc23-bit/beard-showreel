import { test, expect } from '@playwright/test';

/**
 * 專案 Layout 自動化保護測試腳本 (Anti-Regression E2E Suite)
 * 驗證卡片 1:1 正方形比例、Navigation 排版與背景獨立性，防止「改 A 壞 B」
 */
test.describe('全站靈魂佈局與絕不毀損保護測試', () => {

  test('手機視圖下 (Viewport 390px) 品牌卡片必須 100% 保持 1:1 正方形 aspect-square 比例', async ({ page }) => {
    // 模擬 iPhone 13 行動裝置 Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173');

    // 定位作品卡片
    const firstCard = page.locator('.prism-border').first();
    await expect(firstCard).toBeVisible();

    // 驗證是否含有 aspect-square class 屬性
    const cardClass = await firstCard.getAttribute('class');
    expect(cardClass).toContain('aspect-square');
  });

  test('手機版頂部 Navigation 右上角不得出現建立聯繫或陀螺儀按鈕，必須保持純淨', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173');

    // 驗證導覽列內無殘留的陀螺儀按鈕文字
    const navText = await page.locator('nav').innerText();
    expect(navText).not.toContain('重力光影');
    expect(navText).not.toContain('陀螺儀');
    expect(navText).not.toContain('TILT');
  });

  test('獨立背景組件 MobileAuroraBackground 必須存在且不影響內容層 pointer-events', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const auroraBg = page.locator('.mobile-aurora-mesh');
    await expect(auroraBg).toHaveCSS('pointer-events', 'none');
  });

});
