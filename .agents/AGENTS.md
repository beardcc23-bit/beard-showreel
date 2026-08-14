## 1. 收工專案快取清理 (Lean Project Cleanup)
- 當使用者發出「收工」指令時，除了執行資安掃描、單元測試、Git 提交外，自動執行專案極速快取清理（執行 `npm run clean` 清理 `.vite` 快取、`dist/` 產物、`.DS_Store` 等 AntiGravity 開發殘留檔）。
- 不主動執行全系統層級的慢速掃描，保持收工流程在 1 秒內極速完成。

## 2. 專案開發與執行規範
- Python 專案一律使用 `uv` 管理。
- 前端與 Node 專案一律使用 `npm` 管理。
- 專案測試與驗證：
  - 測試與檢驗一律優先執行 `npm run test:run` 或對應指令。

## 3. Git 與資安規範
- 禁用自動修改 `.env` 或儲存敏感資訊。
- 生成 Commit Message 時，採用 Conventional Commits 格式＋繁體中文台灣用語（例如：`feat: 新增使用者認證模組`）。

## 4. 自動觸發 Insights 洞察分析模式
- 當使用者提到「有更好建議嗎」、「有什麼優化建議」、「/insights」或詢問「怎麼寫更好」時：
  - 自動啟動 **Insights 洞察分析** 流程。
  - 必須從【效能瓶頸】、【可維護性】與【最佳實踐】三個維度主動剖析。
  - 不給空泛的高階建議，必須直接提供重構前後的具體程式碼對比 (Diff / Refactored Code)。
