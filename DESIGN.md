# Beard Showreel 設計系統規範 (v2 Darkroom Optical Glass)

本專案採用 **暗房光學磨砂玻璃（Darkroom Optical Glass）× 45° 光譜色散（Spectral Dispersion）** 美學，致敬高階電影後期調光與 Autodesk Flame Online 合成室的精密質感。整體以純粹深黑底色維持約 55%~60% 留白，搭配低飽和柔霧磨砂厚玻璃、26.565° 立體斜切導光斷面與精準克制的品牌朱紅點綴。

---

## 1. 字體系統 (Typography)

| 角色 | 字體堆疊 | 用途 |
| :--- | :--- | :--- |
| **展示大標 (`font-display`)** | `'Montserrat', 'Noto Sans TC', sans-serif` (`700` / `800`) | 導覽列品牌標誌、四幕單排巨型英文幕標、聯絡艙主標、數據牆大數字 |
| **內文與介面 (`font-sans`)** | `'Plus Jakarta Sans', 'Noto Sans TC', sans-serif` (`300`~`600`) | 敘事段落、分鏡卡內文、分類標籤、作品標題與行動雙翼選單 |
| **時間碼與技術指標 (`mono`)** | `'JetBrains Mono', monospace` (`400` / `500`) | 演職員履歷年份、載入狀態、字數統計與技術按鈕 |

- **大標單排鐵律**：全站四處 `RevealHeading`（`Beard Chou`、`THE MANIFESTO`、`ADVERTISING`、`Let's Connect.`）一律鎖定 `whitespace-nowrap` 與流體 `clamp()` 字級，搭配底緣同步向右延伸之 `3~4px` 品牌橘紅導引橫條與光學快門掃描。

---

## 2. 光譜色彩系統 (Color Tokens)

- **暗房純黑底色 (`--color-bg-core`)**：`#030407`（RGB `3 4 7`）
- **品牌熾熱朱紅 (`spectral-crimson`)**：`#EB4A2E`（RGB `235 74 46`，主視覺焦點、播放圖示、導引光刃與 Crimson Ghost CTA）
- **高光漫射珊瑚 (`dawn-gold`)**：`#FF8A6C`（RGB `255 138 108`）
- **底片色散洋紅 (`spectral-magenta`)**：`#D0346C`（RGB `208 52 108`）
- **光學深海青藍 (`spectral-cyan`)**：`#1276B8`（RGB `18 118 184`）
- **標題亮灰白 (`title-white`)**：`#F2F5F8`（RGB `242 245 248`）

---

## 3. 核心光學材質與元件規範 (Optical Surfaces & Components)

1. **WebGL 流體色散光場 (`OpticalLightField`)**：
   - 3 頂點全螢幕三角形 Fragment Shader，光源固定於左下往右上 40°~45° 斜射，內建 `12fps` 35mm 電影底片銀鹽顆粒；桌機鎖定 `36fps`、行動端 `24fps` `low-power`，彈窗開啟或背景分頁時 `0 rAF` 休眠，無 WebGL 時自動降級至 CSS 光譜備援層。
2. **3D 煙燻透光厚玻璃 (`.optical-surface` / `.hero-glass-rail`)**：
   - 右側 `8px`（`skewY(-26.565deg)`）與頂部 `4px`（`skewX(-63.435deg)`，`tan(26.565°) = 0.5`）零誤差無毛刺咬合立體斷面。
   - **嚴格防呆（由 `layoutGuard.test.js` 強制攔截）**：
     - 禁止於同一元素同時套用 `fixed` 與 `.optical-surface`。
     - 禁止於 `.optical-surface` 外層直接套用 `overflow-hidden` / `overflow-clip` 裁切立體斷面。
     - 凡 `fixed` 抽屜／彈窗一律禁用 `h-screen` / `100vh`，必須使用 `inset-y-0` / `inset-0` / `100dvh` 搭配 `overflow-y-auto overscroll-contain` 與 `env(safe-area-inset-bottom)`。
3. **作品牆光學快門波浪 (`VisualSynthesis`)**：
   - 桌機採 `1 大（2×2）+ 4 小` 非對稱 Bento 4 欄網格，首屏依「左大卡 ➔ 右側 4 張小卡 Z 字序 ➔ 正下方整排 4 張」三段波浪依序拉開 `clip-path` 快門並回正鏡頭（`1.085 → 1.0`）。
   - 手機採 2 欄網格（首張 `col-span-2` 滿版、無連結靜態劇照隱藏），底部右欄設「下一分類」單鍵，點擊採保留背後光影之前景 `150ms` 透明淡出 ＋ `0ms` 無倒拉回頂原地顯影。
