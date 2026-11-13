import React, { useEffect, useRef } from 'react';

/**
 * 公用元件: 緩動數字累積動畫計數器
 * 採用 DOM textContent 直寫（僅在整數值改變時更新），消除滾動進場時數百次 React setState 與重渲染
 */
const AnimatedCounter = React.memo(function AnimatedCounter({ value, trigger, duration = 1.5 }) {
  const spanRef = useRef(null);
  const targetValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  useEffect(() => {
    if (!trigger) {
      if (spanRef.current) spanRef.current.textContent = '0';
      return;
    }

    let startTime = null;
    let animationFrameId = null;
    let lastRendered = -1;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      const nextValue = progress < 1 ? Math.floor(easeProgress * targetValue) : targetValue;

      if (nextValue !== lastRendered && spanRef.current) {
        spanRef.current.textContent = String(nextValue);
        lastRendered = nextValue;
      }

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [trigger, targetValue, duration]);

  return <span ref={spanRef}>0</span>;
});

export default AnimatedCounter;
