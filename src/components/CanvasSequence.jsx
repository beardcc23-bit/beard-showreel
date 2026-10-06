import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 是否偏好減少動態（SSR / 測試環境安全）
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Hero 循環影片播放器
 * 原本為 145 張 webp 序列 + Canvas rAF 繪製（桌機 17MB / 手機 5.6MB），
 * 改為原生 <video>：AV1 webm 優先、H.264 mp4 備援，體積降至約 1~2MB，並交由硬體解碼。
 * 元件名稱與 props 介面維持不變，避免影響 Hero / App。
 */
export default function CanvasSequence({ onPlayVideo, isModalOpen, onLoaded }) {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); // poster 是否載入完成（首頁解鎖）
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [reducedMotion] = useState(prefersReducedMotion);

  const basePath = import.meta.env.BASE_URL;
  const suffix = isMobile ? '-mobile' : '';
  const posterSrc = `${basePath}hero-poster${suffix}.webp`;

  // 以 poster 作為首屏解鎖依據：poster 很小，能最快解除 preloader；影片隨後無縫接手
  useEffect(() => {
    let isCancelled = false;
    let fallbackTimer = null;

    const unlock = () => {
      if (isCancelled) return;
      clearTimeout(fallbackTimer);
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };

    const posterImg = new Image();
    posterImg.onload = unlock;
    posterImg.onerror = unlock; // 容錯防卡死
    posterImg.src = posterSrc;
    // 最長 3 秒保底，避免網路異常時 preloader 永遠不消失
    fallbackTimer = setTimeout(unlock, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      posterImg.onload = null;
      posterImg.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 播放控制：hover 暫停 / Modal 開啟 / 離開視域 / 減少動態偏好 時暫停
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isLoading) return;

    const shouldPlay = (inView) => inView && isPlaying && !isModalOpen && !reducedMotion;
    const sync = (inView) => {
      if (shouldPlay(inView)) {
        video.muted = true; // React 的 muted prop 不一定寫入 DOM attribute，iOS 自動播放需確保靜音
        const p = video.play();
        // 自動播放被瀏覽器阻擋（例如 iOS 低電量模式）時靜默處理，維持 poster 畫面
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else {
        video.pause();
      }
    };

    let inView = true;
    sync(inView);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync(inView);
      },
      { threshold: 0.15 }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, [isLoading, isPlaying, isModalOpen, reducedMotion]);

  const handleMouseEnter = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
    setShowOverlay(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      {/* 高質感科幻 Preloader (poster 載入即消失) */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-bg-core pointer-events-auto"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* 外圈 */}
              <svg className="absolute w-full h-full transform -rotate-90" aria-hidden="true">
                <circle cx="56" cy="56" r="50" className="stroke-zinc-800" strokeWidth="2" fill="transparent" />
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  className="stroke-aurora-blue"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={0}
                />
              </svg>
              {/* 內圈呼吸燈 */}
              <div className="w-20 h-20 rounded-full bg-bg-mist flex items-center justify-center animate-pulse border border-aurora-blue/20">
                <span className="mono text-xs font-black text-white">SYNC</span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <span className="mono text-[10px] tracking-[0.4em] text-aurora-blue uppercase animate-pulse">
                INITIALIZING VISUAL MATRIX
              </span>
              <p className="text-[10px] text-zinc-500 mono mt-2 uppercase tracking-widest">
                FPS: 30 // STREAM: HW DECODE // REGISTRY: OPTIMAL
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 播放器後方 HUD 同心圓旋轉背景（僅在手機版顯示，網頁桌面版隱藏） */}
      {!isLoading && (
        <div className="absolute w-[1300px] h-[1300px] md:w-[1500px] md:h-[1500px] max-w-[140vw] max-h-[140vw] z-0 pointer-events-none flex md:hidden items-center justify-center overflow-visible opacity-50">
          <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-zinc-800/80 animate-[spin_100s_linear_infinite]" />
          <div className="absolute w-[75%] h-[75%] rounded-full border-[1.5px] border-dashed border-dawn-gold/25 animate-[spin_70s_linear_infinite_reverse]" />
          <div className="absolute w-[55%] h-[55%] rounded-full border border-zinc-800/40 animate-[spin_40s_linear_infinite]" />
        </div>
      )}

      {/* 影片主體（移除 transition-all，避免與 Framer Motion 每幀 transform 互相拖拽） */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: isLoading ? 0 : 1,
          scale: isLoading ? 0.95 : 1,
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`w-full md:w-[1000px] md:max-w-[90vw] aspect-[5/4] md:aspect-video bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-none md:rounded-sm relative overflow-hidden border-y border-zinc-800 md:border md:border-zinc-800 z-10 ${
          isLoading ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <div className="w-full h-full overflow-hidden relative">
          <video
            ref={videoRef}
            className="w-full h-full block pointer-events-none object-cover"
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          >
            {/* AV1 level：桌機 1504x832 = 4.0 (08)、手機 960x532 = 3.0 (04) */}
            <source
              src={`${basePath}hero${suffix}.webm`}
              type={`video/webm; codecs="av01.0.${isMobile ? '04' : '08'}M.08"`}
            />
            <source src={`${basePath}hero${suffix}.mp4`} type="video/mp4" />
          </video>

          {/* Hover 滿版微暗調半透明 Overlay，凸顯 YT 紅色按鈕但不擋住畫格內容 */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`flex flex-col items-center transform transition-[transform,opacity] duration-300 ${
                showOverlay ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`}
            >
              {/* YouTube 紅色播放按鈕 */}
              <img
                src={`${basePath}youtube-logo.webp`}
                alt="YouTube Play Reel"
                className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_0_35px_rgba(255,0,0,0.75)] hover:scale-105 transition-transform duration-200"
              />

              <span className="mono text-[10px] md:text-xs text-white uppercase tracking-[0.3em] mt-4 font-black drop-shadow-md">
                Click to View Full Reel
              </span>
            </div>
          </div>

          {/* 置中獨立感應區：為畫框中心 50% 比例大小 (w-1/2 h-1/2) */}
          {!isLoading && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={() => onPlayVideo('s6s2p87fPdA')}
              className="absolute inset-0 m-auto w-1/2 h-1/2 z-20 cursor-pointer pointer-events-auto flex items-center justify-center"
            />
          )}

          <div className="glow-border pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
