import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrubChar: 逐字滾動顯影元件
 */
function ScrubChar({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.22, 1.0]);
  const color = useTransform(
    progress,
    range,
    ['rgba(161, 161, 170, 0.4)', 'rgba(244, 244, 245, 1.0)']
  );

  return (
    <motion.span
      style={{ opacity, color }}
      className="inline transition-colors duration-100"
    >
      {children}
    </motion.span>
  );
}

/**
 * ScrubText: 滾動光束顯影解密段落組件
 * 當頁面向下滾動時，文字將以顯影光束掃過般逐字亮起
 */
export default function ScrubText({ text, className = "", children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });

  if (children) {
    const opacity = useTransform(scrollYProgress, [0, 0.6], [0.35, 1]);
    return (
      <motion.div
        ref={containerRef}
        className={className}
        style={{ opacity }}
      >
        {children}
      </motion.div>
    );
  }

  // 繁體中文以單字分割，保留流暢顯影感
  const characters = text.split("");
  const total = characters.length;

  return (
    <p ref={containerRef} className={className}>
      {characters.map((char, i) => {
        const start = (i / total) * 0.75;
        const end = Math.min(start + 0.25, 1);
        return (
          <ScrubChar key={i} progress={scrollYProgress} range={[start, end]}>
            {char}
          </ScrubChar>
        );
      })}
    </p>
  );
}
