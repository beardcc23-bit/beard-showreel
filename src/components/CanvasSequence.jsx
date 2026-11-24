import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import {
  HERO_SCRUB_END_PROGRESS,
  HERO_OUTRO_START_PROGRESS,
} from '../constants/heroScroll';
import { useIdleHeroAutoScroll } from '../hooks/useIdleHeroAutoScroll';

const TOTAL_SOURCE_FRAMES = 145;
const LAST_SOURCE_FRAME = TOTAL_SOURCE_FRAMES - 1;
const MAX_CONCURRENT_LOADS = 4;

/**
 * 依裝置抽樣影格索引（頭尾必保留 0 與 144），並排出「首尾 -> 均勻骨架 -> 細節補間」兩階段載入順序
 */
function buildSampledFrames(step) {
  const indices = [];
  for (let i = 0; i < TOTAL_SOURCE_FRAMES; i += step) {
    indices.push(i);
  }
  if (indices[indices.length - 1] !== LAST_SOURCE_FRAME) {
    indices.push(LAST_SOURCE_FRAME);
  }
  return indices;
}

function buildLoadOrder(count) {
  if (count <= 1) return [0];
  const order = [];
  const added = new Set();
  const push = (slot) => {
    if (slot >= 0 && slot < count && !added.has(slot)) {
      added.add(slot);
      order.push(slot);
    }
  };

  // 第 0 層：起點與終點必先載入
  push(0);
  push(count - 1);

  // 第 1 層：均勻骨架幀（約 12 格），進站瞬間可全段順滑刷動不斷格
  const skeletonStep = Math.max(1, Math.floor((count - 1) / 10));
  for (let i = skeletonStep; i < count - 1; i += skeletonStep) {
    push(i);
  }

  // 第 2 層：二分穿插補齊其餘細節影格
  const midStep = Math.max(1, Math.floor(skeletonStep / 2));
  for (let i = midStep; i < count - 1; i += midStep) {
    push(i);
  }
  for (let i = 1; i < count - 1; i += 1) {
    push(i);
  }
  return order;
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Hero 滾動驅動逐幀時間軸播放器（方案 B：滾動＋右側 3D 玻璃滑桿直拖控制前進／倒轉 ＋ 尾段微縮淡出銜接）
 * - 靜止與離屏時 0 rAF 休眠（0% 耗電），時間無關指數衰減確保 60Hz / 120Hz 手感一致
 * - 採兩階段抽幀預解碼載入（桌機 73 格／手機 49 格）與最近影格回退，杜絕黑格與倒刷卡頓
 */
export default function CanvasSequence({ containerRef, isModalOpen, onLoaded }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const sliderRef = useRef(null);
  const railRef = useRef(null);
  const progressBarRef = useRef(null);
  const progressThumbRef = useRef(null);
  const scrollHintRef = useRef(null);
  const scrollArrowRef = useRef(null);

  const framesRef = useRef([]);
  const sampledIndicesRef = useRef([]);
  const drawnSlotRef = useRef(-1);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  const resumeTickRef = useRef(null);
  const isDraggingRailRef = useRef(false);
  const isModalOpenRef = useRef(Boolean(isModalOpen));
  isModalOpenRef.current = Boolean(isModalOpen);

  const [isLoading, setIsLoading] = useState(true);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isTouchOnly] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(hover: none) and (pointer: coarse)').matches)
  );
  const [prefersReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  );

  const basePath = import.meta.env.BASE_URL;
  const folder = isMobile ? 'png-0-mobile' : 'png-0';
  const posterSrc = `${basePath}${folder}/png-0_00000000.webp?v=3`;

  // 尋找距離目標 slot 最近的已載入影格，確保網路載入期間刷動永不黑屏
  const findNearestLoadedSlot = (targetSlot) => {
    const frames = framesRef.current;
    if (frames[targetSlot]) return targetSlot;
    for (let dist = 1; dist < frames.length; dist += 1) {
      if (targetSlot - dist >= 0 && frames[targetSlot - dist]) return targetSlot - dist;
      if (targetSlot + dist < frames.length && frames[targetSlot + dist]) return targetSlot + dist;
    }
    return -1;
  };

  const drawSlot = (slot) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[slot];
    if (!canvas || !img) return false;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) return false;

    const w = img.naturalWidth || 1920;
    const h = img.naturalHeight || 1080;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawnSlotRef.current = slot;
    return true;
  };

  // 將正規化進度 [0, 1] 同步反映至 Canvas 影格、3D 玻璃滑桿光柱／游標與結尾微縮淡出轉場
  const applyProgress = (progress) => {
    const sampled = sampledIndicesRef.current;
    const scrubRatio = clamp01(progress / HERO_SCRUB_END_PROGRESS);
    const maxSlot = Math.max(0, sampled.length - 1);
    const targetSlot = Math.round(scrubRatio * maxSlot);
    const displayFrame = sampled[targetSlot] ?? 0;

    if (targetSlot !== drawnSlotRef.current) {
      const nearest = findNearestLoadedSlot(targetSlot);
      if (nearest !== -1 && nearest !== drawnSlotRef.current) {
        drawSlot(nearest);
      }
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleY(${scrubRatio.toFixed(4)})`;
    }

    if (progressThumbRef.current) {
      progressThumbRef.current.style.transform = `translate3d(0, ${(scrubRatio * 100).toFixed(3)}%, 0)`;
    }

    const frameNumber = String(displayFrame + 1);
    if (canvasRef.current) {
      canvasRef.current.dataset.frame = frameNumber;
    }
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', frameNumber);
    }

    // 全程保留「向下滑動推進」與滑桿底端箭頭引導，快刷到底定版前（73% -> 83%）同步淡出
    const hintOpacity = clamp01(1 - (progress - 0.73) / 0.1).toFixed(3);
    if (scrollHintRef.current) {
      scrollHintRef.current.style.opacity = hintOpacity;
    }
    if (scrollArrowRef.current) {
      scrollArrowRef.current.style.opacity = hintOpacity;
    }

    // 方案 B：尾段 86% -> 100% 銀幕微縮並柔和淡出，順暢銜接下方「個人介紹」
    if (stageRef.current) {
      if (prefersReduced) {
        stageRef.current.style.transform = '';
        stageRef.current.style.opacity = '1';
      } else {
        const outro = clamp01(
          (progress - HERO_OUTRO_START_PROGRESS) / (1 - HERO_OUTRO_START_PROGRESS)
        );
        const scale = 1 - outro * 0.055;
        const translateY = -outro * 22;
        const opacity = 1 - outro * 0.85;
        stageRef.current.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        stageRef.current.style.opacity = opacity.toFixed(3);
      }
    }
  };

  // 將指定刷幀比例 [0, 1] 轉換為實際頁面垂直捲動座標（支援滑桿直接點擊／拖曳／鍵盤微調）
  const scrollToScrubRatio = (ratio) => {
    const container = containerRef?.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollable = Math.max(0, rect.height - window.innerHeight);
    if (scrollable <= 0) return;
    const clampedRatio = clamp01(ratio);
    const heroTop = rect.top + window.scrollY;
    const targetY = Math.round(heroTop + scrollable * (clampedRatio * HERO_SCRUB_END_PROGRESS));
    const nextProgress = clampedRatio * HERO_SCRUB_END_PROGRESS;

    // 拖曳或點選滑桿時 0ms 即時同步影格與游標，消除雙重阻尼造成的橡皮筋延遲
    targetProgressRef.current = nextProgress;
    currentProgressRef.current = nextProgress;
    applyProgress(nextProgress);

    if (window.lenis) {
      window.lenis.scrollTo(targetY, { immediate: true });
    } else {
      window.scrollTo(0, targetY);
    }
  };

  const scrubFromClientY = (clientY) => {
    const rail = railRef.current || sliderRef.current;
    if (!rail) return;
    const railRect = rail.getBoundingClientRect();
    const ratio = clamp01((clientY - railRect.top) / Math.max(1, railRect.height));
    scrollToScrubRatio(ratio);
  };

  const handleRailPointerDown = (e) => {
    e.preventDefault();
    isDraggingRailRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    scrubFromClientY(e.clientY);
  };

  const handleRailPointerMove = (e) => {
    if (!isDraggingRailRef.current) return;
    scrubFromClientY(e.clientY);
  };

  const handleRailPointerUp = (e) => {
    if (!isDraggingRailRef.current) return;
    isDraggingRailRef.current = false;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const handleRailKeyDown = (e) => {
    const currentRatio = clamp01(currentProgressRef.current / HERO_SCRUB_END_PROGRESS);
    const step = 0.05;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio + step);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToScrubRatio(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToScrubRatio(1);
    }
  };

  // Canvas 資產防右鍵與防批次 dump 保護
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const blockMenu = (e) => e.preventDefault();
    canvas.addEventListener('contextmenu', blockMenu);
    try {
      canvas.toDataURL = () => 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      canvas.toBlob = () => null;
    } catch (_) {}
    return () => canvas.removeEventListener('contextmenu', blockMenu);
  }, []);

  // 兩階段交錯序列預解碼載入（桌機 73 格 / 手機 49 格；減少動態模式僅載首幀）
  useEffect(() => {
    let isCancelled = false;
    let unlocked = false;
    const folder = isMobile ? 'png-0-mobile' : 'png-0';
    const step = isMobile ? 3 : 2;
    const sampled = prefersReduced ? [0] : buildSampledFrames(step);
    sampledIndicesRef.current = sampled;
    framesRef.current = new Array(sampled.length).fill(null);
    drawnSlotRef.current = -1;

    const unlock = () => {
      if (isCancelled || unlocked) return;
      unlocked = true;
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };

    const fallbackTimer = setTimeout(unlock, 2500);
    const loadQueue = buildLoadOrder(sampled.length);
    let cursor = 0;
    let activeLoads = 0;

    const commitDecodedImage = (slot, img) => {
      if (isCancelled) return;
      framesRef.current[slot] = img;
      if (slot === 0) {
        drawSlot(0);
        unlock();
      } else {
        // 若訪客正好停在剛載完的這格附近，立刻補上精細影格
        const currentScrub = clamp01(currentProgressRef.current / HERO_SCRUB_END_PROGRESS);
        const desiredSlot = Math.round(currentScrub * Math.max(0, sampled.length - 1));
        if (slot === desiredSlot) {
          drawSlot(slot);
        }
      }
    };

    const pump = () => {
      while (!isCancelled && activeLoads < MAX_CONCURRENT_LOADS && cursor < loadQueue.length) {
        const slot = loadQueue[cursor];
        cursor += 1;
        const frameNum = sampled[slot];
        activeLoads += 1;

        const img = new Image();
        img.decoding = 'async';
        const done = () => {
          activeLoads -= 1;
          pump();
        };
        img.onload = () => {
          // 真實瀏覽器背景預解碼至圖層快取，消除快刷時主執行緒解碼掉幀
          if (typeof img.decode === 'function') {
            img
              .decode()
              .catch(() => {})
              .finally(() => {
                commitDecodedImage(slot, img);
                done();
              });
            return;
          }
          commitDecodedImage(slot, img);
          done();
        };
        img.onerror = () => {
          if (slot === 0) unlock();
          done();
        };
        img.src = `${basePath}${folder}/png-0_${String(frameNum).padStart(8, '0')}.webp?v=3`;
      }
    };

    pump();

    return () => {
      isCancelled = true;
      clearTimeout(fallbackTimer);
      framesRef.current.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
      framesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, prefersReduced, basePath]);

  // 滾動監聽 ＋ 時間無關指數衰減阻尼引擎（60Hz / 120Hz 一致手感，離屏與靜止 0 rAF 休眠）
  useEffect(() => {
    let lastFrameTime = 0;

    const computeScrollProgress = () => {
      const container = containerRef?.current;
      if (!container) return 0;
      const rect = container.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      return clamp01(-rect.top / scrollable);
    };

    const tick = (now) => {
      if (document.hidden || isModalOpenRef.current) {
        rafIdRef.current = null;
        lastFrameTime = 0;
        return;
      }

      const target = targetProgressRef.current;
      const diff = target - currentProgressRef.current;

      if (Math.abs(diff) < 0.0005 || prefersReduced) {
        currentProgressRef.current = target;
        applyProgress(target);
        rafIdRef.current = null;
        lastFrameTime = 0;
        return;
      }

      // 時間無關指數衰減：消除 60Hz 與 120Hz ProMotion 螢幕阻尼速率差異
      const ts = typeof now === 'number' ? now : performance.now();
      const dt = lastFrameTime ? Math.min(0.05, Math.max(0.001, (ts - lastFrameTime) / 1000)) : 1 / 60;
      lastFrameTime = ts;
      const lambda = isMobile ? 22 : 14;
      const lerpFactor = 1 - Math.exp(-lambda * dt);

      currentProgressRef.current += diff * lerpFactor;
      applyProgress(currentProgressRef.current);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    const scheduleTick = () => {
      if (rafIdRef.current === null && !document.hidden && !isModalOpenRef.current) {
        lastFrameTime = 0;
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    const resumeIfPending = () => {
      if (
        !document.hidden &&
        !isModalOpenRef.current &&
        Math.abs(targetProgressRef.current - currentProgressRef.current) >= 0.0005
      ) {
        scheduleTick();
      }
    };
    resumeTickRef.current = resumeIfPending;

    const handleScrollOrResize = () => {
      const next = computeScrollProgress();
      // Hero 已離屏且進度已收斂時早退：下方 97 筆作品捲動 0 次 rAF 喚醒、0 次 DOM 寫入
      if (
        Math.abs(next - targetProgressRef.current) < 0.0002 &&
        Math.abs(next - currentProgressRef.current) < 0.0002
      ) {
        return;
      }
      targetProgressRef.current = next;
      if (prefersReduced) {
        currentProgressRef.current = next;
        applyProgress(next);
        return;
      }
      scheduleTick();
    };

    // 初始同步一次（支援重新整理時捲動在頁面中段）
    const initial = computeScrollProgress();
    targetProgressRef.current = initial;
    currentProgressRef.current = initial;
    applyProgress(initial);

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    document.addEventListener('visibilitychange', resumeIfPending);

    return () => {
      resumeTickRef.current = null;
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('visibilitychange', resumeIfPending);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, isMobile, prefersReduced]);

  // 彈窗關閉後若仍有未收斂殘餘幀，立即補齊喚醒一次 rAF
  useEffect(() => {
    if (!isModalOpen) {
      resumeTickRef.current?.();
    }
  }, [isModalOpen]);

  // 僅於桌機（非手機／非純觸控）首次進站無操作 3.5 秒後溫柔自動推進至「個人介紹」
  useIdleHeroAutoScroll({
    enabled: !isLoading && !prefersReduced && !isMobile && !isTouchOnly,
    containerRef,
    isModalOpenRef,
  });

  return (
    <div ref={stageRef} className="w-full will-change-transform">
      {/* 桌機採左右 24px 對稱平衡網格維持銀幕絕對置中，右側掛載纖細可拖曳 3D 暗房透光厚玻璃棱柱滑桿 */}
      <div
        className={
          prefersReduced
            ? 'w-full'
            : 'grid grid-cols-[minmax(0,1fr)_18px] md:grid-cols-[24px_minmax(0,1fr)_24px] gap-2.5 md:gap-4 items-stretch'
        }
      >
        {/* 桌機左側隱形對稱平衡欄，防止銀幕因右側立體玻璃滑桿往左偏移 */}
        {!prefersReduced && <div className="hidden md:block" aria-hidden="true" />}

        <div
          data-testid="hero-screen"
          className="relative w-full aspect-[3/4] max-h-[72dvh] md:max-h-none md:aspect-video bg-[#030407] shadow-[0_32px_90px_rgba(0,0,0,0.85)] overflow-hidden"
        >
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

          {/* 逐幀滾動 Canvas 銀幕本體 */}
          <div
            onContextMenu={(e) => e.preventDefault()}
            className={`w-full h-full relative transition-[opacity,transform] duration-700 ease-out ${
              isLoading ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
            }`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block pointer-events-none object-cover"
              style={{
                backgroundImage: `url(${posterSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* 右側 3D 厚玻璃棱柱進度滑桿：與全站 .optical-surface 同源立體斜切斷面，支援直接點擊／拖曳／鍵盤刷幀 */}
        {!prefersReduced && (
          <div
            ref={sliderRef}
            data-testid="hero-vertical-progress"
            role="slider"
            tabIndex={0}
            aria-label="Showreel 逐幀進度滑桿"
            aria-orientation="vertical"
            aria-valuemin={1}
            aria-valuemax={TOTAL_SOURCE_FRAMES}
            aria-valuenow={1}
            onPointerDown={handleRailPointerDown}
            onPointerMove={handleRailPointerMove}
            onPointerUp={handleRailPointerUp}
            onPointerCancel={handleRailPointerUp}
            onKeyDown={handleRailKeyDown}
            className="group relative flex flex-col items-center self-stretch select-none pt-[2px] md:pt-[3px] pr-[4px] md:pr-[5px] cursor-ns-resize touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
          >
            {/* 3D 暗房透光厚玻璃本體（無 overflow-hidden 確保右側 5px 與頂部 2.5px 斜切面完整立體顯現） */}
            <div ref={railRef} className="hero-glass-rail relative flex-1 w-[4px] md:w-[5px]">
              {/* 內部導光光柱填充層：隨向下滾動由上往下注滿深海藍→洋紅→熾熱橘紅內光 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  ref={progressBarRef}
                  data-testid="hero-progress-fill"
                  style={{
                    transform: 'scaleY(0)',
                    background:
                      'linear-gradient(180deg, rgba(18, 118, 184, 0.34) 0%, rgba(208, 52, 108, 0.54) 55%, rgba(235, 74, 46, 0.92) 96%, rgba(255, 190, 165, 0.95) 100%)',
                  }}
                  className="absolute inset-0 origin-top will-change-transform"
                />
              </div>

              {/* 全高透明滑軌載體：純 GPU translate3d(%) 驅動橘紅外框半透明指針方塊套滑於 3D 玻璃柱上 */}
              <div
                ref={progressThumbRef}
                data-testid="hero-progress-thumb"
                style={{ transform: 'translate3d(0, 0%, 0)' }}
                className="absolute inset-0 z-20 pointer-events-none will-change-transform"
              >
                <span className="block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[12px] h-[12px] md:w-[14px] md:h-[14px] bg-[#EB4A2E]/35 border-[1.5px] border-spectral-crimson shadow-[0_0_12px_rgba(235,74,46,0.85),inset_0_0_6px_rgba(255,138,108,0.45)] transition-transform duration-150 group-hover:scale-110" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 銀幕下方資訊列：沿用完全相同的網格欄寬與右切面偏移補償，讓紅箭頭與 3D 玻璃正面中軸 100% 同軸置中 */}
      {!prefersReduced && (
        <div
          className="mt-3 grid grid-cols-[minmax(0,1fr)_18px] md:grid-cols-[24px_minmax(0,1fr)_24px] gap-2.5 md:gap-4 items-center select-none text-[11px] text-zinc-200/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]"
          aria-hidden="true"
        >
          {/* 桌機左側隱形對稱平衡欄 */}
          <div className="hidden md:block" />

          {/* 銀幕欄：提示文字靠右切齊銀幕右緣，極簡無影格數字干擾 */}
          <div className="flex items-center justify-end">
            <span
              ref={scrollHintRef}
              data-testid="hero-scroll-hint"
              className="tracking-[0.18em] text-zinc-200/90 transition-opacity duration-300"
            >
              向下滑動推進
            </span>
          </div>

          {/* 右側同軸欄：補償 3D 玻璃右切面寬度，使紅箭頭精準對齊 3D 玻璃正面與橘紅方塊中軸 */}
          <div
            ref={scrollArrowRef}
            className="flex items-center justify-center pr-[4px] md:pr-[5px] transition-opacity duration-300"
          >
            <ArrowDown size={13} className="text-spectral-crimson animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
