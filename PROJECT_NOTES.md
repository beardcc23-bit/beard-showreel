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

## 2026-10-14

### 已完成：手機版背景黑框根治修復（幾何數學與渲染架構重構）
- **黑框根因剖析**：
  - 舊架構使用 `170vw` 長方形搭配 `rotate(0~360deg)` 旋轉動畫。手機螢幕高寬比通常超過 2.16（例如 393×852），半寬僅 331.5px，而垂直半高需 422px。
  - 當長方形旋轉至 90°／270° 時，窄邊轉為垂直方向，螢幕頂部與底部瞬間露出各 90px 空白，呈現旋轉中的斜角黑色硬切邊界（即用戶看見的黑框）。
- **徹底根治重構**：
  1. **零旋轉滿版容器**：`.mobile-aurora-mesh` 鎖定 `position: fixed; inset: 0; width: 100vw; height: 100vh; overflow: hidden;`，容器邊界與手機視窗 100% 絕對重合，物理上不可能露底。
  2. **雙正圓有機呼吸光斑**：使用 `::before` 與 `::after` 正圓（`border-radius: 50%`、直徑 `150vw`），漸層於 70% 處完全羽化為 `transparent`，零直角、零邊界。
  3. **位移動態取代旋轉**：採用獨立的 `translate3d + scale` 雙向漂游呼吸動態，完全消除旋轉帶來的切邊，且 GPU 硬體合成層消耗極低。
  4. **網格邊界平滑羽化**：手機版 `.grid-bg` 加上下線性漸層遮罩（`mask-image`），消除區塊間的水平硬切黑線。

## 2026-10-18

### 已完成：全站反偵查反破解防護強化
- **表單防灌水與防注入（`FeedbackModal.jsx`）**：
  - 植入商業欄位偽裝蜜罐（`corporate_organization`，螢幕外絕對定位），徹底瞞過智慧爬蟲與 LLM Agent 的啟發式 DOM 探測，自動填表靜默攔截。
  - 部署 `sanitizeSheetInput` 消毒函數，防禦 Google Sheets 試算表公式注入攻擊（CSV / Formula Injection），強制將開頭為 `=, +, -, @` 的內容轉義為純文字。
  - 輸入邊界限制（Name: 60 字元、Email: 100 字元）與 20 秒本地防刷冷卻（Anti-Flood Cooldown），保護 GAS 每日執行配額。
  - 開啟彈窗時徹底重設狀態，杜絕提前關閉彈窗導致的狀態殘留。
- **資產保護與 Canvas 記憶體防 Dump（`CanvasSequence.jsx`）**：
  - 覆寫備援序列畫布 `toDataURL` 與 `toBlob` 導出函數，阻斷從 DevTools Console 批次 dump 每一影格無損圖檔。
  - 播放器外層容器與 Canvas 綁定 `contextmenu` 阻斷，防止透過滑鼠右鍵另存影格或影片。
- **OWASP 軍規級 HTTP 安全標頭（`vercel.json`）**：
  - `X-Frame-Options: DENY`：徹底封死外站透過 `<iframe>` 嵌套假冒或發動點擊劫持（Clickjacking）。
  - `X-Content-Type-Options: nosniff`：防止瀏覽器進行 MIME 探測與腳本偽裝。
  - `Referrer-Policy: strict-origin-when-cross-origin`：保護跳轉來源隱私。
  - `Content-Security-Policy (CSP)`：明確限制腳本、字型、YouTube/Facebook 影片彈窗白名單，補齊 `object-src 'none'; base-uri 'self'` 阻斷外掛與 Base Tag 劫持。
- **爬蟲收割與 AI 訓練阻斷（`robots.txt`、`index.html`、`Contact.jsx`、`Modal.jsx`）**：
  - `robots.txt` 封鎖 GPTBot、ClaudeBot、Bytespider、CCBot、Google-Extended、Diffbot。
  - `Contact.jsx` 改用動態組裝信箱字串，破壞原始碼層級的明文 Email 正則特徵。
  - `index.html` 移除 Schema.org JSON-LD 內的明文信箱，替換為 `sameAs` 聯絡錨點，杜絕 OSINT 爬蟲收割。
  - `Modal.jsx` 將 iframe `referrerPolicy` 升級為 `strict-origin-when-cross-origin`。

### 已完成：Hero 播放器循環停頓根除修復（`CanvasSequence.jsx`）
- **雙重循環防線**：
  - 影片模式：DOM 注入強制 `loop` 屬性，監聽 `timeupdate` 在尾端 0.08 秒前主動平滑重置，並以 `ended` 事件作為保底，徹底消除解碼器在最後一格的停滯問題。
  - 序列模式：`rAF tick` 升級容錯前進演算法，播到最後第 144 格跨回第 0 格時若目標幀未就緒，自動向前尋找最近可用影格推進，絕不停滯死鎖。
- **單元測試**：新增 `CanvasSequence.test.jsx` 影片播畢自動循環重置測試，全站 33 個測試全數綠燈通過。

## 2026-10-27

### 已完成：全站資安強化與作品集卡片 3D 傾斜流暢度優化
- **資安風險全數清零**：
  - `Contact.jsx` 與 `public/llms.txt`：移除 `aria-label` 與 `llms.txt` 中的明文 Email，改為動態插值與 `#contact` 錨點，徹底防堵爬蟲正則收割。
  - `VisualSynthesis.jsx` 與 `Manifesto.jsx`：`window.open` 補齊原生 `'noopener,noreferrer'` 第三參數，強制跨程序執行緒隔離並防範 `opener` 殘留。
  - `FeedbackModal.jsx`：`sanitizeSheetInput` 升級防禦跨行（`\r\n`）與管線符號 `|` 公式注入；20 秒防刷冷卻結合 `sessionStorage`，防止重整繞過。
  - `vercel.json`：新增 `Strict-Transport-Security` (HSTS)，並於 CSP 補齊 `frame-ancestors 'none'; upgrade-insecure-requests;` 與 `https://web.facebook.com`。
  - NPM 依賴套件安全升級：修復 `@vitest/mocker`、`undici`、`browserslist`、`nanoid`、`source-map-js` 等並將 `vite` 升級至 `v7.3.7`，`npm audit` 漏洞數降為 `0`。
- **作品集卡片 3D 傾斜與載入優化（`VisualSynthesis.jsx`）**：
  - 移除桌機版卡片底圖預設的 `md:blur-[2.5px] md:brightness-[0.68] md:saturate-[75%]` 與 `filter` transition，改用純合成層 `transition-[opacity,transform]`，消除 3D 傾斜時每幀重新光柵化模糊濾鏡造成的掉幀。
  - 新增 `loadedImageCache` 快取已載入圖片 URL，切換分類 Tab 零閃爍。
  - 僅在 `hasVideo` 卡片綁定 3D 傾斜與果凍彈跳事件，純展示卡片不再誤觸動態。
- **渲染、互動邊界與流暢度深度調校**：
  - `src/index.css`：滾動期間 `body.is-scrolling` 改為僅停用卡片與視差框指針感應，保留頂部導覽列與按鈕隨時可點擊，並解決穿透 `body` 造成系統原生白游標閃現的問題；補上 `.crystal-inner` 的 `animation-delay: inherit` 與 `.gold-glow-pulse` 的 `isolation: isolate`；清理重複與廢棄樣式。
  - `useParallaxOrbit.js`：改以 CSS 變數 `--orbit-tx/ty/rx/ry` 驅動 3D 軌道視差，不再覆寫首屏 `scale(0.65) -> scale(1)` 進場縮放。
  - `VisualSynthesis.jsx` 與 `RefractionCard.jsx`：快取 `getBoundingClientRect()` 時同步比對 `window.scrollY`，消除滾動後卡片 3D 傾斜與玻璃反光座標偏移，並限制傾斜角度於 `±7deg` 內。
  - `CanvasSequence.jsx`：移除隨機截斷尾端影格的 `timeupdate` 監聽，並在退回 `frames` 備援模式時執行 `video.removeAttribute('src')` 釋放頻寬。
  - `CursorGlow.jsx`：精確化互動選擇器（不再誤觸大面積數據面板）、行動端跳過全域滑鼠監聽，並在首次 `mousemove` 前隱藏游標杜絕左上角 `(0, 0)` 穿幫。
  - `Modal.jsx` 與 `FeedbackModal.jsx` & `Navigation.jsx`：移除雙層重度高斯模糊、補齊捲軸寬度補償防跳動、清理 `closeTimerRef` 與 124 行未使用死碼（`Modal` 體積減半）、補上表單 `htmlFor`/`id` 與行動選單背景防穿透。
  - `Manifesto.jsx`：支援 iPad / 觸控裝置點擊開啟 Flame 節點圖、微調 375px 手機版按鈕字級防裁切、同步「磊山保經」影片 ID。
  - `index.html` 與靜態資源：移除未使用的 6 個斜體字型請求、補齊 `mobile-web-app-capable` meta、刪除廢棄的 `public/f1.jpg`（減少 551 KB）。



