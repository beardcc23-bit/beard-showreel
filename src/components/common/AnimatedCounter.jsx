import React, { useEffect, useState } from 'react';

/**
 * 公用元件: 緩動數字累積動畫計數器
 */
const AnimatedCounter = React.memo(function AnimatedCounter({ value, trigger, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const targetValue = typeof value === 'number' && !isNaN(value) ? value : 0;

  useEffect(() => {
    if (!trigger) return;

    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setCount(Math.floor(easeProgress * targetValue));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
        setIsCompleted(true);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [trigger, targetValue, duration]);

  return (
    <span>
      {count}
    </span>
  );
});

export default AnimatedCounter;
