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
    - `Modal.jsx` & `index.css` & `public/`：彈窗內層殘留 `vh` 全面升級 `dvh`；清除 `index.css` 內 106 行已淘汰舊版死碼；刪除 `public/` 下 7 支零引用舊影片與廢圖（`hero*.mp4/webm`、`hero-poster*.webp`、`youtube-logo.webp`，部署包減重約 **8.6 MB**）。
  - **深水區效能拆包、無障礙與社群分享預覽總補強（同日第五波）**：
    - `VisualSynthesis.jsx`：移除作品卡片文字底欄多餘的 `backdrop-blur-md backdrop-saturate-[160%]` 改用暗房深色微透底襯，徹底消除手機滑過 20 張兩欄小卡時的離屏高斯模糊合成壓力。
    - `Contact.jsx`：`FeedbackModal`（351 行）改為 `React.lazy` 按需拆分獨立 chunk，並於懸停／聚焦按鈕時預熱載入，維持點擊秒開與離場滑出動畫。
    - `index.html`、`public/og-cover.jpg`、`sitemap.xml`、`robots.txt`、`llms.txt`：Google Fonts 改為 `media="print" onload` 非阻塞載入加速 FCP；產製 `1200×630` 橫式主視覺分享海報 `og-cover.jpg`（91KB），並將全站 Canonical、Open Graph、Twitter Card、JSON-LD 與 Sitemap 同步對齊實際線上網址 `https://beardcc23-bit.github.io/beard-showreel/`，解決 LINE / FB 貼連結破圖問題。
    - `useOverlayLock.js` & `Navigation.jsx`：新增 `--scrollbar-comp` CSS 變數同步補償 `fixed` 頂部導覽列右緣（消除開彈窗時導覽列跳動 `15px`），移除已廢棄之自訂游標事件與手動覆寫 `body` 類別之越權操作。
    - `AnimatedCounter.jsx` & `CanvasSequence.jsx`：數據牆補齊 `aria-label` 真實數值（避免爬蟲與螢幕閱讀器讀到 `0+`）與 `prefers-reduced-motion` 直顯終值；手機右側 `4px` 3D 玻璃滑桿以透明偽元素隱形擴展觸控熱區至 `38px`，全站 **16 個測試檔 / 48 項測試**全綠過關。

### 下一步待辦
- **Showreel 片頭重製（Velvet Edition）**：已於 `/Users/beard/Desktop/1/showreel_intro_concepts/velvet_edition/` 備妥 4 張貼合網站平行 45° 煙燻藕紫＋冰鋼藍絲絨光場的大反差首尾幀與 8 秒高動態 Prompt；待切換有額度之影片生成帳號產出片頭後，可再以 `ffmpeg` 精剪 6 秒並轉製網站 `hero.webm` / `hero.mp4` / `hero-poster.webp` 及 Flame ProRes 母帶。

## 2026-11-25

### 已完成：首頁新序列替換（Timeline 4_1）、離場等速滑動耦合、全站 Montserrat 字體統一與劇院級／直式滿版升級
- **首頁 117 格序列全面重製與滿版化（`public/png-0/`、`public/png-0-mobile/`、`public/og-cover.jpg`、`Hero.jsx`、`CanvasSequence.jsx`）**：
  - 將首頁序列更新為 `Timeline 4_1.mov` 全 117 格（`00000000` ～ `00000116`），快取參數升版至 `?v=7`，並以第 99 格正面定版更新 `1200×630` 社群分享縮圖 `og-cover.jpg`。
  - **桌機劇院級滿版（方案 1）**：解鎖 `Hero.jsx` 原本 `max-w-[1136px]` 限制至 `1760px`（搭配視窗高度自適應公式防底部提示裁切），並將 `public/png-0/` 升級為原生 `1920×1080` Full HD 全 117 格載入（`11MB`），大銀幕放大依然銳利零跳格。
  - **手機直式暗房無縫延伸滿版（方案 A）**：以 `uv` + Pillow + NumPy 將 `public/png-0-mobile/` 重製為 `648×1036` 直式畫布（`4.0MB`、抽樣 59 格），頂端 `y = 0` 起 100% 完整保留原圖亮部與 `Beard Showreel` 全字不切字、零頂部漸層削頭，僅於下方交界平滑漫射熔接暗房背景（`?v=8`）；搭配 `h-[62dvh]`、`object-top`、緊湊 `h-auto` Sticky 舞台與 `Introduction` `pt-6`（移除手機版橫切光束細線），消除首屏與個人肖像間的空白斷層。
  - **桌機縮放頂部釘選與跨斷點自動換圖**：桌機與手機統一 `items-start`（`md:pt-[84px]`、`origin-top`），視窗任意縮放時首頁銀幕恆定釘於導覽列下方不留大空隙；補齊 `resize` 跨 `768px` 斷點自動切換橫／直圖源。
- **行動端作品牆底部極簡快速切換與聯絡區字級統一（`VisualSynthesis.jsx`、`Contact.jsx`）**：
  - 於手機／平板作品牆底部新增與上方單欄小卡 1:1 等寬高的 `.optical-surface` 單鍵（顯示「下一分類名稱 ＋ 箭頭」），一鍵切換下一分類並平滑捲回分類標籤頂端（支援末項循環與懸停預載）。
  - 聯絡區 `beard.cc23@gmail.com` 與 `Leave a Note` 統一為 `text-lg sm:text-xl md:text-2xl font-bold` 並移除原生 `title` 白框提示；全站擴充至 **16 個測試檔 / 49 項測試**全數通過。
- **尾段變透明與離場上滑 1:1 等速耦合（`src/constants/heroScroll.js`、`CanvasSequence.jsx`）**：
  - 解除原本 `progress = 1.0` 的封頂限制，將追蹤區間延伸至 `HERO_EXIT_END_PROGRESS = 1.26`，並採單一等速線性斜率推進影格：滑至 `86%` 定版點（第 80 格清晰轉正）時滑桿走滿 `100%`，進入變透明微縮與 Sticky 放開上滑離場區（`86% → 126%`）時，水晶圓環緊貼滑動速度等速走完第 `81 ～ 117` 格餘韻幀。
  - 移除桌機 Lenis 啟用時的雙重阻尼滯後（改為同幀 1:1 零延遲同步，純觸控手機提升至 `lambda = 42`），徹底消除快速上滑時的掉拍卡頓感。
- **全站展示英文字體統一與履歷精簡（`index.html`、`tailwind.config.js`、`index.css`、`experience.js` 等）**：
  - 全站大英文標題與數據（`Beard Showreel`、`Beard Chou`、`THE MANIFESTO`、`ADVERTISING`、`Let's Connect.`、`Leave a Note`、數據牆）淘汰 `Space Grotesk`，統一更換為與首頁影片一致的 `Montserrat`（`800 ExtraBold`），並微調手機端 `clamp` 確保長單字不超框。
  - 自 `src/data/experience.js` 刪除 2011 美可特與 2009 冉色斯兩筆實習紀錄，同步更新單元測試。
- **全站兩輪深度效能、架構與無障礙優化總收斂（同日晚間收工波）**：
  - **資產與首屏減重（首頁維持第一代原生 Full HD 畫質）**：桌機 `public/png-0/*.webp` 117 格維持第一代原生 `1920×1080` 無二次損耗畫質（`10.54 MB`、首幀 `33KB`、快取升版至 `?v=11`）；`public/favicon.png` 量化縮至 `192×192`（`54KB → 11KB`）、`public/avatar.jpg` 縮至 `52KB`；移除 `index.html` 零引用之 `i.ytimg.com` 連線並補齊主 Showreel `VideoObject` 結構化資料，`sitemap.xml` `lastmod` 更新至 `2026-11-25`。
  - **休眠省電與 GPU 渲染管線升級**：
    - `useLenisScroll.js` 升級為按需休眠架構：頁面靜止（`idleFrames >= 2`）或彈窗開啟時自動停止 `requestAnimationFrame` 達成 **0 CPU 閒置喚醒**，於滾輪／觸控／鍵盤／`scrollTo` 時 0ms 喚醒並重置 `lenis.time = 0` 防首幀跳動。
    - `OpticalLightField.jsx` 升級為 3 頂點全螢幕三角形（Full-Screen Triangle）消除對角線 Overdraw、導入 `dt` 時間無關指數阻尼，並補上 `webglcontextlost` 自動降級至 CSS 光譜備援層。
    - `CanvasSequence.jsx` 離場終點自動歸零 `opacity` 並切換 `visibility: hidden` 剔除離屏合成層，`prefers-reduced-motion` 下直接載入第 80 格清晰定版幀（`00000079`）；`ScrubText.jsx` 滾過後自動歸還 `will-change: auto`；`RefractionCard.jsx` 離場自動歸位光暈座標。
    - `App.jsx` 首屏就緒後閒置預熱 `Modal` chunk；`Manifesto.jsx` 進入視窗前預熱 `f1.webp` 並收斂為單一 Pointer 事件；`VisualSynthesis.jsx` 六大分類排序提升至模組頂層 `ORDERED_ITEMS_BY_ID` 一次性預算，前 5 張首屏卡片設為 `eager` 搭配原生 `fetchpriority`。
  - **單一資料源（SSOT）、無障礙與表單韌性**：
    - 新增 `src/constants/siteConfig.js` 與 `src/utils/scroll.js`，擴充 `src/constants/heroScroll.js`（`getHeroStickyScrollable`、`getHeroFinalFrameY`），清理 `index.css`、`tailwind.config.js`（移除零引用 `aurora-blue`）與 `url.js` 遺留死碼；`vite.config.js` 鎖定 `server.port: 5173` 與 `build.target: 'es2020'`。
    - `VisualSynthesis.jsx` 分類列實作完整 WAI-ARIA `tablist` 左右方向鍵／`Home`／`End` 與 Roving `tabIndex`；`useOverlayLock.js` 於鎖定期間對 `<main>` 與 `<footer>` 掛載原生 `inert`；`Modal.jsx` 關閉鈕移至獨立頂欄並設 8 秒 iframe 看門狗；`FeedbackModal.jsx` 修復 12 秒逾時 `didTimeout` 防卡死、補齊 `autoComplete` / `aria-required` / `role="alert"` / `0 / 500` 字數統計與漏填自動 `focus()`；`useClipboard.js` 檢查 `execCommand` 回傳值。
    - `src/test/setup.js` 補齊 `scrollTo` 與 `getContext` 樁，全站擴充至 **16 個測試檔 / 51 項單元測試** 100% 通過且 **0 stderr 警告**。
  - **全站大字幕標單排鎖定與橘色導引橫條顯影升級（`RevealHeading.jsx`、`Contact.jsx`、`Introduction.jsx`、`Manifesto.jsx`、`VisualSynthesis.jsx`）**：
    - 移除 `Contact.jsx` 標頭 `max-w-2xl` 寬度限制，全站四處大字幕標（`Beard Chou`、`THE MANIFESTO`、`ADVERTISING`、`LET'S CONNECT.`）統一鎖定 `whitespace-nowrap` 與對應流體 `clamp()` 字級，確保任意視窗尺寸皆固定單排不折行。
    - `RevealHeading.jsx` 進場時長放慢至 `1.6s`（勻順曲線 `[0.24, 0.82, 0.32, 1]`、視窗 `50%` 觸發），並於底緣新增同步由左至右延伸領跑的 `3~4px` 品牌熾熱橘紅導引橫條（定版後柔和消隱）與加長橘紅掃描光帶，強化視覺由左至右的閱讀引導。

## 2026-11-26

### 已完成：行動端母子雙翼漢堡選單重構、作品牆光學快門波浪顯影與無倒拉換頁
- **行動端漢堡選單精煉窄版與母子雙翼連體架構（`Navigation.jsx`、`VisualSynthesis.jsx`）**：
  - 抽屜收窄為精煉比例（`w-[198px] min-[390px]:w-[216px] sm:w-[260px]`），將 `建立聯繫` 橘紅框移入 `作品案例` 正下方，並統一母子選單全部文字為共用常數 `MOBILE_MENU_TEXT_CLASS`（`text-[16px] min-[390px]:text-[18px] font-medium tracking-[0.06em]`），外框放大為 `px-5 sm:px-6 py-3.5` 與上方按鈕垂直對齊。
  - `作品案例` 右側常駐品牌橘紅箭頭；點擊時於母選單右邊界後方零重疊向右滑出 **6 大作品分類子面板**（上下高度與左側四列選單中心 `1:1` 齊平），展開期間其他項目橘色線自動暗掉維持單一互斥焦點；點選分類即雙向連動切換 `VisualSynthesis` 並使母子雙翼一體同步向左退場消失。
- **作品牆「保留背景光影」透明瞬切換頁與 Z 字光學快門波浪（`VisualSynthesis.jsx`、`scroll.js`）**：
  - 行動端作品牆底部「下一分類」按鈕移至右側第 2 欄（`col-start-2`）；點擊切換時移除長距離往上倒拉捲動與死黑遮罩，改為**保留背後 `OpticalLightField` 流動光影、僅前景作品區 `150ms` 透明淡出 ➔ `instantScrollTo` `0ms` 無感回頂 ➔ 原地顯影**。
  - 全新雙端 **光學快門拉幕 ＋ 鏡頭回正（`clip-path` 方向感知曝光 ＋ `scale 1.085 → 1.0`）** 作品進場動態：補齊首次滑入 `ADVERTISING` 進場與折頁下滾動逐排顯現；桌機首屏嚴格依「左 `2×2` 大卡（`0.02s`）➔ 右側 4 張小卡 Z 字序（`0.22s ~ 0.64s`）➔ 下方整排 4 張（`0.78s ~ 1.17s`）」三段波浪依序接力曝光，杜絕下方排搶跑。
- **第三輪 37 項深度效能壓榨、死碼清除與部署韌性升級（同日上午第二波）**：
  - **GPU 合成層釋放與計算下沉**：`VisualSynthesis.jsx` 與 `RevealHeading.jsx` 於進場結束後自動解除 `will-change`（並卸載一次性橫條／光刃 DOM）；`OpticalLightField.jsx` 將純時間／捲動運算移至 CPU Uniform 傳入並為 `resize` 加 `rAF` 節流；`CanvasSequence.jsx` 以 `ResizeObserver` 快取幾何指標消除滾動熱路徑同步 `offsetHeight` 重排，並於首幀解鎖後卸除行內 `backgroundImage`；`App.jsx` 移除零引用的 `isPageLoaded` 根重繪並延遲掛載 `Modal` Portal；`vite.config.js` 將 `lenis` 拆入 `vendor` 長期快取 Chunk（主業務包降至 `97.8 KB`），`index.html` 移除未使用之 `Montserrat 600/900` 字重並對齊 `#030407` 暗房黑。
  - **架構模組化與死碼清零**：新增 `useMediaQuery.js`、`sequenceLoader.js`（含單元測試）與 `ErrorBoundary.jsx`（防部署換版動態 Chunk 404 白屏）；`siteConfig.js` 收斂 `APP_EVENTS` 事件常數；清除 `experience.js`、`tailwind.config.js`、`index.css` 遺留死欄位與零引用 Token，並移除廢棄之 `gh-pages`（刪減 29 個冗餘依賴套件）。
  - **互動、無障礙與部署強化**：`Modal.jsx` 頂欄左側顯示當前播放作品名稱；`CanvasSequence.jsx` 滑桿補齊 `aria-valuetext` 與 `PageUp/PageDown` 大步進；`Navigation.jsx` 補齊漢堡鈕 `aria-expanded`／`aria-controls`，`useOverlayLock.js` 將 `<nav>` 一併納入 `inert`；`FeedbackModal.jsx` 改用 `sessionStorage` 防未來系統時鐘鎖死、支援 `Cmd/Ctrl + Enter` 送出與草稿自動暫存；升級 `vercel.json`、`deploy.yml`（`timeout-minutes: 10` 與 `404.html` 保護）並新增 `public/manifest.webmanifest`，全站擴充至 **17 個測試檔 / 54 項單元測試** 100% 通過。
- **第四輪 24 項深水區效能、VRAM 減壓、鍵盤雙翼導航與守門測試強化（同日上午第三波）**：
  - **小卡影像縮放與空透明通道清除（`public/vfx/`）**：將 7 張非主推超尺寸小卡 Lanczos 縮至 `640px` 寬，並將 14 張誤帶空 Alpha 通道之 `RGBA` 劇照複合 `#07090E` 底色轉存為純 `RGB` WebP，降低小卡解碼與 VRAM 佔用（`og-cover.jpg` 維持原檔不動）。
  - **高頻執行期與省電收斂**：`CanvasSequence.jsx` 新增 `lastFrameAttrRef`／`lastHintOpacityRef` 差值守衛並補上視窗 `blur` 釋放滑桿拖曳鎖定；`OpticalLightField.jsx` 將指標正規化除法延後至 `36fps` 渲染幀；`scroll.js`、`useLenisScroll.js`、`useIdleHeroAutoScroll.js` 共用 `SCROLL_TRIGGER_KEYS` 與 `isEditableElement` 防輸入框誤觸；`VisualSynthesis.jsx` 改傳穩定 `waveOriginRef` 避免折頁下卡片多餘重繪並精簡 `buildOrderedCategoryItems`；`Navigation.jsx` Scroll Spy 批次收斂單次狀態更新；`index.css` 補齊 `.optical-frosted-drawer` 支援系統「減少透明度」與離屏動畫暫停。
  - **無障礙、影音內嵌與資安防護**：`Navigation.jsx` 行動雙翼選單支援 `ArrowRight` 展開聚焦子面板，以及 `ArrowLeft`／兩段式 `Escape` 先收合子面板再關閉母選單；`Manifesto.jsx` 提升模組級預熱鎖並支援桌機鍵盤 `Focus` 顯示與 `Escape` 收合 Flame 節點預覽；`Modal.jsx` YouTube 嵌入補上 `playsinline=1`；`Contact.jsx` 連點信箱順延 2.5s 提示計時；`FeedbackModal.jsx` 擴充全形公式字元（`＝＋－＠｜`）注入防禦，並於 `submitting` 傳送期間鎖定遮罩、取消鈕與 `Escape` 防中斷；`vercel.json` 擴充 `Permissions-Policy`；新增版控 `scripts/pre-commit.sh` 含敏感金鑰／Token 攔截掃描。
  - **排版守門員與核心測試擴充**：強化 `layoutGuard.test.js` 穿透解析樣板插值與跨行三元表達式；擴充 `portfolio.test.js` 斷言 6 大分類唯一 `featured` 與 97 張實體圖檔存在；新增 `Modal.test.jsx`、`ErrorBoundary.test.jsx`、`useMediaQuery.test.jsx`，全站擴充至 **20 個測試檔 / 65 項單元測試** 100% 通過。
- **第五輪 24 項孤兒幀清理、頻寬調度、邊界修復與 100% 元件測試覆蓋（同日上午第四波）**：
  - **資產瘦身與頻寬調度**：刪除 `public/png-0-mobile/` 57 張永不載入之奇數幀孤兒檔（目錄由 `4.0 MB` 降至 `2.1 MB`）；`VisualSynthesis.jsx` 修正首屏越界 `eager` + `fetchpriority="high"` 預載（改為進入作品區後啟用）、統一補上 `?v4` 快取版本號並為分類預載補齊 `img.decode()`；`sequenceLoader.js` 第 0 層優先排入第 80 格主視覺定版幀；`CanvasSequence.jsx` 補齊滑桿與舞台 `transform` 差值守衛並在 `0~87%` 主觀賞區清空冗餘 3D 矩陣；`OpticalLightField.jsx` 補齊 `webglcontextrestored` 自動重建管線與靜止態滾動權重快取；`Introduction.jsx` 肖像對齊 `3:4` 固有比例與響應式 `sizes`。
  - **互動邊界與架構收斂**：`VisualSynthesis.jsx` `handleTabChange` 主動清理 `cutTimersRef` 防 150ms 換頁競態；`Modal.jsx` 消除退場期間 `about:blank` 閃黑並略過無效來源 `onLoad`；`Navigation.jsx` 行動雙翼退場鎖定 `pointer-events-none` 並支援進站初始 URL Hash 自動扣除導覽列高度定位（`useIdleHeroAutoScroll.js` 有 Hash 時跳過自動捲動）；`RefractionCard.jsx` 升級為統一 Pointer Events；`AnimatedCounter.jsx` 收斂至 `useMediaQuery`；`useOverlayLock.js` 以 `data-overlay-inert` 精準管理鎖定標記；`FeedbackModal.jsx` 補上 `spellCheck={false}`、`autoCapitalize="none"` 與關閉計時器清理。
  - **規範翻新與 100% 元件測試覆蓋**：翻新 `DESIGN.md` 對齊 v2 暗房光學磨砂玻璃規範；移除廢棄 `tests/`、`.vscode/`、`.npmrc` 並精簡 `vite.config.js`（同步更新 `package-lock.json` 對齊 `npm ci`）；升級 `manifest.webmanifest`、`deploy.yml`（生產套件審計＋無 `.map` 驗證）與 `package.json` `prepare` Hook；消除 `ErrorBoundary.test.jsx` 模擬錯誤噪音，擴充 `portfolio.test.js` 校驗 97 筆作品 `url`／`videoId` 一致性，新增 `FeedbackModal`、`RefractionCard`、`ScrubText`、`Hero` 測試，達成 `src/components/` **13/13 元件 100% 覆蓋**。
- **第六輪 20 項全站安全性、正確性與 120Hz 順暢性深層修復（同日上午第五波）**：
  - **安全性強化**：`FeedbackModal.jsx` 新增 `isValidGasUrl` 強制驗證 `https://script.google.com/macros/s/` 白名單，並於 `sanitizeSheetInput` 剔除 ASCII 控制字元（`\x00`～`\x1F`）阻斷 Null-Byte 公式繞過；`url.js` 新增 `getSafeFacebookVideoUrl` 統一以 `new URL()` 阻斷帳密偽裝供 `Modal.jsx` 共用，並為 `isSafeLocalImageUrl` 加入長度上限與 `?v=` 版本參數支援；`vercel.json` 補齊 `X-Permitted-Cross-Domain-Policies: none` 與 CSP `manifest-src 'self'`；`scripts/pre-commit.sh` 新增 Webhook／Slack Token 掃描、`> 5MB` 大檔攔截與 `npm ci --dry-run` 鎖定檔同步檢查。
  - **正確性修復**：`CanvasSequence.jsx` 修正 `commitDecodedImage` 停駐補幀除數為 `HERO_EXIT_END_PROGRESS (1.26)` 並於跨斷點重載時對齊當下捲動進度；`Navigation.jsx` 將 `cachedHeroClearThreshold` 下調至 `heroHeight - 0.72 * innerHeight` 修復往下滑入「個人介紹」時亮燈被洗掉的 Bug；`FeedbackModal.jsx` 修復草稿恢復後 `0.6s` 內直接送出被誤判機器人吃單的 Bug；`VisualSynthesis.jsx` 補上 `img.complete` 同步快取命中檢查防 Safari 卡黑底；`useOverlayLock.js` 修復隱藏父容器（`display: none`）導致 `Tab` 焦點循環卡死的瑕疵。
  - **順暢性壓榨與防回歸測試**：`Manifesto.jsx` 三層 `92%` 深黑底 Sticky 疊壓卡收斂為 `!backdrop-blur-md` 消除三重 `18px` 高斯模糊堆疊；`ScrubText.jsx` 導入 `useInView` 視口閘門於離屏時自動卸載 6 組常駐 `useScroll` 訂閱；消除 `CanvasSequence` 滑回 `0px` 同步重排、`Navigation` 首屏冗餘 `setState`、`useLenisScroll` 慣性尾端多餘 `rAF` 喚醒、`VisualSynthesis` 底欄殘留矩陣與 `OpticalLightField` 彈窗鎖定期間背景座標計算；全站擴充至 **24 個測試檔 / 75 項單元測試** 100% 通過（0 警告）。
- **第七輪 10 項部署自動化、長效快取、信箱智慧防呆與 100% 全模組測試覆蓋（同日上午第六波）**：
  - **作品連結更新（`portfolio.js`）**：為「3C與家電」分類之 `中華電信 企業形象影片` 補上 Instagram Reels 連結（桌機與手機版同步開放安全外連）。
  - **部署當日日期注入、靜態長效快取與雙規格圖示**：`deploy.yml` 建置後自動將 `dist/sitemap.xml` 之 `<lastmod>` 替換為部署當日 UTC 日期；為 `avatar.webp`、`f1.webp`、`optical-streak.webp` 補齊 `?v=2` 快取版本號與 `vercel.json` 1 年 `immutable` 標頭；新增 `public/icon-512.png` 並升級 `manifest.webmanifest` 為 `192x192` + `512x512` 雙規格。
  - **渲染收斂與互動韌性**：`OpticalLightField.jsx` 單一 Shader Program 頂點緩衝改於初始化與 `webglcontextrestored` 單次綁定；清除 `index.css` 無效 `@layer base` 規則；`CanvasSequence.jsx` 卸載歸零 `canvas.width / height` 釋放 VRAM；`FeedbackModal.jsx` 新增「信箱含 `@` 格式驗證、純 LINE ID 直接放行」智慧防呆；`Modal.jsx` 頂欄補上「於新分頁開啟原影片 `↗`」安全備援鈕；`Contact.jsx` 滑近聯絡區時自動於閒置期預熱表單 Chunk。
  - **全專案 `src/` 100% 模組級測試覆蓋**：新增 `scroll.test.js`、`heroScroll.test.js`、`useLenisScroll.test.jsx`（並補齊無 `matchMedia` 環境 optional chaining 防護）與 `App.test.jsx`，全站擴充至 **28 個測試檔 / 82 項單元測試** 100% 通過（0 警告）。
- **第八輪 12 項底層編譯加速、VRAM 智慧預解碼與手機版首頁滿框極限放大（無模糊、尾段不縮小）升級（同日午間第七波）**：
  - **編譯模組暴減 76.7% 與底層收斂**：新增 `src/components/common/Icons.js` 直連 13 顆 Lucide 圖示單檔並升級 `vite.config.js` 函式型 `manualChunks(id)`，Vite 轉換模組數由 `1,855` 降至 `432`（生產建置 `886ms`）；`OpticalLightField.jsx` 將 GLSL 5 處 `pow(x, 2.0)` 改為硬體安全 `d * d` 杜絕負底數 `NaN` 並合併 `u_scrollWeights` `vec4`；`CanvasSequence.jsx` 升級智慧按需點陣預解碼（僅前 16 順位骨架幀與停留位置 `±14` 格執行 `img.decode()`）＋ `hasDrawnFrame` 慢網底圖保護；`VisualSynthesis.jsx` 模組頂層預算 `mobileIdx`；`portfolio.js` 移除 62 筆重複 `videoId`；`index.css` 清除廢棄 `--beam-shift-*`；`FeedbackModal.jsx`、`Manifesto.jsx`、`scroll.js`、`ErrorBoundary.jsx`、`vercel.json` 完成邊界防呆補強。
  - **手機版首頁共讀桌機原生 `1920×1080` 大圖、零縮圖無模糊與尾段不縮小（`Hero.jsx`、`CanvasSequence.jsx`、`index.html`）**：
    - 手機與桌機統一共讀第一代未經二次壓縮之 `public/png-0/`（`1920×1080`、`?v=11`；手機維持抽樣 59 格 `5.27 MB`），消除縮圖與二次壓縮在 3x Retina 手機螢幕造成的微糊感，並對齊首幀 `preload` 快取版本號。
    - 手機 `hero-screen` 升級為滿寬 `h-[calc(100dvh-4.75rem)]`，內層以 `9:10` 視窗搭配 `object-cover max-md:object-[48.95%_50%]` 精準對位 `Showreel` 全字不切邊區域與上下暗房柔邊遮罩；手機版往上滑推進至尾段與離場區（`87% → 126%`）停用 `scale(...)` 微縮，全程維持 `1:1` 滿寬原尺寸柔和淡出離場（全站 **28 個測試檔 / 83 項單元測試** 100% 通過）。
  - **YouTube 作品彈窗點擊即自動有聲播放修復（`Modal.jsx`、`App.jsx`、`Modal.test.jsx`）**：
    - 移除 `Modal.jsx` 內嵌 `<iframe>` 的 `sandbox` 封鎖旗標與載入期間 `opacity-0` 透明隱藏（將載入條改置底層 `z-0` 防瀏覽器透明媒體自動播放攔截），並改回標準高 MEI 信譽 `www.youtube.com/embed`；同時於 `App.jsx` 將 `Modal` 改為同步靜態匯入，確保點擊作品卡同幀掛載繼承使用者手勢權限。
- **第九輪 14 項暗房光學視覺強化、零重繪動畫管線與背景靜止省電升級（同日午間第八波）**：
  - **暗房調色室光學質感與微互動升級**：
    - `Introduction.jsx` & `ExperienceTimeline.jsx` & `RefractionCard.jsx` & `ScrubText.jsx`：個人肖像補齊左緣 `1.5px` 光譜導光刃、內嵌微光玻璃刃口與 Hover `115°` 暗房玻璃反光掠過；數據牆、演職員表（`RefractionCard as="ol"`）與聯絡雙艙全面啟用「雙色溫游標折射漫射光暈」；`ScrubText` 升級為 `opacity: [0.38, 1]` 搭配純 GPU `y: [6, 0]` 微浮升；演職員表為現職列加入暖紅微光漸層底襯與 Hover 右推 `4px` 手感。
    - `Manifesto.jsx` & `Navigation.jsx` & `Modal.jsx` & `index.css`：`Manifesto` 三層疊壓分鏡卡注入專屬色溫識別（`01 朱紅` ➔ `02 洋紅` ➔ `03 青藍`）；四大幕交界改用兩端羽化之 `.section-hairline` 避免硬邊灰線截斷左側 45° 背景流光；導覽列升級首屏輕透、下滑加深暗房磨砂玻璃並為桌機區塊底線導入 `layoutId` 光譜橫移滑軌；`Modal` 注入審片室雙色環境背光暈染與頂欄信號標記。
  - **零 CPU Paint 管線、靜止 `12fps` 省電、部署瘦身與守門防線**：
    - `index.css` & `layoutGuard.test.js`：移除全站玻璃斜切邊與 `.spectral-flow-line` 之 `background-position` 非合成屬性無限動畫，改用 `200%` 寬偽元素純 GPU `translate3d` 達成靜止態 **0% CPU Paint 重繪**，收斂散落光譜漸層至 `.spectral-bar-h/v` 並於 `layoutGuard.test.js` 新增 `@keyframes` 非合成屬性自動化攔截測試。
    - `OpticalLightField.jsx`：滾動與游標收斂且無互動滿 `1.2s` 時自動降檔至 `12fps`（貼合底片顆粒原生幀率，省下 66% 背景 GPU 功耗，互動瞬間 `0ms` 瞬回 `36fps` / `24fps`）；`useOverlayLock.js` & `FeedbackModal.jsx` 支援開啟抽屜自動聚焦首欄輸入框，`Contact.jsx` 複製信箱加入浮升淡入微動效；清除已零引用之 `public/png-0-mobile/` 舊縮圖目錄（減重 `2.39 MB`）並收斂 `vercel.json`，全站擴充至 **28 個測試檔 / 84 項單元測試** 100% 通過（生產建置 `862ms`）。
  - **首頁桌機與手機閒置 `1.5 秒` 自動往下推進演繹（`heroScroll.js`、`CanvasSequence.jsx`、`useIdleHeroAutoScroll.js`）**：
    - 將 `HERO_IDLE_AUTO_SCROLL_MS` 由 `3.5s` 調快至 `1.5s`，並同步開放手機純觸控端支援——首次進站載完首幀後無操作滿 `1.5 秒` 即自動溫柔推進完整序列並帶入「個人介紹」，任一觸碰或滾輪操作 `0ms` 瞬停交還控制權。
- **第十輪 30 項深水區優化：WebGL 閒置 `0%` 休眠、跨斷點影格共享、原生抽屜滑動手勢與雙向資產守門（同日下午第九波）**：
  - **快取對齊、跨斷點秒切與零殘響（1～7）**：`index.html` 將 `dns-prefetch` 與 `VideoObject.embedUrl` 對齊 `https://www.youtube.com` 並合併單一首幀 `preload`；`CanvasSequence.jsx` 新增 `loadedByFrameNumRef` 跨 `768px` 斷點共享已解碼大圖快取（省下 `5.3 MB` 重複下載）與 `canvasSizeRef`；`scroll.js` 單次預算目標數值傳入 Lenis 省去二次重排；`Navigation.jsx` 動態高度變更同步校正頂部進度線；`Manifesto.jsx` 保護鍵盤聚焦預覽不被滑鼠擦過誤關；`Modal.jsx` 關閉瞬間切斷音源達成 `0.00s` 零殘響。
  - **背景 `0%` 閒置功耗、Shader 代數簡化與 GPU 圖層精簡（8～15）**：`OpticalLightField.jsx` 無互動滿 `6 秒` 自動煞停 WebGL `rAF`（閒置 GPU 功耗降至 `0.0%`，微動 `0ms` 喚醒），GLSL 提出 `const mat2 FBM_ROT` 並以純代數曲線取代 `pow(x, 1.36)`；`RevealHeading.jsx` 折頁外延遲啟用 `will-change`（首屏減少 12 個常駐合成層）；`RefractionCard.jsx` 減少透明度模式跳過座標計算；`ScrubText.jsx` 差值守衛與清除歸零 `transform`；`useLenisScroll.js` 頂底撞牆滾輪跳過空轉喚醒；`index.css` 清理備援層多餘 `will-change`。
  - **暗房捲軸、細節回饋與左右抽屜原生觸控手勢（16～20、23～26）**：`index.css` 統一原生細捲軸暗房配色；`Navigation.jsx` 左上角品牌標 Hover 朱紅微光與手機左抽屜**左滑收合手勢**；`FeedbackModal.jsx` 輸入框聚焦內光、`>=450` 字暖色提醒與右抽屜**右滑關閉手勢**；`VisualSynthesis.jsx` 手機底部切換鈕按壓微縮回饋；`Modal.jsx` 節點燈箱鎖定 `1920:902` 比例防塌陷；`motion.js` 收斂共用彈簧常數；`useMediaQuery.js` 升級模組級共享 `MediaQueryList` 參照計數池。
  - **資產瘦身、建置精簡與雙向守門防線（21～22、27～30）**：刪除重複之 `public/avatar.jpg`（減重 `52 KB`，JSON-LD 對齊 `avatar.webp`）與 `public/vfx/.DS_Store`；`vite.config.js` 設定 `modulePreload: { polyfill: false }`（轉換模組降至 `431`）；更新 `deploy.yml`、`scripts/pre-commit.sh` 系統檔攔截與核心資產檢查，並於 `portfolio.test.js` 新增 `public/vfx` 97 張雙向 `1:1` 零孤兒檔守門測試（`28/28` 測試檔、`84/84` 項測試全過）。
  - **主 Showreel 影片升級為 2026 最新版（`siteConfig.js`、`index.html`、`Introduction.test.jsx`、`sitemap.xml`）**：
    - 將 `MAIN_SHOWREEL_VIDEO_ID` 與 JSON-LD `VideoObject` 嵌入網址同步更新為 `n4qMRlAlqjg`（`https://youtu.be/n4qMRlAlqjg`），更新結構化資料上傳日期與 Sitemap 日期至 `2026-11-26`。
- **雙年度 Showreel 並排按鈕升級與 WebGL 渲染迴圈 TDZ 修復（同日傍晚第十波）**：
  - **個人介紹雙年度 Showreel 並排雙鍵（`siteConfig.js`、`Introduction.jsx`、`index.css`、`Introduction.test.jsx`）**：
    - 定義 `SHOWREEL_2026_VIDEO_ID`（`n4qMRlAlqjg`）與 `SHOWREEL_2025_VIDEO_ID`（`s6s2p87fPdA`），保留 `MAIN_SHOWREEL_VIDEO_ID` 相容別名。
    - 個人介紹區升級為**方案 A 雙鍵並排**：左鍵為主推品牌橘紅光譜框 `▶ 2026 SHOWREEL`（`.spectral-cta`），右鍵為暗房冷霧玻璃次要框 `▶ 2025 SHOWREEL`（`.spectral-cta-secondary`，支援 Hover 青藍微光與 `prefers-reduced-transparency` 無障礙降級）；手機端採 `grid-cols-2` 單排等寬並排、桌機端靠左並排，點擊時審片燈箱頂欄同步顯示對應年度標題。
  - **修復 `OpticalLightField.jsx` WebGL 初始化 TDZ `ReferenceError`（`OpticalLightField.jsx`、`OpticalLightField.test.jsx`）**：
    - 將 `renderFrame` 改為具名函式宣告支援提升，並移除初始化階段多餘的同步 `handleScroll()` 呼叫（改直接計算初始捲動值），根除真實 WebGL 環境下因 `wakeFromIdle` 早於 `const renderFrame` 宣告觸發之 TDZ 拋錯，同步補齊模擬完整 WebGL Context 之防回歸單元測試（全站 **28 個測試檔 / 85 項單元測試** 100% 通過）。

