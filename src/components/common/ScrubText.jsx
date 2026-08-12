import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ScrubChar: 逐字滾動顯影元件
 */
function ScrubChar({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.65, 1.0]);
  const color = useTransform(
    progress,
    range,
    ['rgba(212, 212, 216, 0.68)', 'rgba(255, 255, 255, 1.0)']
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
 * 當頁面向下滾動時，文字將以顯影光束掃過般逐字亮起，保持至少 2/3 以上的高可讀性
 */
export default function ScrubText({ text, className = "", children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.95", "start 0.45"],
  });

  if (children) {
    return (
      <div ref={containerRef} className={className}>
        {children}
      </div>
    );
  }

  const chunks = useMemo(() => {
    if (!text) return [];
    return text.match(/[\u4e00-\u9fa5]{1,3}|[^\u4e00-\u9fa5]+/g) || [text];
  }, [text]);
  const total = chunks.length;

  return (
    <p ref={containerRef} className={className}>
      {chunks.map((chunk, i) => {
        const start = (i / total) * 0.65;
        const end = Math.min(start + 0.35, 1);
        return (
          <ScrubChar key={i} progress={scrollYProgress} range={[start, end]}>
            {chunk}
          </ScrubChar>
        );
      })}
    </p>
  );
}
