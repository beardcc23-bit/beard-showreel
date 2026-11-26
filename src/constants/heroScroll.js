// 全站 Hero 逐幀時間軸與頂部導覽列共用捲動常數與座標換算（Single Source of Truth）
export const NAV_SCROLL_OFFSET = 76;
export const HERO_SCRUB_END_PROGRESS = 0.86; // 0~86% 主觀賞區終點（滑桿走滿 100%，對應第 80 格清晰定版）
export const HERO_FINAL_FRAME_PROGRESS = 0.86; // 左上角返回首頁停靠點：穩落於清晰不透明定版格
export const HERO_REDUCED_MOTION_FRAME = 79; // 減少動態模式直接呈現第 80 格（0-indexed: 79）清晰標題定版幀
export const HERO_OUTRO_START_PROGRESS = 0.87; // 87% 起開始微縮淡出轉場（保留 1% 定版緩衝防取整微縮）
export const HERO_EXIT_END_PROGRESS = 1.26; // 0~126% 全程單一等速線性推進 117 格，讓上滑離場速度與滑動速度 1:1 一致
export const HERO_IDLE_AUTO_SCROLL_MS = 1500; // 首次進站無操作 1.5 秒後自動溫柔推進
export const HERO_AUTO_SCROLL_DURATION_MS = 4800; // 自動刷完首屏並順勢銜接「個人介紹」之電影感總時長

/**
 * 計算 Hero Sticky 舞台實際可釘選捲動行程（相容桌機與手機緊湊 h-auto 舞台）
 */
export function getHeroStickyScrollable(heroEl, rect = heroEl?.getBoundingClientRect()) {
  if (!heroEl || !rect) return 0;
  const stickyEl = heroEl.querySelector?.('[data-hero-sticky]');
  const stickyH = stickyEl?.offsetHeight || window.innerHeight;
  return Math.max(0, rect.height - stickyH);
}

/**
 * 計算點擊左上角返回首頁時對應的清晰定版垂直捲動座標
 */
export function getHeroFinalFrameY(heroEl = document.getElementById('hero')) {
  if (!heroEl) return 0;
  const rect = heroEl.getBoundingClientRect();
  const scrollable = getHeroStickyScrollable(heroEl, rect);
  if (scrollable <= 0) return 0;
  const heroTop = rect.top + window.scrollY;
  return Math.round(heroTop + scrollable * HERO_FINAL_FRAME_PROGRESS);
}
