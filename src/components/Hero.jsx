import React, { useRef, useState } from 'react';
import CanvasSequence from './CanvasSequence';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

/**
 * 第一幕 Hero：滾動驅動 Sticky 逐幀時間軸舞台（往下推進、往上倒轉、尾段微縮淡出銜接個人介紹）
 * - 外層使用 overflow-x-clip 維持 position: sticky 正常運作
 */
export default function Hero({ isModalOpen, onLoaded }) {
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative w-full overflow-x-clip bg-transparent ${
        prefersReduced ? 'h-[100dvh]' : 'h-[230dvh] md:h-[280vh]'
      }`}
    >
      {/* 語意化首頁標題（僅供搜尋引擎與無障礙讀取，畫面完全不顯示） */}
      <h1 className="sr-only">Beard Chou 周威全 | 視覺創造 (Autodesk Flame VFX)</h1>

      {/* Sticky 釘選舞台：手機 px-0 零邊距貼邊直式滿版；桌機解鎖至 1760px 劇院級大銀幕並依視窗高度自適應防裁切 */}
      <div className="sticky top-0 h-[100dvh] w-full flex items-center justify-center px-0 md:px-6 pt-14 md:pt-16">
        <div className="w-full md:max-w-[min(1760px,calc((100dvh-6.75rem)*1.7778+80px))] mx-auto relative z-10">
          <CanvasSequence
            containerRef={sectionRef}
            isModalOpen={isModalOpen}
            onLoaded={onLoaded}
          />
        </div>
      </div>
    </section>
  );
}
