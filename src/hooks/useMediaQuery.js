import { useState, useEffect } from 'react';

/**
 * 輕量響應式 MediaQuery 即時監聽 Hook（支援瀏覽期間動態切換視口或系統無障礙減少動態設定）
 */
export function useMediaQuery(query, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return defaultValue;
    }
    return Boolean(window.matchMedia(query)?.matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mql = window.matchMedia(query);
    if (!mql) return undefined;
    setMatches(Boolean(mql.matches));
    const onChange = (e) => setMatches(Boolean(e.matches));
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener?.(onChange);
    return () => mql.removeListener?.(onChange);
  }, [query]);

  return matches;
}
