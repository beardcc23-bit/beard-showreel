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
    // 3D Z-Space 三層視差透視 (Z-Space Parallax) 計算
    const handleScroll = (e) => {
      const scrollY = window.scrollY || e.scroll || 0;

      // 三層空間視差位移係數
      const yFar = scrollY * 0.08;   // Z-Far (背景層 - 極慢)
      const yMid = scrollY * 0.20;   // Z-Mid (中景軌道層 - 中速)
      const yNear = scrollY * 0.42;  // Z-Near (前景晶體層 - 快速位移)

      document.documentElement.style.setProperty('--parallax-y-far', `${yFar.toFixed(2)}px`);
      document.documentElement.style.setProperty('--parallax-y-mid', `${yMid.toFixed(2)}px`);
      document.documentElement.style.setProperty('--parallax-y-near', `${yNear.toFixed(2)}px`);
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
