import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * 自訂 Hook: 初始化電影級平滑滾動 Lenis
 */
export function useLenisScroll() {
  useEffect(() => {
    // 檢測是否為純觸控手機/平板（無精確指針滑鼠）
    const isPureTouch = ('ontouchstart' in window) && !window.matchMedia('(pointer: fine)').matches;
    if (isPureTouch) return; // 純行動裝置交由原生 120Hz 慣性滾動，杜絕任何卡頓

    // 使用者偏好減少動態：不啟用慣性平滑滾動，交回原生捲動
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    window.lenis = lenis;

    let rafId = null;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);
}
