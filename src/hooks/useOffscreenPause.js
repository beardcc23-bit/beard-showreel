import { useEffect } from 'react';

let sharedObserver = null;
let observedCount = 0;

function getSharedObserver() {
  if (sharedObserver || typeof IntersectionObserver === 'undefined') {
    return sharedObserver;
  }
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        entry.target.classList.toggle('section-offscreen', !entry.isIntersecting);
      }
    },
    { rootMargin: '120px 0px' }
  );
  return sharedObserver;
}

/**
 * 離屏動畫休眠 Hook：以單一共享 IntersectionObserver 直接切換 DOM 類別，
 * 避免滾動跨越區塊邊界時觸發整棵組件樹 React Re-render 造成主執行緒掉幀。
 */
export function useOffscreenPause(sectionRef) {
  useEffect(() => {
    const el = sectionRef?.current;
    const observer = getSharedObserver();
    if (!el || !observer) return undefined;

    observedCount += 1;
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      el.classList.remove('section-offscreen');
      observedCount = Math.max(0, observedCount - 1);
      if (observedCount === 0 && sharedObserver) {
        sharedObserver.disconnect();
        sharedObserver = null;
      }
    };
  }, [sectionRef]);
}
