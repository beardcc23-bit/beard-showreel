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

    const handleSuccess = () => {
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, timeout);
    };

    const fallbackCopy = (str) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = str;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        handleSuccess();
      } catch (err) {
        setCopied(false);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        handleSuccess();
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
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
