import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * 自訂 Hook: 初始化電影級平滑滾動 Lenis
 */
export function useLenisScroll() {
  useEffect(() => {
    // 檢測觸控裝置，確保行動裝置維持系統原生 120Hz 慣性手勢
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: isTouch ? 0.6 : 0.9, // 縮短阻尼至 0.9s，大幅提升煞車精準度與指尖跟手性
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -8 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
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
