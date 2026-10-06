import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrubText: 滾動光束顯影段落組件 (高效段落級優化版)
 * 消除 150+ 個微型 DOM 節點，由段落層級進行單次 GPU 平滑色彩與透明度過渡
 */
export default function ScrubText({ text, className = "", children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.92", "start 0.55"],
  });

  // 只做顏色漸變：原本 opacity(0.65) × 顏色 alpha(0.68) 會雙重調暗至約 44%，對比過低
  const color = useTransform(
    scrollYProgress,
    [0, 1],
    ['rgba(212, 212, 216, 0.68)', 'rgba(255, 255, 255, 1.0)']
  );

  return (
    <motion.p
      ref={containerRef}
      style={{ color }}
      className={`transform-gpu ${className}`}
    >
      {children || text}
    </motion.p>
  );
}

