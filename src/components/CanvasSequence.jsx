import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

const FRAME_COUNT = 145;
const FPS = 30;
const FRAME_INTERVAL = 1000 / FPS;
const AUTOPLAY_WATCHDOG_MS = 2000;
const REEL_VIDEO_ID = 's6s2p87fPdA';
const FRAME_WINDOW_AHEAD = 24;
const FRAME_WINDOW_BEHIND = 6;
const MAX_CONCURRENT_FRAME_LOADS = 4;

/**
 * Hero 大銀幕循環播放器（雙模式：AV1/MP4 硬體解碼 + 滑動視窗 WebP 序列備援）
 * - 零圓角無框銀幕設計，移除廉價發光框與突兀紅色 YouTube PNG
 */
export default function CanvasSequence({ onPlayVideo, isModalOpen, onLoaded }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const framesRef = useRef([]);
  const ensureWindowRef = useRef(null);
  const frameIndexRef = useRef(0);
  const hasFallenBackRef = useRef(false);

  const [mode, setMode] = useState('video');
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [inView, setInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const basePath = import.meta.env.BASE_URL;
  const suffix = isMobile ? '-mobile' : '';
  const posterSrc = `${basePath}hero-poster${suffix}.webp`;
  const shouldPlay = inView && isPageVisible && !isHovering && !isModalOpen;

  const fallbackToFrames = () => {
    if (hasFallenBackRef.current) return;
    hasFallenBackRef.current = true;
    const video = videoRef.current;
    if (video) {
      frameIndexRef.current = Math.floor((video.currentTime || 0) * FPS) % FRAME_COUNT;
      video.pause();
      video.querySelectorAll('source').forEach((s) => s.remove());
      video.removeAttribute('src');
      try {
        video.load();
      } catch (_) {}
    }
    setMode('frames');
  };

  useEffect(() => {
    let isCancelled = false;
    let fallbackTimer = null;
    const unlock = () => {
      if (isCancelled) return;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };
    fallbackTimer = setTimeout(unlock, 3000);
    const posterImg = new Image();
    posterImg.onload = unlock;
    posterImg.onerror = unlock;
    posterImg.src = posterSrc;

    return () => {
      isCancelled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      posterImg.onload = null;
      posterImg.onerror = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('loop', '');
  }, []);

  useEffect(() => {
    if (mode !== 'video') return undefined;
    const video = videoRef.current;
    if (!video) return undefined;

    if (!shouldPlay) {
      video.pause();
      return undefined;
    }

    video.muted = true;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => {
        if (err && err.name !== 'AbortError') fallbackToFrames();
      });
    }

    const watchdog = setTimeout(() => {
      if (!document.hidden && videoRef.current && videoRef.current.paused) {
        fallbackToFrames();
      }
    }, AUTOPLAY_WATCHDOG_MS);

    return () => clearTimeout(watchdog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shouldPlay]);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[index];
    if (!canvas || !img) return false;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) return false;

    if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return true;
  };

  useEffect(() => {
    if (mode !== 'frames') return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const blockMenu = (e) => e.preventDefault();
    canvas.addEventListener('contextmenu', blockMenu);
    try {
      canvas.toDataURL = () => 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      canvas.toBlob = () => null;
    } catch (_) {}
    return () => canvas.removeEventListener('contextmenu', blockMenu);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'frames') return undefined;
    let isCancelled = false;
    const folder = isMobile ? 'png-0-mobile' : 'png-0';
    framesRef.current = new Array(FRAME_COUNT).fill(null);
    const loadingSet = new Set();
    const queue = [];
    let activeLoads = 0;

    const isWithinWindow = (idx, center) => {
      const forward = (idx - center + FRAME_COUNT) % FRAME_COUNT;
      const backward = (center - idx + FRAME_COUNT) % FRAME_COUNT;
      return forward <= FRAME_WINDOW_AHEAD || backward <= FRAME_WINDOW_BEHIND;
    };

    const pumpQueue = () => {
      while (!isCancelled && activeLoads < MAX_CONCURRENT_FRAME_LOADS && queue.length > 0) {
        const index = queue.shift();
        if (framesRef.current[index] || loadingSet.has(index)) continue;
        if (!isWithinWindow(index, frameIndexRef.current)) continue;

        loadingSet.add(index);
        activeLoads += 1;

        const img = new Image();
        img.decoding = 'async';
        const finish = () => {
          loadingSet.delete(index);
          activeLoads -= 1;
          pumpQueue();
        };
        img.onload = () => {
          if (!isCancelled && isWithinWindow(index, frameIndexRef.current)) {
            framesRef.current[index] = img;
            if (index === frameIndexRef.current) drawFrame(index);
          }
          finish();
        };
        img.onerror = finish;
        img.src = `${basePath}${folder}/png-0_${String(index).padStart(8, '0')}.webp?v=3`;
      }
    };

    const syncWindow = (center) => {
      if (isCancelled) return;
      for (let i = 0; i < FRAME_COUNT; i += 1) {
        if (framesRef.current[i] && i !== center && !isWithinWindow(i, center)) {
          framesRef.current[i].onload = null;
          framesRef.current[i].onerror = null;
          framesRef.current[i] = null;
        }
      }
      for (let offset = 0; offset <= FRAME_WINDOW_AHEAD; offset += 1) {
        const idx = (center + offset) % FRAME_COUNT;
        if (!framesRef.current[idx] && !loadingSet.has(idx) && !queue.includes(idx)) {
          queue.push(idx);
        }
      }
      pumpQueue();
    };

    ensureWindowRef.current = syncWindow;
    syncWindow(frameIndexRef.current);

    return () => {
      isCancelled = true;
      ensureWindowRef.current = null;
      queue.length = 0;
      loadingSet.clear();
      framesRef.current.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
      framesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== 'frames' || !shouldPlay) return undefined;
    let rafId = null;
    let last = performance.now();

    const tick = (now) => {
      const delta = now - last;
      if (delta >= FRAME_INTERVAL) {
        const next = (frameIndexRef.current + 1) % FRAME_COUNT;
        if (framesRef.current[next]) {
          frameIndexRef.current = next;
          drawFrame(next);
        } else {
          let advanced = false;
          for (let step = 1; step < FRAME_COUNT; step += 1) {
            const candidate = (next + step) % FRAME_COUNT;
            if (framesRef.current[candidate]) {
              frameIndexRef.current = candidate;
              drawFrame(candidate);
              advanced = true;
              break;
            }
          }
          if (!advanced) {
            frameIndexRef.current = next;
          }
        }
        ensureWindowRef.current?.(frameIndexRef.current);
        last = now - (delta % FRAME_INTERVAL);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shouldPlay]);

  return (
    <div ref={wrapperRef} className="relative w-full aspect-[5/4] md:aspect-video bg-[#030407] shadow-[0_32px_90px_rgba(0,0,0,0.85)] overflow-hidden">
      {/* 極簡暗房載入遮罩 */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#030407]/90 backdrop-blur-md">
          <div className="w-12 h-[1.5px] bg-white/15 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-spectral-crimson animate-pulse" />
          </div>
          <span className="mono text-[10px] tracking-[0.32em] text-zinc-400 uppercase mt-4">
            LOADING REEL
          </span>
        </div>
      )}

      {/* 播放器銀幕本體 */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className={`w-full h-full relative transition-[opacity,transform] duration-700 ease-out ${
          isLoading ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
        }`}
      >
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
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            if (shouldPlay) {
              e.currentTarget.play().catch(() => {});
            }
          }}
          onError={fallbackToFrames}
        >
          <source
            src={`${basePath}hero${suffix}.webm`}
            type={`video/webm; codecs="av01.0.${isMobile ? '04' : '08'}M.08"`}
          />
          <source src={`${basePath}hero${suffix}.mp4`} type="video/mp4" onError={fallbackToFrames} />
        </video>

        {mode === 'frames' && (
          <canvas
            ref={canvasRef}
            className="w-full h-full block pointer-events-none object-cover"
            style={{ backgroundImage: `url(${posterSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            aria-hidden="true"
          />
        )}

        {/* 懸停停格時的磨砂毛玻璃取景銘牌 */}
        <div
          className={`absolute inset-0 bg-[#030407]/35 transition-opacity duration-300 pointer-events-none flex items-center justify-center ${
            isHovering ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className={`optical-surface px-7 py-4 flex items-center gap-3.5 transition-transform duration-300 ${
              isHovering ? 'scale-100' : 'scale-95'
            }`}
          >
            <span className="w-2 h-2 bg-spectral-crimson" />
            <Play size={13} fill="currentColor" className="text-white" />
            <span className="mono text-xs text-white uppercase tracking-[0.26em] font-medium">
              Watch Full Showreel
            </span>
          </div>
        </div>

        {/* 中央 50% 停格與點擊熱區 */}
        {!isLoading && (
          <div
            data-testid="hero-hotspot"
            role="button"
            tabIndex={0}
            aria-label="Play Full Showreel Video"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onFocus={() => setIsHovering(true)}
            onBlur={() => setIsHovering(false)}
            onClick={() => onPlayVideo(REEL_VIDEO_ID)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onPlayVideo(REEL_VIDEO_ID);
              }
            }}
            className="absolute inset-0 m-auto w-1/2 h-1/2 z-20 cursor-pointer pointer-events-auto focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
          />
        )}
      </div>
    </div>
  );
}
