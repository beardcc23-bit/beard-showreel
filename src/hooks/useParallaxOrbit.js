import { useEffect } from 'react';

/**
 * 自訂 Hook: 處理 3D 幾何軌道滑鼠插值 (Lerp) 視差與繪製控制
 */
export function useParallaxOrbit() {
  useEffect(() => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

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

      orbit.style.transform = `translate3d(calc(-50% + ${currentX * 18}px), calc(-50% + ${currentY * 15}px), 0) rotateX(${-currentY * 12}deg) rotateY(${currentX * 12}deg)`;

      // 如果差距仍大於 0.0001 則繼續下一幀插值，否則停止動畫迴圈以節省資源 (Stop Ticking)
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        isRunning = false;
      }
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
}
