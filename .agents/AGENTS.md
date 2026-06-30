# 專案 Agent 規則

- **自動測試與 Git 提交推送**：在此專案中，當修改程式碼或文案完成後，請主動執行 `npm run build` 進行編譯與驗證。若編譯成功，不需詢問使用者，請自動執行 `git add`、`git commit`（提交訊息請使用繁體中文台灣用語，並符合 Conventional Commits 規範）及 `git push` 將變更推送至遠端。
