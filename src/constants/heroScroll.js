// 全站 Hero 逐幀時間軸與頂部導覽列共用捲動常數（Single Source of Truth）
export const NAV_SCROLL_OFFSET = 76;
export const HERO_SCRUB_END_PROGRESS = 0.86; // 0~86% 主觀賞區終點（滑桿走滿 100%，對應第 80 格清晰定版）
export const HERO_FINAL_FRAME_PROGRESS = 0.86; // 左上角返回首頁停靠點：穩落於清晰不透明定版格
export const HERO_OUTRO_START_PROGRESS = 0.87; // 87% 起開始微縮淡出轉場（保留 1% 定版緩衝防取整微縮）
export const HERO_EXIT_END_PROGRESS = 1.26; // 0~126% 全程單一等速線性推進 117 格，讓上滑離場速度與滑動速度 1:1 一致
export const HERO_IDLE_AUTO_SCROLL_MS = 3500; // 首次進站無操作 3.5 秒後自動溫柔推進
export const HERO_AUTO_SCROLL_DURATION_MS = 4800; // 自動刷完首屏並順勢銜接「個人介紹」之電影感總時長
