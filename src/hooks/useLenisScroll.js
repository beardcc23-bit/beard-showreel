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

    // 滾輪改用 lerp 阻尼追隨：Lenis 若設定 duration + easing 會優先走時間曲線，
    // 且每個 wheel 事件都呼叫 fromTo() 把 currentTime 歸零，導致速度鋸齒（卡頓感）。
    // 錨點跳轉的電影感曲線改由 Navigation 的 scrollTo 個別帶入。
    // 滾輪改用 lerp 阻尼追隨，並調校為 0.18（單次滾動在 180ms 內迅速煞停，兼具絲滑感與精準跟手性）
    const lenis = new Lenis({
      lerp: 0.18,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });
    window.lenis = lenis;

    // 滾動進行中掛載 is-scrolling 類別，關閉所有指針互動，消除滾動時掠過卡片的重排與掉幀
    let scrollEndTimer = null;
    const handleScroll = () => {
      if (!document.body.classList.contains('is-scrolling')) {
        document.body.classList.add('is-scrolling');
      }
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 100);
    };

    lenis.on('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });

    let rafId = null;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(scrollEndTimer);
      document.body.classList.remove('is-scrolling');
      lenis.off('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);
}
