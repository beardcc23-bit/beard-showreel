import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FRAME_COUNT = 145; // png-0_00000000.webp ~ png-0_00000144.webp
const FPS = 30;
const FRAME_INTERVAL = 1000 / FPS;
const AUTOPLAY_WATCHDOG_MS = 2000; // 呼叫 play() 後若仍未播放，判定被瀏覽器阻擋
const REEL_VIDEO_ID = 's6s2p87fPdA';

/**
 * Hero 循環播放器（雙模式）
 * - 主模式 video：AV1 webm / H.264 mp4，體積小、硬體解碼。
 * - 備援模式 frames：瀏覽器阻擋自動播放時（iOS / macOS 低電量模式、部分內嵌瀏覽器、省電設定），
 *   自動退回 webp 序列 + Canvas 繪製，不受自動播放政策限制，保證永遠連續播放。
 * 行為：持續循環 → 游標進入中央 50% 感應區時停在當格 → 移開後從該格繼續 → 點擊開啟 YouTube 完整 Reel。
 */
export default function CanvasSequence({ onPlayVideo, isModalOpen, onLoaded }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const framesRef = useRef([]);
  const frameIndexRef = useRef(0);

  const [mode, setMode] = useState('video'); // 'video' | 'frames'
  const [isLoading, setIsLoading] = useState(true); // poster 是否載入完成（首頁解鎖）
  const [isHovering, setIsHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const basePath = import.meta.env.BASE_URL;
  const suffix = isMobile ? '-mobile' : '';
  const posterSrc = `${basePath}hero-poster${suffix}.webp`;
  const shouldPlay = inView && !isHovering && !isModalOpen;

  // 切換至序列備援模式（由影片當下時間接續，畫面不跳回第一格）
  const fallbackToFrames = () => {
    const video = videoRef.current;
    if (video) {
      frameIndexRef.current = Math.floor((video.currentTime || 0) * FPS) % FRAME_COUNT;
      video.pause();
    }
    setMode('frames');
  };

  // ── 首屏解鎖：poster 載入即解除 preloader（最長 3 秒保底） ──
  useEffect(() => {
    let isCancelled = false;
    const unlock = () => {
      if (isCancelled) return;
      clearTimeout(fallbackTimer);
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };
    const posterImg = new Image();
    posterImg.onload = unlock;
    posterImg.onerror = unlock;
    posterImg.src = posterSrc;
    const fallbackTimer = setTimeout(unlock, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      posterImg.onload = null;
      posterImg.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 視域偵測：離開畫面時暫停（兩種模式共用） ──
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── 影片模式：確保靜音自動播放屬性真的寫進 DOM（React 的 muted prop 不會輸出 attribute） ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
  }, []);

  // ── 影片模式：播放 / 暫停控制 + 自動播放被阻擋偵測 ──
  useEffect(() => {
    if (mode !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    if (!shouldPlay) {
      video.pause(); // 停在當格
      return;
    }

    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        // AbortError = 被 hover 暫停打斷，屬正常；其餘（NotAllowedError 等）視為自動播放被擋
        if (err && err.name !== 'AbortError') fallbackToFrames();
      });
    }

    // 看門狗：部分瀏覽器被擋時 promise 不會 reject，只是一直停著
    const watchdog = setTimeout(() => {
      if (videoRef.current && videoRef.current.paused) fallbackToFrames();
    }, AUTOPLAY_WATCHDOG_MS);

    return () => clearTimeout(watchdog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shouldPlay]);

  // ── 序列模式：繪製單格（cover 置中裁切） ──
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img) return false;
    if (!ctxRef.current) ctxRef.current = canvas.getContext('2d');
    const ctx = ctxRef.current;
    if (!ctx) return false;

    // 畫布解析度對齊影格原始尺寸，避免縮放鋸齒
    if (canvas.width !== img.naturalWidth) canvas.width = img.naturalWidth;
    if (canvas.height !== img.naturalHeight) canvas.height = img.naturalHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return true;
  };

  // ── 序列模式：分批預載影格（從接續的那一格開始載） ──
  useEffect(() => {
    if (mode !== 'frames') return;
    let isCancelled = false;
    const folder = isMobile ? 'png-0-mobile' : 'png-0';
    const start = frameIndexRef.current;
    const order = Array.from({ length: FRAME_COUNT }, (_, i) => (start + i) % FRAME_COUNT);
    framesRef.current = new Array(FRAME_COUNT);
    let cursor = 0;

    const loadFrame = (index) =>
      new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          if (!isCancelled) {
            framesRef.current[index] = img;
            if (index === frameIndexRef.current) drawFrame(index); // 第一格到位立即上畫面
          }
          resolve();
        };
        img.onerror = () => resolve(); // 容錯，單格失敗不中斷
        img.src = `${basePath}${folder}/png-0_${String(index).padStart(8, '0')}.webp?v=3`;
      });

    const worker = async () => {
      while (cursor < order.length && !isCancelled) {
        await loadFrame(order[cursor++]);
      }
    };
    // 4 條併發，避免網路排隊堵塞
    for (let w = 0; w < 4; w++) worker();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── 序列模式：30fps rAF 循環；暫停時停在當格 ──
  useEffect(() => {
    if (mode !== 'frames' || !shouldPlay) return;
    let rafId = null;
    let last = performance.now();

    const tick = (now) => {
      const delta = now - last;
      if (delta >= FRAME_INTERVAL) {
        const next = (frameIndexRef.current + 1) % FRAME_COUNT;
        // 下一格尚未載入時停留在目前格，避免預載期間閃爍跳格
        if (framesRef.current[next]) {
          frameIndexRef.current = next;
          drawFrame(next);
        }
        last = now - (delta % FRAME_INTERVAL);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shouldPlay]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
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

      {/* 播放器主體（不加 transition-all，避免與 Framer Motion 每幀 transform 互相拖拽） */}
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
          {/* 主模式：原生影片 */}
          <video
            ref={videoRef}
            className={`w-full h-full pointer-events-none object-cover ${mode === 'video' ? 'block' : 'hidden'}`}
            poster={posterSrc}
            autoPlay
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
            <source src={`${basePath}hero${suffix}.mp4`} type="video/mp4" onError={fallbackToFrames} />
          </video>

          {/* 備援模式：webp 序列 Canvas（僅在自動播放被阻擋時啟用） */}
          {mode === 'frames' && (
            <canvas
              ref={canvasRef}
              className="w-full h-full block pointer-events-none object-cover"
              style={{ backgroundImage: `url(${posterSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              aria-hidden="true"
            />
          )}

          {/* Hover 滿版微暗調半透明 Overlay，凸顯 YT 紅色按鈕但不擋住畫格內容 */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className={`flex flex-col items-center transform transition-[transform,opacity] duration-300 ${
                isHovering ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
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

          {/* 置中獨立感應區：畫框中心 50% 範圍 (w-1/2 h-1/2)，進入即停格、移開續播、點擊開啟 YouTube */}
          {!isLoading && (
            <div
              data-testid="hero-hotspot"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onClick={() => onPlayVideo(REEL_VIDEO_ID)}
              className="absolute inset-0 m-auto w-1/2 h-1/2 z-20 cursor-pointer pointer-events-auto flex items-center justify-center"
            />
          )}

          <div className="glow-border pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}
