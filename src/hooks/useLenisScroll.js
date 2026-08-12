import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * 自訂 Hook: 初始化電影級平滑滾動 Lenis
 */
export function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2, // 還原經典 1.2 秒電影級電影長阻尼絲滑滑行
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.0,
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
