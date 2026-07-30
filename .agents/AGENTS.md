# 專案 Agent 規則與創作者資訊

- **創作者基本資訊**：
  * 偏好稱呼：Beard
  * 中文姓名：周威全
  * 英文名稱：Beard Chou
  * 所在地區：台灣台北 (Taipei, Taiwan)
  * 專業領域：Autodesk Flame 特效合成師 / 視覺總監 (VFX Compositor & Visual Artist)

- **自動測試與 Git 提交推送**：在此專案中，當修改程式碼或文案完成後，請主動執行 `npm run build` 進行編譯與驗證。若編譯成功，不需詢問使用者，請自動執行 `git add`、`git commit`（提交訊息請使用繁體中文台灣用語，並符合 Conventional Commits 規範）及 `git push` 將變更推送至遠端。

- **「提出給我」指令行為規範**：當使用者指令中包含「提出給我」時，僅需詳細說明分析與建議，**絕對不要自動修改程式碼或執行修改命令**。必須等到使用者明確指示「執行」後，方可開始進行程式碼變更與編譯提交。

- **新功能與頁面開發分支規範**：當使用者提出要新增頁面、重構大模組或開發全新功能時，在開始撰寫程式碼前，**必須主動提醒使用者開啟新 Feature Branch**（例如：`git checkout -b feature/xxx`），確保 `main` 分支維持穩定。

- **動畫與前端效能規範 (Performance Best Practices)**：
  1. **事件驅動 rAF 迴圈**：嚴禁寫入無條件空轉的 `requestAnimationFrame` 迴圈（如滑鼠跟隨、視差動畫）。必須採用「事件觸發繪製」或「插值收斂後自動停止（Stop Ticking）」。
  2. **視區監控 (IntersectionObserver)**：所有 Canvas 影格序列、重度粒子或動畫元件，必須使用 `IntersectionObserver` 監控。當元件滾動離開螢幕可視區域時，必須自動暫停繪製。
  3. **禁用全螢幕高耗能 CSS / SVG 濾鏡**：嚴禁使用全螢幕 `feTurbulence` / SVG filter 作為固定背景；對動態與漂浮元素使用 `backdrop-filter` 或 3D Transform 時，必須加上 `will-change: transform` 隔離繪製圖層。

- **關鍵視覺與元件防護規範 (Protected Visual & Scope Isolation Rules)**：
  1. **作品卡片比例鎖定**：`VisualSynthesis.jsx` 中的品牌作品卡片（BrandCard）必須永久鎖定維持 `aspect-square`（1:1 正方形）與 `line-clamp-2` 標題防爆，任何背景、導覽列或特效變更皆禁止觸及該 CSS/HTML 結構。
  2. **獨立背景解耦**：手機版極光漸層背景必須封裝於獨立組件 `<MobileAuroraBackground />` 中，嚴禁將特效與作品排版組件直接耦合。
  3. **預防修改 A 損壞 B**：改動任何組件前，必須先審查受影響的 DOM 樹結構與 Scope 邊界，確保只對目標 Element 進行精準調校。
