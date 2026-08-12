import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 自訂 Hook: 安全複製文字至剪貼簿並管理 HUD Toast 狀態
 */
export function useClipboard(timeout = 2500) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copy = useCallback((text) => {
    if (!text) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, timeout);
      }).catch(() => {
        setCopied(false);
      });
    }
  }, [timeout]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { copied, copy };
}
