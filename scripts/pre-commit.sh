#!/bin/sh
# Git Pre-commit Hook for beard-showreel（版控來源：scripts/pre-commit.sh）
set -e

echo "🔐 [Git Hook] 正在掃描 Staged 變更是否誤含敏感檔案或金鑰..."

# 1. 阻擋 .env 與私鑰檔案進入版控
FORBIDDEN_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '(^|/)\.env(\..+)?$|\.(pem|key|p12)$' | grep -v '\.env\.example$' || true)
if [ -n "$FORBIDDEN_FILES" ]; then
  echo "❌ [Git Hook] 偵測到禁止提交的敏感環境或憑證檔案："
  echo "$FORBIDDEN_FILES"
  exit 1
fi

# 2. 掃描新增行是否含有高風險 API Key / Private Key 特徵
SECRET_HITS=$(git diff --cached -U0 | grep -E '^\+[^+]' | grep -E '(AIza[0-9A-Za-z_-]{35}|ghp_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{50,}|sk-[0-9A-Za-z]{32,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)' || true)
if [ -n "$SECRET_HITS" ]; then
  echo "❌ [Git Hook] Staged 內容疑似包含私密金鑰或 Token，已自動攔截 Commit！"
  exit 1
fi

echo "🔍 [Git Hook] 正在執行 commit 前自動單元測試與排版守門檢查..."
npm run test:run

echo "✅ [Git Hook] 資安掃描與單元測試全數通過，繼續 Commit！"
exit 0
