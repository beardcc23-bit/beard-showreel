import React from 'react';
import CanvasSequence from './CanvasSequence';

export default function Hero({ onPlayVideo, isModalOpen, onLoaded }) {
  return (
    <section className="relative min-h-[100dvh] h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
      {/* 語意化首頁核心標題 (提供搜尋引擎 AEO/SEO 與螢幕閱讀器，視覺隱藏保持電影純粹感) */}
      <h1 className="sr-only">Beard Chou 周威全 | 視覺創造 (Autodesk Flame VFX)</h1>

      {/* 序列圖畫布區：絕對置中，無重疊文字 */}
      <div className="absolute inset-0 z-0">
        {/* 電影感漸層遮罩：退至背景層，不遮擋畫布播放 */}
        <div className="absolute inset-0 cinematic-gradient z-0 pointer-events-none" />
        <CanvasSequence onPlayVideo={onPlayVideo} isModalOpen={isModalOpen} onLoaded={onLoaded} />
      </div>



      {/* 下滑提示：科技感閃爍微箭頭 */}
      <div className="absolute bottom-10 inset-x-0 z-30 flex flex-col items-center gap-2 animate-bounce pointer-events-none opacity-50">
        <span className="mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] pl-[0.25em] text-white/80 font-medium">Scroll to Sync</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aurora-blue">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
}
