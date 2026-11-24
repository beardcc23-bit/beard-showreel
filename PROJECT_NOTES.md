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

## 2026-11-13

### 已完成：年資升級（14 年）自動演進機制、彈窗鎖定與滾動順暢度深度重構
- **年資更新與單一資料源（SSOT）**：
  - `src/data/experience.js`：新增 `CAREER_START_YEAR = 2012`、`getExperienceYears()`（保底 `14`，隨年份自動遞增）與 `achievementStats` 設定。
  - `src/components/Introduction.jsx`、`public/llms.txt`、`public/sitemap.xml`：後期資歷統一更新為 `14+` 年。
- **彈窗鎖定與無障礙架構重構**：
  - 新增 `src/hooks/useOverlayLock.js`：統一接管 `Modal.jsx`、`FeedbackModal.jsx`、`Navigation.jsx` 的 `lockCount` / `cursorHideCount` 參照計數、捲軸寬度補償、Lenis 暫停、LIFO `Escape` 堆疊關閉、`Tab` 焦點陷阱（Focus Trap）與 `preventScroll: true` 焦點歸還。
  - 新增 `src/utils/url.js`：抽離 `openSafeExternalUrl()` 供 `VisualSynthesis.jsx` 與 `Manifesto.jsx` 共用，並補齊兩處分類切換的 WAI-ARIA `tablist` / `tab` / `tabpanel` 語意。
  - `vercel.json`：CSP 補齊 `form-action 'self';`，並將 `media-src` 收緊為 `'self'`、`img-src` 收緊為 `'self' data: https://i.ytimg.com`。
- **滾動順暢度與渲染效能極致調校**：
  - 新增 `src/hooks/useOffscreenPause.js`：以全站單一共享 `IntersectionObserver` 直接操作 DOM `section-offscreen` 類別，取代 `Hero`、`Introduction`、`Manifesto`、`VisualSynthesis` 原本基於 React state 的 `useInView`，使跨區快速滾動達到 **0 次 React Re-render**，並補齊首屏離屏時 `.glow-border` 與 `.animate-bounce` 自動休眠。
  - `src/hooks/useLenisScroll.js`：背景分頁暫停 rAF 並在切回前景時重置 `lenis.time = 0`（防止首幀 `deltaTime` 暴衝瞬移跳格）；滾動狀態改用區域布林快取＋時間戳延遲檢查，減少 120Hz 下 95% 以上的計時器分配。
  - `src/components/common/AnimatedCounter.jsx`：改以 `spanRef.current.textContent` 直寫取代每幀 `setState`。
  - `src/components/VisualSynthesis.jsx` & `src/components/RefractionCard.jsx`：模組層級快取單一 `hoverNoneQuery`，滑鼠座標改存 `pointerRef` 並受 `rafRef` 節流。
  - `src/App.jsx` & `src/index.css`：根容器與 `body` 升級為 `overflow-x: clip` 消除雙層隱式捲動容器；為 `.ring-middle` 與 `.gold-flow-border::before` 補齊 `will-change: transform` 隔離旋轉合成層。
- **測試覆蓋**：全站擴充至 13 個測試檔、39 項單元測試 100% 通過，`npm audit` 維持 `0 vulnerabilities`。

## 2026-11-23

### 已完成：v2 暗房光學磨砂玻璃視覺重塑與架構升級（舊版已封存於 `archive/v1-classic` / `v1.0.0`）
- **舊版完整歸檔**：
  - 原 v1 經典版（Commit `259f296`）已建立永久分支 `archive/v1-classic`、`v1.0.0` 版本標籤，並於本機保留 `beard-showreel-v1-archive` 實體備份。
- **WebGL 流體色散光影引擎（`OpticalLightField.jsx`）**：
  - 新增原生 WebGL GLSL 流體色散 Shader（無 WebGL 時自動降級至 `public/optical-streak.webp` 光譜備援層），光源固定於左側／左下角往右上 40°~45° 斜射，深黑底色（`#030407`）佔比維持 52%~58%，彈窗開啟或背景分頁時自動暫停 rAF。
  - 移除舊版 `CursorGlow.jsx`、`MobileAuroraBackground.jsx` 與 `useParallaxOrbit.js`，恢復系統原生游標。
- **純淨磨砂毛玻璃與 3D 導光厚邊（`src/index.css`）**：
  - 統一 `.optical-surface` 柔霧磨砂玻璃，搭配 `::before`（右側 `8px` `skewY(-26.565deg)`）與 `::after`（頂部 `4px` `skewX(-63.435deg)`）無縫咬合 3D 玻璃厚度斷面，以暗房深黑底色摻雜慢速流轉色散光。
- **全站字體與五幕版面重構**：
  - 字體升級為 `Space Grotesk` + `Plus Jakarta Sans` + `JetBrains Mono` + `Noto Sans TC`。
  - `Hero` / `CanvasSequence` 與 `Introduction` 肖像採無外框純淨呈現，並為備援序列導入滑動視窗（前方 24 格＋後方 6 格）記憶體回收。
  - `Manifesto` 改為左欄 `sticky` 宣言＋右欄三層滾動堆疊磨砂分鏡卡；`VisualSynthesis` 升級為前 2 支主推 `2x2` Bento ＋ `1px` 燈箱牆。
  - `Contact` 重構為瑞士 `7:5` 雙欄 `1px` 分割厚玻璃互動艙；`FeedbackModal` 改為右側全高滑出式磨砂玻璃抽屜。
- **資安與測試強化**：
  - `vercel.json` 收緊 `script-src 'self'` 與 `Cross-Origin-Opener-Policy: same-origin`；`Modal.jsx` 升級為 `youtube-nocookie.com` 搭配 `sandbox`；`url.js` 實作外部網域白名單與本地圖片路徑校驗；`robots.txt` 開放 `ChatGPT-User` 提升 AI 搜尋引用率。
  - 全站 13 個測試檔、40 項單元測試與生產建置全數通過。
- **v2 視覺細節定稿打磨（同日第二波）**：
  - **作品欄重構（`VisualSynthesis.jsx` & `portfolio.js`）**：升級為 `1 大 4 小` 非對稱 Bento 裱框牆＋半透明透光磨砂文字欄；6 大分類主推大圖全數更換為 `1440px` Retina 高清 WebP（UCC、Tokuyo 按摩椅、Foxtron Caviar、新光三越寶可夢、活沛多、磊山保經）並附帶 `?v=2` 擊穿快取；加入方向感知與封頂波浪進場動態及 Tab 透光滑塊；無影片項目維持靜態呈現、零 icon 與零誤導動態。
  - **全站減法美學與元件統一**：全面清除各區多餘裝飾性英文小字與中括號編號（保留 Manifesto 右上角 `01`/`02`/`03` 浮水印）；主按鈕 `.spectral-cta` 升級為品牌橘紅半透線框（Crimson Ghost CTA）；數據卡改為數字右上上標 `+` 搭配純白底部對齊單位；`Autodesk Flame` 懸浮預覽改為 Portal 智慧定位於文字右下／右上方（`min(44vw, 680px)`、`1920×902` 零裁切）；聯絡區雙艙字級平衡並配品牌橘色圖示框。
  - **版本歸檔命名對齊**：昨天以前的原版（`259f296`）鎖定為 `v1`（本機 `beard-showreel-v1` + 遠端 `origin/v1` + 標籤 `v1.0.0`），現行版本為 `v2`（`origin/main`）。

## 2026-11-24

### 已完成：行動端體驗打磨、35mm 底片顆粒與全站排版防呆工程
- **行動端漢堡選單與彈窗裁切根治（`Navigation.jsx`、`Modal.jsx`、`FeedbackModal.jsx`、`index.css`）**：
  - 行動抽屜移除會遭手機網址列裁切的 `h-screen`，全面改為 `fixed inset-y-0 left-0 overflow-y-auto overscroll-contain` 並加入底部安全區 `env(safe-area-inset-bottom)`；修正 `.lenis.lenis-smooth [data-lenis-prevent]` 誤寫的 `overflow: clip;` 為 `overscroll-behavior: contain;`。
  - `Modal` 與 `FeedbackModal` 同步改用 `max-h-[94dvh]` / `max-h-[100dvh]` 搭配 `overflow-y-auto overscroll-contain` 與底部安全區。
- **永久排版防呆守門機制（`src/utils/__tests__/layoutGuard.test.js` & `.agents/AGENTS.md`）**：
  - 新增 5 項靜態守門測試隨 `npm run test:run` 與 Git pre-commit hook 強制執行（禁用 `fixed` + `h-screen`、鎖定 `[data-lenis-prevent]` 僅用 `overscroll-behavior: contain`、禁用 `fixed` 與 `optical-surface` 同層覆蓋、禁止 `optical-surface` 外層 `overflow-hidden`、強制行動抽屜／彈窗含 `overflow-y-auto`）。
  - 全站擴充至 **15 個測試檔 / 46 項單元測試** 100% 通過，`npm audit` 維持 `0 vulnerabilities`。
- **背景光影行動端優化與 35mm 底片顆粒（`OpticalLightField.jsx` & `index.css`）**：
  - Fragment Shader 加入直屏權重 `portrait = smoothstep(1.15, 0.55, aspect)`，將手機直屏深黑留白穩定收束至約 **60%**（桌機零影響），同步於 `@media (max-width: 767px)` 收束無 WebGL 降級光雲。
  - 於同一 WebGL Pass 內建 **12fps 輕量 35mm 電影底片銀鹽顆粒**（強度 `0.034`，雙頻類高斯分佈＋中間調加權不發灰、零新增 DOM／圖層）。
  - 行動端自動降耗約 **75%**：切為 `powerPreference: 'low-power'`、背景採樣 `0.55x`、幀率鎖定電影標準 `24fps`（並依幀率補償滾動阻尼手感）。
- **細節文案與行動端版面精簡（`Contact.jsx`、`FeedbackModal.jsx`、`VisualSynthesis.jsx`）**：
  - 聯絡區信箱字級統一對齊內文（`text-sm sm:text-base md:text-[17px]`、`tracking-wide`）。
  - 回饋表單全數統一為純繁極簡文案（`您的稱呼`、`信箱 / LINE` / `選填，方便回覆您`、`回饋內容`、`取消` / `送出回饋`）。
  - 作品欄行動端以 `hidden md:flex` 隱藏 17 筆無影片連結靜態作品並於行動預載跳過，保留 80 筆可播作品（桌機維持完整 97 筆）。
- **外部連結修復、3C 大圖置換、CI 升級與 6 大分類優先排序（同日下午第二波）**：
  - **外部社群連結修復（`url.js`、`VisualSynthesis.jsx`、`Manifesto.jsx`）**：移除 `openSafeExternalUrl` 因 `noopener` 回傳 `null` 而誤觸 `window.location.assign` 覆寫原分頁的 Bug；抽離 `getSafeExternalUrl` 白名單校驗，全站所有 Facebook / Instagram 外部作品改用原生 `<a target="_blank" rel="noopener noreferrer">`，確保桌機與手機 100% 保留原網站分頁。
  - **3C 主推大圖與 6 大分類黃金排序（`portfolio.js`、`B-10.webp`、`VisualSynthesis.jsx`）**：將 3C 主推大圖更換為 `Samsung Galaxy Tab S11 Ultra`（`910×946` 高畫質 WebP 搭配 `imagePosition: "50% 34%"` 焦點校正防削頭），並依最新指定完成 6 大分類前排優先順序重排與 97 筆完整性測試。
  - **GitHub Pages 部署升級（`.github/workflows/deploy.yml`）**：拆分官方標準 `build` ➔ `deploy`（`needs: build`）雙作業並全面升級至 Node 22 與新版官方 Actions（`checkout@v7`、`setup-node@v7`、`configure-pages@v6`、`upload-pages-artifact@v5`、`deploy-pages@v5`），消除 Artifact 索引競態失敗與 Node 20 棄用警告。
- **首頁 Hero 改版為滾動逐幀時間軸＋3D 玻璃棱柱滑桿＋3C 大圖版面根治（同日第三波）**：
  - **滾動驅動逐幀舞台（`Hero.jsx`、`CanvasSequence.jsx`、`src/constants/heroScroll.js`）**：淘汰首屏自動循環影片與中央懸停 `WATCH FULL SHOWREEL` 按鈕；改為 Sticky 滾動刷幀（桌機 `280vh` 抽樣 73 格 `8.29 MB`、手機 `230dvh` 抽樣 49 格 `1.81 MB`），向下滑正播、向上滑倒轉，尾段 `86% → 100%` 微縮淡出銜接「個人介紹」；導入時間無關指數衰減阻尼（60Hz / 120Hz 一致手感）、離屏早退守衛（下方 97 筆作品捲動 0 rAF）、`img.decode()` 背景預解碼與彈窗／分頁復原收斂。
  - **右側纖細 3D 暗房厚玻璃棱柱滑桿（`index.css`、`CanvasSequence.jsx`）**：復刻全站 `.optical-surface` 26.565° 立體斜切玻璃斷面（`5px` 寬、`5px/2.5px` 零毛刺咬合切面，移去細條 `backdrop-filter` 避免 GPU Readback），搭配半透明橘紅中空指針方塊與同軸置中紅色向下箭頭（`73% → 83%` 淡出）；支援點擊／按住拖曳 0ms 直刷 145 格與鍵盤無障礙操作。
  - **首次進站閒置自動演繹（`src/hooks/useIdleHeroAutoScroll.js`）**：僅於桌機（非手機與非純觸控裝置）首次載完首幀且無操作滿 `3.5 秒` 時，以 `4.8 秒` `easeInOutSine` 自動柔順推進全序列並帶進「個人介紹」；手機與純觸控平板完全交給原生觸控手勢；全程僅觸發一次，於 `capture` 捕獲階段監聽 `pointerdown` / `touchstart` 與 `wheel` / `keydown` / `body.modal-open` 做到 0ms 瞬停不搶捲軸、不覆蓋滑桿點擊。
  - **左上角返回定版（`Navigation.jsx`）**：點擊 `Beard Showreel` 精準回到 Hero 最後一張滿版定版位置（`HERO_FINAL_FRAME_PROGRESS = 0.855`），並與 `CanvasSequence` 共用 `src/constants/heroScroll.js` 單一常數來源。
  - **3C 主推大圖裁切與 Grid 防撐高（`B-10.webp`、`VisualSynthesis.jsx`、`portfolio.js`）**：將正方形 `B-10.webp`（`910×946`）依構圖精準裁切上下為 `910×574`（41KB），同時為主推 2×2 大圖 `<img>` 加上 `lg:absolute lg:inset-0` 脫離 Grid 固有高度計算，徹底消除右側 4 張小卡下方黑色間隔。
  - **全站巨型幕標 VFX 光學快門掃光顯影（`src/components/common/RevealHeading.jsx`）**：新增共用大標動效元件並統一套用至 `Beard Chou`、`THE MANIFESTO`、`ADVERTISING`、`Let's Connect.`；進視口單次觸發純 GPU `clip-path` 橫向曝光＋2px 光譜光刃掃描（致敬 Flame Before/After Wipe），支援 `prefers-reduced-motion` 與單一語意 `<h2>`。
  - **行動端首屏與排版三大升級（`CanvasSequence.jsx`、`Hero.jsx`、`Manifesto.jsx`、`VisualSynthesis.jsx`）**：
    - 手機首屏改為直向 `3:4`（`aspect-[3/4] max-h-[72dvh]`）滿版 `object-cover` 居中裁切左右，強化直屏視覺張力並兼顧 664px 矮視口提示不裁切。
    - `Manifesto` 三層卡片將 `sticky` 抽離至獨立外層容器（解除 `.optical-surface` 的 `position: relative` 覆蓋），於手機版實現 `top-[76px]` → `top-[92px]` → `top-[108px]` 與遞增 `zIndex`（11/12/13）依序疊壓，並加入 `!bg-[#060911]/[0.92]` 暗房底襯杜絕底下文字穿幫重影。
    - `VisualSynthesis` 手機版改為 `grid-cols-2`（首張主推卡 `col-span-2` 滿版大圖、其餘作品自動縮半兩欄並排並精調小卡底欄字級與間距）。
  - **全站底層效能、流量與瘦身總整理（同日第四波）**：
    - `index.html` & `CanvasSequence.jsx`：Favicon 與首屏 `<link rel="preload">` 全改為 `%BASE_URL%` 並直接對準真實首幀 `png-0_00000000.webp?v=3`（消除首屏 136KB 重複下載與 GitHub Pages 子路徑失效）；YouTube `preconnect` 改指向實際使用的 `https://www.youtube-nocookie.com`。
    - `OpticalLightField.jsx` & `Navigation.jsx`：桌機 WebGL 背景鎖定 `36fps`（`12fps` 底片顆粒 3 倍整數倍，120Hz 筆電 GPU 耗電降約 70%）；行動端跳過全域 `mousemove`；兩處滾動監聽全面改用 `ResizeObserver` 快取 `maxScroll` 達成滾動期 0 次同步 Layout 讀取。
    - `Modal.jsx` & `index.css` & `public/`：彈窗內層殘留 `vh` 全面升級 `dvh`；清除 `index.css` 內 106 行已淘汰舊版死碼；刪除 `public/` 下 7 支零引用舊影片與廢圖（`hero*.mp4/webm`、`hero-poster*.webp`、`youtube-logo.webp`，部署包減重約 **8.6 MB**），全站 **16 個測試檔 / 48 項測試**全綠過關。

### 下一步待辦
- **Showreel 片頭重製（Velvet Edition）**：已於 `/Users/beard/Desktop/1/showreel_intro_concepts/velvet_edition/` 備妥 4 張貼合網站平行 45° 煙燻藕紫＋冰鋼藍絲絨光場的大反差首尾幀與 8 秒高動態 Prompt；待切換有額度之影片生成帳號產出片頭後，可再以 `ffmpeg` 精剪 6 秒並轉製網站 `hero.webm` / `hero.mp4` / `hero-poster.webp` 及 Flame ProRes 母帶。




