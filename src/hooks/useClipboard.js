import { useState, useCallback } from 'react';

/**
 * 自訂 Hook: 安全複製文字至剪貼簿並管理 HUD Toast 狀態
 */
export function useClipboard(timeout = 2500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text) => {
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
      }).catch(() => {
        setCopied(false);
      });
    }
  }, [timeout]);

  return { copied, copy };
}
