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

      // 三層空間視差位移係數 (針對 Fixed 背景與手機視區對齊優化)
      const yFar = scrollY * 0.18;   // Z-Far (背景網格 - 慢速錯開 0.18x)
      const yMid = scrollY * 0.12;   // Z-Mid (中景軌道 - 緩和滯留 0.12x)
      const yNear = scrollY * 0.38;  // Z-Near (前景晶體 - 快速掠過 0.38x)

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
