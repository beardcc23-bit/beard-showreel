import React, { useRef } from 'react';
import CanvasSequence from './CanvasSequence';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

/**
 * 第一幕 Hero：純粹置中影像舞台（無任何疊壓文字遮擋作品畫面）
 */
export default function Hero({ onPlayVideo, isModalOpen, onLoaded }) {
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] h-screen w-full flex items-center justify-center px-4 md:px-10 overflow-hidden bg-transparent"
    >
      {/* 語意化首頁標題（僅供搜尋引擎與無障礙讀取，畫面完全不顯示） */}
      <h1 className="sr-only">Beard Chou 周威全 | 視覺創造 (Autodesk Flame VFX)</h1>

      {/* 置中純淨連續圖 / 影片銀幕 */}
      <div className="w-full max-w-[1060px] mx-auto relative z-10">
        <CanvasSequence
          onPlayVideo={onPlayVideo}
          isModalOpen={isModalOpen}
          onLoaded={onLoaded}
        />
      </div>
    </section>
  );
}
