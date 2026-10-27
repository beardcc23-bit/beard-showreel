import { useEffect } from 'react';

/**
 * 自訂 Hook: 處理 3D 幾何軌道滑鼠插值 (Lerp) 視差與繪製控制
 */
export function useParallaxOrbit() {
  useEffect(() => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;
    // JS 每幀驅動的視差不受 CSS reduced-motion 規則影響，需在此自行略過
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const orbit = document.querySelector('.orbit-container');
    if (!orbit) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId = null;
    let isRunning = false;

    const updateParallax = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      
      currentX += dx * 0.08;
      currentY += dy * 0.08;

      orbit.style.setProperty('--orbit-tx', `${(currentX * 18).toFixed(2)}px`);
      orbit.style.setProperty('--orbit-ty', `${(currentY * 15).toFixed(2)}px`);
      orbit.style.setProperty('--orbit-rx', `${(-currentY * 12).toFixed(2)}deg`);
      orbit.style.setProperty('--orbit-ry', `${(currentX * 12).toFixed(2)}deg`);

      // 如果差距仍大於 0.0001 則繼續下一幀插值，否則停止動畫迴圈以節省資源 (Stop Ticking)
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        isRunning = false;
      }
    };

    const handleMouseMove = (e) => {
      if (window.innerWidth < 768 || document.body.classList.contains('modal-open')) return;
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
}
