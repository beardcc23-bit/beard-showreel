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
  - HUD 按鈕移除 `transition: all` 與字距動畫
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

### 下一步（P0 待修）
1. **Tailwind 透明度修飾詞失效**：`var()` 顏色無法套 `/40` 等，共 22 處未產生 CSS（導覽列、手機抽屜目前無背景）。改為 `rgb(var(--rgb-x) / <alpha-value>)`
2. **Framer Motion 與 `transition-all` 衝突**：`Modal.jsx:75`、`Navigation.jsx:112,126`
3. **`content-visibility` 造成錨點跳轉不準**：`index.css` `#vfx, #about, #contact`
4. **Modal 開啟時 Lenis 仍可捲動背景**：開啟時 `window.lenis?.stop()`

### 待辦（P2 / P3）
- 首屏缺 `<h1>` 與自我介紹；作品縮圖桌機預設模糊變暗
- 色票收斂（殘留青色 `rgba(0,255,255)`、藍粉游標光暈、紫綠光暈）
- FB 影片手機版 `window.location.href` 會離站
- 可點擊 `<div>` 改 `<button>`；FeedbackModal label / autocomplete；`no-cors` 永遠回報成功
