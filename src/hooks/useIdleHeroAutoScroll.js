import { useEffect, useRef } from 'react';
import {
  NAV_SCROLL_OFFSET,
  HERO_IDLE_AUTO_SCROLL_MS,
  HERO_AUTO_SCROLL_DURATION_MS,
} from '../constants/heroScroll';
import { SCROLL_TRIGGER_KEYS, isEditableElement } from '../utils/scroll';

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

const isOverlayActive = (isModalOpenRef) =>
  Boolean(isModalOpenRef?.current) || document.body.classList.contains('modal-open');

/**
 * 首次進站 Hero 閒置自動演繹 Hook（方案 2）：
 * - 首幀載入完成且停在頁面最頂端時，若無操作滿 3.5 秒，自動溫柔推進全序列並順勢帶進「個人介紹」
 * - 全程僅觸發一次；任一滾輪、觸控、點擊、按鍵或開啟行動抽屜／彈窗皆 0ms 瞬停交還控制權
 */
export function useIdleHeroAutoScroll({ enabled, containerRef, isModalOpenRef }) {
  const hasSettledRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasSettledRef.current) return undefined;

    // 重新整理時已在頁面中下方，或當下已開啟彈窗／行動選單，直接視為已互動不再自動捲動
    if (window.scrollY > 8 || isOverlayActive(isModalOpenRef)) {
      hasSettledRef.current = true;
      return undefined;
    }

    let idleTimerId = null;
    let autoRafId = null;
    let isAutoScrolling = false;
    let usedLenis = false;

    const cleanupListeners = () => {
      window.removeEventListener('wheel', onWheelInterrupt);
      window.removeEventListener('touchstart', onImmediateInterrupt, true);
      window.removeEventListener('pointerdown', onImmediateInterrupt, true);
      window.removeEventListener('keydown', onKeyInterrupt);
      window.removeEventListener('scroll', onEarlyManualScroll);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };

    const stopAutoScroll = (brakeLenis) => {
      if (idleTimerId !== null) {
        clearTimeout(idleTimerId);
        idleTimerId = null;
      }
      if (autoRafId !== null) {
        cancelAnimationFrame(autoRafId);
        autoRafId = null;
      }
      if (isAutoScrolling && usedLenis && brakeLenis && window.lenis) {
        // 觸控／點擊／按鍵中斷時立刻煞停 Lenis 殘餘曲線；滾輪中斷交由 Lenis 原生無縫接管動量
        window.lenis.scrollTo(window.scrollY, { immediate: true });
      }
      isAutoScrolling = false;
      usedLenis = false;
      hasSettledRef.current = true;
      cleanupListeners();
    };

    const onWheelInterrupt = () => stopAutoScroll(false);
    const onImmediateInterrupt = () => stopAutoScroll(true);
    const onKeyInterrupt = (e) => {
      if (!isEditableElement(e.target) && SCROLL_TRIGGER_KEYS.has(e.key)) {
        stopAutoScroll(true);
      }
    };
    const onEarlyManualScroll = () => {
      if (!isAutoScrolling && window.scrollY > 8) {
        stopAutoScroll(false);
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        stopAutoScroll(true);
      }
    };

    const computeIntroTargetY = () => {
      const introEl = document.getElementById('introduction');
      if (introEl) {
        return Math.max(
          0,
          Math.round(introEl.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET)
        );
      }
      const container = containerRef?.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        return Math.max(0, Math.round(rect.top + window.scrollY + rect.height));
      }
      return 0;
    };

    const startGentleAutoScroll = () => {
      idleTimerId = null;
      if (
        hasSettledRef.current ||
        document.hidden ||
        isOverlayActive(isModalOpenRef) ||
        window.scrollY > 8
      ) {
        stopAutoScroll(false);
        return;
      }

      const targetY = computeIntroTargetY();
      if (targetY <= window.scrollY + 16) {
        stopAutoScroll(false);
        return;
      }

      isAutoScrolling = true;
      hasSettledRef.current = true;

      if (window.lenis) {
        usedLenis = true;
        window.lenis.start();
        window.lenis.scrollTo(targetY, {
          duration: HERO_AUTO_SCROLL_DURATION_MS / 1000,
          easing: easeInOutSine,
          lock: false,
          onComplete: () => {
            isAutoScrolling = false;
            usedLenis = false;
            cleanupListeners();
          },
        });
        return;
      }

      // 純觸控手機／無 Lenis 環境：使用原生 rAF 搭配 easeInOutSine 電影感平順推進
      const startY = window.scrollY;
      const distance = targetY - startY;
      let startTime = null;

      const step = (timestamp) => {
        if (!isAutoScrolling) return;
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = clamp01(elapsed / HERO_AUTO_SCROLL_DURATION_MS);
        window.scrollTo(0, Math.round(startY + distance * easeInOutSine(progress)));

        if (progress < 1) {
          autoRafId = requestAnimationFrame(step);
        } else {
          autoRafId = null;
          isAutoScrolling = false;
          cleanupListeners();
        }
      };

      autoRafId = requestAnimationFrame(step);
    };

    window.addEventListener('wheel', onWheelInterrupt, { passive: true });
    // 使用 capture 捕獲階段先煞停自動捲動，防止點擊 3D 滑桿時冒泡把新座標覆蓋回原點
    window.addEventListener('touchstart', onImmediateInterrupt, { passive: true, capture: true });
    window.addEventListener('pointerdown', onImmediateInterrupt, { passive: true, capture: true });
    window.addEventListener('keydown', onKeyInterrupt);
    window.addEventListener('scroll', onEarlyManualScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    idleTimerId = setTimeout(startGentleAutoScroll, HERO_IDLE_AUTO_SCROLL_MS);

    return () => {
      if (idleTimerId !== null) clearTimeout(idleTimerId);
      if (autoRafId !== null) cancelAnimationFrame(autoRafId);
      cleanupListeners();
    };
  }, [enabled, containerRef, isModalOpenRef]);
}
