import { useEffect } from 'react';
import Lenis from 'lenis';
import { SCROLL_TRIGGER_KEYS, isEditableElement } from '../utils/scroll';

/**
 * 自訂 Hook: 初始化電影級平滑滾動 Lenis
 * - 靜止收斂與開啟彈窗（modal-open）時自動進入 0 rAF 休眠，有滾動／錨點跳轉互動時 0ms 喚醒
 */
export function useLenisScroll() {
  useEffect(() => {
    const isPureTouch =
      'ontouchstart' in window && !window.matchMedia?.('(pointer: fine)')?.matches;
    if (isPureTouch) return undefined;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;

    const lenis = new Lenis({
      lerp: 0.18,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    const SCROLL_IDLE_MS = 120;
    let isBodyScrolling = false;
    let lastScrollTime = 0;
    let scrollEndTimer = null;
    let rafId = null;
    let idleFrames = 0;

    const checkScrollEnd = () => {
      const elapsed = performance.now() - lastScrollTime;
      if (elapsed >= SCROLL_IDLE_MS) {
        isBodyScrolling = false;
        scrollEndTimer = null;
        document.body.classList.remove('is-scrolling');
      } else {
        scrollEndTimer = setTimeout(checkScrollEnd, SCROLL_IDLE_MS - elapsed);
      }
    };

    function raf(time) {
      if (document.hidden || document.body.classList.contains('modal-open')) {
        rafId = null;
        return;
      }

      lenis.raf(time);

      const remaining = Math.abs((lenis.targetScroll ?? 0) - (lenis.animatedScroll ?? 0));
      if (lenis.isScrolling || remaining > 0.1) {
        idleFrames = 0;
        rafId = requestAnimationFrame(raf);
      } else if (idleFrames < 2) {
        idleFrames += 1;
        rafId = requestAnimationFrame(raf);
      } else {
        rafId = null;
      }
    }

    const startRaf = () => {
      idleFrames = 0;
      if (
        rafId === null &&
        !document.hidden &&
        !document.body.classList.contains('modal-open')
      ) {
        // 重置內部時間基準，防止從休眠／背景分頁喚醒首幀 deltaTime 暴衝導致滾動瞬移跳格
        lenis.time = 0;
        rafId = requestAnimationFrame(raf);
      }
    };

    const stopRaf = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    // 包裝 scrollTo 確保外部錨點跳轉／滑桿刷幀呼叫時自動喚醒休眠中的 rAF
    const originalScrollTo = lenis.scrollTo.bind(lenis);
    lenis.scrollTo = (...args) => {
      startRaf();
      return originalScrollTo(...args);
    };
    window.lenis = lenis;

    const handleScroll = () => {
      lastScrollTime = performance.now();
      if (!isBodyScrolling) {
        isBodyScrolling = true;
        document.body.classList.add('is-scrolling');
        scrollEndTimer = setTimeout(checkScrollEnd, SCROLL_IDLE_MS);
      }
      if (rafId === null) {
        startRaf();
      }
    };

    const handleKeyWake = (e) => {
      if (isEditableElement(e.target)) return;
      if (SCROLL_TRIGGER_KEYS.has(e.key)) {
        startRaf();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRaf();
      } else if (lenis.isScrolling) {
        startRaf();
      }
    };

    const bodyObserver = new MutationObserver(() => {
      if (document.body.classList.contains('modal-open')) {
        stopRaf();
      } else if (lenis.isScrolling) {
        startRaf();
      }
    });
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('wheel', startRaf, { passive: true });
    window.addEventListener('touchstart', startRaf, { passive: true });
    window.addEventListener('keydown', handleKeyWake);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startRaf();

    return () => {
      stopRaf();
      bodyObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(scrollEndTimer);
      document.body.classList.remove('is-scrolling');
      window.removeEventListener('wheel', startRaf);
      window.removeEventListener('touchstart', startRaf);
      window.removeEventListener('keydown', handleKeyWake);
      window.removeEventListener('scroll', handleScroll);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);
}
