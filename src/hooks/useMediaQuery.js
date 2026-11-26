import { useState, useEffect } from 'react';

const sharedMediaPool = new Map();

function subscribeMediaQuery(query, listener) {
  let entry = sharedMediaPool.get(query);
  if (!entry) {
    const mql = window.matchMedia(query);
    if (!mql) return () => {};
    const listeners = new Set();
    const onChange = (e) => {
      const next = Boolean(e.matches);
      entry.matches = next;
      listeners.forEach((cb) => cb(next));
    };
    entry = { mql, listeners, matches: Boolean(mql.matches), onChange };
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
    } else {
      mql.addListener?.(onChange);
    }
    sharedMediaPool.set(query, entry);
  }

  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
    if (entry.listeners.size === 0) {
      if (typeof entry.mql.removeEventListener === 'function') {
        entry.mql.removeEventListener('change', entry.onChange);
      } else {
        entry.mql.removeListener?.(entry.onChange);
      }
      sharedMediaPool.delete(query);
    }
  };
}

/**
 * 輕量響應式 MediaQuery 即時監聽 Hook（模組級共享 MediaQueryList 訂閱池，消除跨元件重複建立監聽實例）
 */
export function useMediaQuery(query, defaultValue = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return defaultValue;
    }
    const cached = sharedMediaPool.get(query);
    return cached ? cached.matches : Boolean(window.matchMedia(query)?.matches);
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const unsubscribe = subscribeMediaQuery(query, setMatches);
    const current = sharedMediaPool.get(query);
    if (current) setMatches(current.matches);
    return unsubscribe;
  }, [query]);

  return matches;
}
