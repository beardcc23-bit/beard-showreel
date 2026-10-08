import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrubText: 滾動光束顯影段落組件 (高效段落級優化版)
 * 消除 150+ 個微型 DOM 節點，由段落層級進行單次 GPU 平滑透明度過渡
 */
export default function ScrubText({ text, className = "", children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.92", "start 0.55"],
  });

  // 改動 opacity 取代 color：color 每幀變動會強制重繪整段中文字（主執行緒），opacity 只走合成層
  // 0.56 ≈ 原本起點 rgba(212, 212, 216, 0.68) 的亮度；終點同為純白
  const opacity = useTransform(scrollYProgress, [0, 1], [0.56, 1]);

  return (
    <p ref={containerRef} className={className}>
      {/* 透明度放在內層 span：引言段落的金色左框線不會跟著變暗；will-change 確保獨立合成層，更新時不重繪 */}
      <motion.span style={{ opacity }} className="block text-white will-change-[opacity]">
        {children || text}
      </motion.span>
    </p>
  );
}

