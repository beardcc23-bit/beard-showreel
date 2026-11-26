import React, { useRef } from 'react';
import CanvasSequence from './CanvasSequence';
import { useOffscreenPause } from '../hooks/useOffscreenPause';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * 第一幕 Hero：滾動驅動 Sticky 逐幀時間軸舞台（往下推進、往上倒轉、尾段微縮淡出銜接個人介紹）
 * - 外層使用 overflow-x-clip 維持 position: sticky 正常運作
 */
export default function Hero({ isModalOpen, onLoaded }) {
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <section
      id="hero"
      ref={sectionRef}
      className={`relative w-full overflow-x-clip bg-transparent ${
        prefersReduced ? 'h-[100dvh]' : 'h-[195dvh] md:h-[280vh]'
      }`}
    >
      {/* 語意化首頁標題（僅供搜尋引擎與無障礙讀取，畫面完全不顯示） */}
      <h1 className="sr-only">Beard Chou 周威全 | 視覺創造 (Autodesk Flame VFX)</h1>

      {/* Sticky 釘選舞台：桌機與手機統一 items-start 釘在導覽列正下方，消除視窗縮放時的上方空隙 */}
      <div
        data-hero-sticky
        className="sticky top-0 h-auto pb-0 md:pb-5 w-full flex items-start justify-center px-0 md:px-6 pt-16 md:pt-[84px]"
      >
        <div className="w-full md:max-w-[min(1760px,calc((100dvh-7.25rem)*1.7778+80px))] mx-auto relative z-10">
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
