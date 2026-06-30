import React from 'react';
import CanvasSequence from './CanvasSequence';

export default function Hero({ onPlayVideo, isModalOpen }) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-transparent">
      {/* 序列圖畫布區：絕對置中，無重疊文字 */}
      <div className="absolute inset-0 z-0">
        {/* 電影感漸層遮罩：退至背景層，不遮擋畫布播放 */}
        <div className="absolute inset-0 cinematic-gradient z-0 pointer-events-none" />
        <CanvasSequence onPlayVideo={onPlayVideo} isModalOpen={isModalOpen} />
      </div>



      {/* 下滑提示：科技感閃爍微箭頭 */}
      <div className="absolute bottom-10 inset-x-0 z-30 flex flex-col items-center gap-2 animate-bounce pointer-events-none opacity-40">
        <span className="mono text-[6px] uppercase tracking-[0.4em] pl-[0.4em] text-white">Scroll to Sync</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aurora-blue">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
}
