import React, { useRef } from 'react';
import { m, useScroll, useTransform, useMotionValueEvent, useInView, useReducedMotion } from 'framer-motion';

function ActiveScrubSpan({ containerRef, settledStateRef, children }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.92', 'start 0.55'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.38, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [6, 0]);
  const willChange = useTransform(scrollYProgress, (v) =>
    v > 0 && v < 1 ? 'opacity, transform' : 'auto'
  );

  useMotionValueEvent(opacity, 'change', (latest) => {
    if (Math.abs(latest - settledStateRef.current.opacity) >= 0.005) {
      settledStateRef.current.opacity = latest;
    }
  });

  useMotionValueEvent(y, 'change', (latest) => {
    if (Math.abs(latest - settledStateRef.current.y) >= 0.05) {
      settledStateRef.current.y = latest;
    }
  });

  return (
    <m.span style={{ opacity, y, willChange }} className="block text-white">
      {children}
    </m.span>
  );
}

/**
 * ScrubText: 滾動光束顯影段落組件（視口閘門省電 ＋ 微幅浮升反差升級版）
 * - 減少動態模式下直接靜態渲染，省去滾動觀測器開銷
 * - 搭配 useInView 視口閘門：段落遠離視窗超過 240px 時自動卸載 useScroll 訂閱並固定最後顯影狀態，讓作品牆瀏覽期達到 0 常駐滾動換算
 */
export default function ScrubText({ text, className = '', children }) {
  const containerRef = useRef(null);
  const settledStateRef = useRef({ opacity: 0.38, y: 6 });
  const prefersReduced = useReducedMotion();
  const isNearViewport = useInView(containerRef, { margin: '240px 0px' });
  const content = children || text;

  if (prefersReduced) {
    return (
      <p className={className}>
        <span className="block text-white">{content}</span>
      </p>
    );
  }

  return (
    <p ref={containerRef} className={className}>
      {isNearViewport ? (
        <ActiveScrubSpan containerRef={containerRef} settledStateRef={settledStateRef}>
          {content}
        </ActiveScrubSpan>
      ) : (
        <span
          style={{
            opacity: settledStateRef.current.opacity,
            transform:
              Math.abs(settledStateRef.current.y) >= 0.05
                ? `translate3d(0, ${settledStateRef.current.y.toFixed(2)}px, 0)`
                : undefined,
          }}
          className="block text-white"
        >
          {content}
        </span>
      )}
    </p>
  );
}
