# Beard Showreel 設計規範 (Design Guidelines)

本專案採用 **Cyberpunk 科幻高質感（HUD風格）** 結合 **極簡暗黑美學** 設計。主要視覺由金屬光澤、霓虹光暈與細緻的等寬字體（Monospace）構成。

---

## 1. 字體系統 (Typography)

專案載入了三套 Google Fonts 進行中英文搭配：
*   **Space Mono**：具備硬朗、高科技感的等寬字體，用於主標題與 HUD 標籤。
*   **Source Code Pro**：較為柔和的代碼字體，用於閱讀性要求較高的內文、描述。
*   **Noto Sans TC**：繁體中文字體，用於全局的中文顯示。

### 字體角色分工
*   **大標題、小標題、HUD 英數**：`'Space Mono', 'Noto Sans TC', monospace, sans-serif`
*   **一般段落、引言、描述**：`'Source Code Pro', 'Noto Sans TC', monospace, sans-serif`

---

## 2. 網頁版 vs 手機版 字級對照表 (Font Sizes)

為確保手機版與網頁版的字級在各區塊間視覺一致，以下為字級規範：

| 元素角色 | 手機版級距 (Mobile) | 電腦版級距 (Desktop / `md:`) | 備註 |
| :--- | :--- | :--- | :--- |
| **區塊大標題 (Section Hero)** | `text-6xl` (60px) | `md:text-9xl` (128px) | Introduction 區塊電腦版為 `md:text-7xl` (72px) |
| **子標題 / 數據大字** | `text-3xl` (32px) | `md:text-4xl` (40px) | 用於數據面板數字 |
| **區塊描述 / 段落引言** | `text-sm` (14px) | `md:text-lg` (18px) | 套用 `font-light leading-relaxed` |
| **一般段落文字 (Body)** | `text-sm` (14px) | `md:text-lg` (18px) | - |
| **選單導覽項目** | `text-xl` (20px) | `text-xs` (12px) | 手機版為側邊抽屜，故放大方便點擊 |
| **HUD 標籤 / 資訊微字** | `text-[9px]` ~ `text-xs` | `text-xs` (12px) | 用於 Meta data、SYNC 指示、小標籤 |

---

## 3. 色彩系統 (Color Palette)

色彩採用暗水泥灰為底，搭配金色與霓虹點綴，凸顯後期合成師的專業與科技感。

### 基礎背景色 (Neutral Backgrounds)
*   **核心暗水泥黑 (`--color-bg-core`)**：`#121314`（主背景色）
*   **水泥中點灰 (`--color-bg-mist`)**：`#232528`（卡片與區塊襯底）
*   **炭灰 (`--color-bg-shadow`)**：`#18191b`（深色陰影與漸層）

### 主題與點綴色 (Accent Colors)
*   **亮金色 (`--color-aurora-blue`)**：`#D4AF37`（核心主色，用於高亮與金色流光邊框）
*   **亮金點綴 (`--color-dawn-gold`)**：`#ffe082`（微光提示）
*   **霓虹粉 (`--color-soft-magenta`)**：`#ff007f`（用於特定警告、標籤）
*   **霓虹綠 (`--color-prism-green`)**：`#00FF7F`（用於成功、連線狀態標籤）

### 文字色彩 (Text Colors)
*   **標題與主字 (`--color-title-white`)**：`#F2F6F9`（亮灰白，避免純白過度刺眼）
*   **描述與副字 (`--color-info-gold-gray`)**：`#D1C7BD`（暖灰）
*   **低強度字**：`text-zinc-400` / `text-zinc-500`

---

## 4. 佈局與元件規範 (Layout & Components)

### 容器寬度限制
*   標準展示區塊最大寬度統一為：`max-w-6xl` (`1152px`)，並帶有左右內距 `px-8`。

### 互動按鈕樣式
1.  **高科技 HUD 按鈕 (`.hud-btn`)**：
    *   單線框、直角、帶有微小斜角或 HUD 裝飾。
    *   啟用狀態背景為 `--color-aurora-blue`，字體為黑色。
2.  **稜鏡炫光按鈕 (`.prism-button`)**：
    *   邊框帶有光學反射漸層，滑鼠懸停時會觸發流光動畫。

### 特效與動畫
*   **滑鼠光暈 (CursorGlow)**：桌機版（`md:` 以上）專屬，帶有跟隨滑鼠的液態玻璃微光，手機版自動隱藏以確保效能。
*   **滾動觸發 (Scroll Trigger)**：利用 Framer Motion 實現淡入與往上微移（`initial={{ opacity: 0, y: 30 }}`），在手機版適當縮小移動距離以避免卡頓。
