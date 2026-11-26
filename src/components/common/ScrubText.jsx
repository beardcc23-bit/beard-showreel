import React, { useRef } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion';

function AnimatedScrubParagraph({ text, className, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.92', 'start 0.55'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.56, 1]);
  const willChange = useTransform(scrollYProgress, (v) => (v > 0 && v < 1 ? 'opacity' : 'auto'));

  return (
    <p ref={containerRef} className={className}>
      <m.span style={{ opacity, willChange }} className="block text-white">
        {children || text}
      </m.span>
    </p>
  );
}

/**
 * ScrubText: 滾動光束顯影段落組件 (高效段落級優化版)
 * - 減少動態模式下直接靜態渲染，省去 6 組滾動觀測器開銷
 * - 僅於滾動過渡區間 (0 < progress < 1) 啟用 will-change: opacity，滾過定格後自動歸還合成層
 */
export default function ScrubText({ text, className = '', children }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) {
    return (
      <p className={className}>
        <span className="block text-white">{children || text}</span>
      </p>
    );
  }
  return (
    <AnimatedScrubParagraph text={text} className={className}>
      {children}
    </AnimatedScrubParagraph>
  );
}
