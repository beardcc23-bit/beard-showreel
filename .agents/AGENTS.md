# 專案 Agent 規則

- **自動測試與 Git 提交推送**：在此專案中，當修改程式碼或文案完成後，請主動執行 `npm run build` 進行編譯與驗證。若編譯成功，不需詢問使用者，請自動執行 `git add`、`git commit`（提交訊息請使用繁體中文台灣用語，並符合 Conventional Commits 規範）及 `git push` 將變更推送至遠端。

- **動畫與前端效能規範 (Performance Best Practices)**：
  1. **事件驅動 rAF 迴圈**：嚴禁寫入無條件空轉的 `requestAnimationFrame` 迴圈（如滑鼠跟隨、視差動畫）。必須採用「事件觸發繪製」或「插值收斂後自動停止（Stop Ticking）」。
  2. **視區監控 (IntersectionObserver)**：所有 Canvas 影格序列、重度粒子或動畫元件，必須使用 `IntersectionObserver` 監控。當元件滾動離開螢幕可視區域時，必須自動暫停繪製。
  3. **禁用全螢幕高耗能 CSS / SVG 濾鏡**：嚴禁使用全螢幕 `feTurbulence` / SVG filter 作為固定背景；對動態與漂浮元素使用 `backdrop-filter` 或 3D Transform 時，必須加上 `will-change: transform` 隔離繪製圖層。
