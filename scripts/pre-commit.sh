#!/bin/sh
# Git Pre-commit Hook for beard-showreel（版控來源：scripts/pre-commit.sh）
set -e

echo "🔐 [Git Hook] 正在掃描 Staged 變更是否誤含敏感檔案、金鑰或異常大型母帶..."

# 1. 阻擋 .env、私鑰、系統隱藏檔與未壓縮原始剪輯母帶進入版控
FORBIDDEN_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '(^|/)\.env(\..+)?$|(?:^|/)(\.DS_Store|Thumbs\.db)$|\.(pem|key|p12|mov|psd|exr|dpx)$' | grep -v '\.env\.example$' || true)
if [ -n "$FORBIDDEN_FILES" ]; then
  echo "❌ [Git Hook] 偵測到禁止提交的敏感憑證或原始母帶檔案："
  echo "$FORBIDDEN_FILES"
  exit 1
fi

# 2. 阻擋單一檔案超過 5MB 誤入 Git 歷史
OVERSIZED_FILES=""
for FILE in $(git diff --cached --name-only --diff-filter=ACM); do
  if [ -f "$FILE" ]; then
    FILE_SIZE=$(wc -c < "$FILE" | tr -d ' ')
    if [ "$FILE_SIZE" -gt 5242880 ]; then
      OVERSIZED_FILES="$OVERSIZED_FILES\n  $FILE (${FILE_SIZE} bytes)"
    fi
  fi
done
if [ -n "$OVERSIZED_FILES" ]; then
  echo "❌ [Git Hook] 偵測到超過 5MB 之大型檔案，已攔截 Commit：$OVERSIZED_FILES"
  exit 1
fi

# 3. 掃描新增行是否含有高風險 API Key / Webhook / Private Key 特徵
SECRET_HITS=$(git diff --cached -U0 | grep -E '^\+[^+]' | grep -E '(AIza[0-9A-Za-z_-]{35}|ghp_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{50,}|sk-[0-9A-Za-z]{32,}|AKIA[0-9A-Z]{16}|xox[baprs]-[0-9A-Za-z-]{10,}|https://hooks\.slack\.com/services/|https://discord(app)?\.com/api/webhooks/|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)' || true)
if [ -n "$SECRET_HITS" ]; then
  echo "❌ [Git Hook] Staged 內容疑似包含私密金鑰、Token 或 Webhook，已自動攔截 Commit！"
  exit 1
fi

# 4. 當依賴設定變動時，強制驗證 package-lock.json 與 npm ci 一致性（杜絕 CI 第 8 秒失敗）
LOCK_TOUCHED=$(git diff --cached --name-only | grep -E '^(package\.json|package-lock\.json|\.npmrc)$' || true)
if [ -n "$LOCK_TOUCHED" ]; then
  echo "📦 [Git Hook] 偵測到套件設定變更，正在驗證 npm ci --dry-run 鎖定檔同步狀態..."
  npm ci --dry-run >/dev/null
fi

echo "🔍 [Git Hook] 正在執行 commit 前自動單元測試與排版守門檢查..."
npm run test:run

echo "✅ [Git Hook] 資安掃描、鎖定檔校驗與單元測試全數通過，繼續 Commit！"
exit 0
