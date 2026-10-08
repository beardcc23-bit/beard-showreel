# 專案筆記（Beard Showreel）

## 2026-10-06

### 已完成
- **Hero 播放器改為雙模式**（`src/components/CanvasSequence.jsx`）
  - 主模式：原生 `<video>`，AV1 webm 優先、H.264 mp4 備援（桌機 2.3MB／手機 1.1MB，原序列 17MB／5.6MB）
  - 備援模式：自動播放被阻擋（NotAllowedError 或 2 秒看門狗）時退回 `public/png-0*` webp 序列 Canvas，從影片當下影格接續
  - 行為：持續循環 → 游標進入中央 50% 停格 → 移開續播 → 點擊開 YouTube Reel（`s6s2p87fPdA`）
  - 首屏改預載 `hero-poster*.webp`，移除 avatar / f1 非首屏預載
- **P1 順暢度優化**（`src/index.css` 等）
  - 循環動畫只動 transform / opacity（播放三角形、光譜邊框、按鈕流光）
  - HUD 按鈕移除 `transition: all`（字距動畫已於 10/07 依需求恢復，見下方）
  - 刪除重複 GPU 加速區塊（曾覆蓋 `.crystal-N` 旋轉）、清理多餘 will-change
  - 游標光暈改用獨立 `scale` 屬性
  - ScrubText 移除雙重調暗
  - 全域 prefers-reduced-motion（CSS、MotionConfig、Lenis、軌道視差；Hero 例外維持播放）

### 注意事項
- `public/png-0`、`public/png-0-mobile` 為 Hero 自動播放備援，**不可刪除**
- 重新產生影片：
  ```bash
  ffmpeg -framerate 30 -i public/png-0/png-0_%08d.webp -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -movflags +faststart -an public/hero.mp4
  ffmpeg -framerate 30 -i public/png-0/png-0_%08d.webp -c:v libsvtav1 -crf 36 -preset 6 -pix_fmt yuv420p -an public/hero.webm
  ```
  手機版加 `-vf scale=960:-2`；本機 ffmpeg 無 libwebp，poster 用 `cwebp` 產生
- AV1 codec 字串需對應實際 level：桌機 `av01.0.08M.08`、手機 `av01.0.04M.08`

### P0（已修正）
1. ✅ **Tailwind 透明度修飾詞失效**：顏色改為 `rgb(var(--rgb-x) / <alpha-value>)`，`:root` 新增 `--rgb-*` 通道（需與 `--color-*` hex 同步）；刻度外的值改中括號（`/[0.12]` 等）
2. ✅ **Framer Motion 與 transition 衝突**：motion 元素改用 `transition-colors` / `transition-shadow`，Modal 移除 `transition-all`
3. ✅ **錨點跳轉不準**：移除 `#vfx, #about, #contact` 的 `content-visibility`
4. ✅ **彈窗開啟時背景仍可捲**：Modal / FeedbackModal 開啟時 `window.lenis?.stop()`，並加 `data-lenis-prevent`

### 待辦（P2 / P3）
- **手機版 Manifesto 3 顆按鈕英文被裁切**（既有問題）：375px 時可用寬 82px，`03 / BEAUTY WORK` 未展開就需 104px、展開 141px；768px 平板也會裁。可選：手機縮短英文標籤（只留 `01 / AI`）、或手機關閉展開（`--hud-track-open` 設 0.05em）並改兩排佈局
- 首屏缺 `<h1>` 與自我介紹；作品縮圖桌機預設模糊變暗
- 色票收斂（殘留青色 `rgba(0,255,255)`、藍粉游標光暈、紫綠光暈）
- FB 影片手機版 `window.location.href` 會離站
- 可點擊 `<div>` 改 `<button>`；FeedbackModal label / autocomplete；`no-cors` 永遠回報成功

## 2026-10-07

### 已完成
- **HUD 按鈕字距展開**（`src/index.css`）：hover 展開、移開縮回、選取維持展開
  - 中英文共用 `--hud-track-rest`（0.05em）/ `--hud-track-open`（0.3em），調一個值全部同步
  - 負 `margin-right` 抵銷尾端字距，展開時維持置中
  - hover 包在 `@media (hover: hover)`；reduced-motion 下仍保留此過渡
  - 選取態不再改字重（字重無法過渡會跳動）
- **移除區塊半透明底色**：P0 修好透明度後 `#contact` 的 `bg-bg-core/50`、`#introduction` 的 `bg-bg-core/60` 開始生效，產生色塊邊界
- **導覽連結熱區加大**：`px-5 py-3 border-transparent`，與 CTA 同為 42px 高，間距同步縮小維持原視覺位置

## 2026-10-08

### 已完成：捲動卡頓修正
- **Lenis 改 lerp**（`useLenisScroll.js`）：原 `duration + easing` 模式下每個 wheel 事件都會 `fromTo()` 重設 `currentTime`，造成速度鋸齒；改 `lerp: 0.1`，錨點跳轉曲線改在 `Navigation.jsx` 的 `scrollTo` 個別帶入
- **移除每格重算的 GPU 濾鏡**：`.lens-flare` blur(80px)、手機 `.mobile-aurora-mesh` blur(40px)（改拉遠漸層停止點）、導覽列 backdrop-blur（改 `bg-bg-core/95`）、兩張 RefractionCard backdrop-blur-sm
- **移除不可見的實線圓環旋轉**：`.ring-outer`、`.ring-inner`、Hero 手機版 55% 圓環（只留虛線環旋轉）
- **ScrubText 改動 opacity**（0.56→1）取代 color，避免每格重繪中文段落
- **text-shadow 循環動畫改 opacity**：`.hud-pulse` 改靜態光暈；`.gold-glow-pulse` 改後方光暈偽元素（外觀由字體發光變為背後光暈）
- **作品格**：移除 `.brand-card-spring` 常駐 will-change、卡片 preserve-3d、圖片 transform-gpu（模糊濾鏡改在繪製時算一次）

### 待辦
- P2 選用：捲動中 `html.lenis-scrolling main { pointer-events: none }`（代價：慣性期間約 1 秒點擊無效）、作品卡播放三角形改 hover 才動

### 已完成：滾動防掉幀與手感優化
- **滾動中全域停用指針互動**（`body.is-scrolling * { pointer-events: none !important }`）：滾動時掠過卡片區不再觸發強制 Layout、高斯模糊與傾斜動畫，實測滑過卡片時的 Jank 從 183ms 降至 0ms。
- **Lenis 阻尼響應調校**（`lerp: 0.18`）：滾輪單次煞停時間由 448ms 縮短至 96ms，徹底消除 Mac 觸控板與滾輪的拖泥帶水感。
- **Hero 背景視域偵測**（`threshold: 0`）：Hero 滑出螢幕立刻暫停 30fps 解碼，資源全數保留給下方內容。
