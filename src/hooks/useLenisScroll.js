import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * 自訂 Hook: 初始化電影級平滑滾動 Lenis
 */
export function useLenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 經典指數緩動
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    // 監聽滾動速度並動態寫入 CSS 變數，帶動背景幾何重力波紋震盪
    const handleScroll = (e) => {
      const velocity = Math.abs(e.velocity || 0);
      // 限制波紋最大增幅 (最大 12% 震盪)
      const scaleBoost = Math.min(velocity * 0.0035, 0.12);
      const glowBoost = Math.min(velocity * 0.05, 0.8);

      document.documentElement.style.setProperty('--scroll-scale', (1 + scaleBoost).toFixed(4));
      document.documentElement.style.setProperty('--scroll-glow', glowBoost.toFixed(3));
    };

    lenis.on('scroll', handleScroll);

    let rafId = null;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.off('scroll', handleScroll);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);
}
