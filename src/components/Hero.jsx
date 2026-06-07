import React from 'react';
import CanvasSequence from './CanvasSequence';

export default function Hero({ onPlayVideo }) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* 序列圖畫布區：絕對置中，無重疊文字 */}
      <div className="absolute inset-0 z-0">
        {/* 電影感漸層遮罩：退至背景層，不遮擋畫布播放 */}
        <div className="absolute inset-0 cinematic-gradient z-0 pointer-events-none" />
        <CanvasSequence onPlayVideo={onPlayVideo} />
      </div>

      {/* 浮動 HUD 標題資訊條 */}
      <div className="absolute top-28 left-8 z-30 pointer-events-none max-w-lg hidden sm:block">
        <div className="mono text-[10px] text-aurora-blue uppercase tracking-[0.4em] mb-2">// BRAND_STATEMENT</div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-white mb-1">Beard Showreel</h1>
        <p className="mono text-[9px] text-zinc-400 uppercase tracking-widest leading-relaxed">
          13 YEARS OF OPTICAL PRECISION. 1 FRAME AT A TIME.<br />
          <span className="text-[9px] text-zinc-600 font-light">（13 年的光學精度。每一影格，皆是雕琢。）</span>
        </p>
      </div>

      {/* 下滑提示：科技感閃爍微箭頭 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce pointer-events-none opacity-40">
        <span className="mono text-[8px] uppercase tracking-[0.4em] text-white">Scroll to Sync</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-aurora-blue">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
}
