import React, { useRef } from 'react';
import { m, useScroll, useTransform, useMotionValueEvent, useInView, useReducedMotion } from 'framer-motion';

function ActiveScrubSpan({ containerRef, settledOpacityRef, children }) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.92', 'start 0.55'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.56, 1]);
  const willChange = useTransform(scrollYProgress, (v) => (v > 0 && v < 1 ? 'opacity' : 'auto'));

  useMotionValueEvent(opacity, 'change', (latest) => {
    settledOpacityRef.current = latest;
  });

  return (
    <m.span style={{ opacity, willChange }} className="block text-white">
      {children}
    </m.span>
  );
}

/**
 * ScrubText: 滾動光束顯影段落組件（視口閘門省電版）
 * - 減少動態模式下直接靜態渲染，省去滾動觀測器開銷
 * - 搭配 useInView 視口閘門：段落遠離視窗超過 240px 時自動卸載 useScroll 訂閱並固定最後顯影透明度，讓作品牆瀏覽期達到 0 常駐滾動換算
 */
export default function ScrubText({ text, className = '', children }) {
  const containerRef = useRef(null);
  const settledOpacityRef = useRef(0.56);
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
        <ActiveScrubSpan containerRef={containerRef} settledOpacityRef={settledOpacityRef}>
          {content}
        </ActiveScrubSpan>
      ) : (
        <span style={{ opacity: settledOpacityRef.current }} className="block text-white">
          {content}
        </span>
      )}
    </p>
  );
}
