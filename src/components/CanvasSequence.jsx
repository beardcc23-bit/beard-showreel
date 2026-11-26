import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from './common/Icons';
import {
  HERO_SCRUB_END_PROGRESS,
  HERO_REDUCED_MOTION_FRAME,
  HERO_OUTRO_START_PROGRESS,
  HERO_EXIT_END_PROGRESS,
  getHeroStickyScrollable,
} from '../constants/heroScroll';
import {
  TOTAL_SOURCE_FRAMES,
  buildSampledFrames,
  buildLoadOrder,
  findNearestLoadedSlot,
} from '../utils/sequenceLoader';
import { useIdleHeroAutoScroll } from '../hooks/useIdleHeroAutoScroll';
import { useMediaQuery } from '../hooks/useMediaQuery';

const MAX_CONCURRENT_LOADS = 6;
const SEQUENCE_VERSION = 'v=11';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * Hero 滾動驅動逐幀時間軸播放器（方案 B：滾動＋右側 3D 玻璃滑桿直拖控制前進／倒轉 ＋ 尾段微縮淡出銜接）
 * - 靜止與離屏時 0 rAF 休眠（0% 耗電），時間無關指數衰減確保 60Hz / 120Hz 手感一致
 * - 採兩階段骨架交錯預解碼載入（桌機全 117 格原生幀／手機 59 格）與最近影格回退，杜絕黑格與跳格卡頓
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
  const lastFrameAttrRef = useRef('');
  const lastHintOpacityRef = useRef('');
  const lastRailKeyRef = useRef('');
  const lastStageKeyRef = useRef('');
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef(null);
  const resumeTickRef = useRef(null);
  const isDraggingRailRef = useRef(false);
  const isModalOpenRef = useRef(Boolean(isModalOpen));
  isModalOpenRef.current = Boolean(isModalOpen);

  const [isLoading, setIsLoading] = useState(true);
  const [hasDrawnFrame, setHasDrawnFrame] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const isTouchOnly = useMediaQuery('(hover: none) and (pointer: coarse)');
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  // 視窗縮放跨過 768px 斷點時自動切換桌機橫圖與手機直圖，避免縮放預覽時殘留錯版比例圖檔
  useEffect(() => {
    const handleViewportChange = () => {
      const nextMobile = window.innerWidth < 768;
      setIsMobile((prev) => (prev === nextMobile ? prev : nextMobile));
    };
    window.addEventListener('resize', handleViewportChange, { passive: true });
    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  const basePath = import.meta.env.BASE_URL;
  // 桌機與手機統一共讀第一代原生 1920×1080 大圖（零縮圖、零二次壓縮損耗；手機維持抽樣 59 格兼顧 Retina 銳利度與流量）
  const folder = 'png-0';
  const sequenceVersion = SEQUENCE_VERSION;
  const step = isMobile ? 2 : 1;
  const initialFrameIdx = prefersReduced ? HERO_REDUCED_MOTION_FRAME : 0;
  const posterSrc = `${basePath}${folder}/png-0_${String(initialFrameIdx).padStart(8, '0')}.webp?${sequenceVersion}`;

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
    setHasDrawnFrame((prev) => (prev ? prev : true));
    return true;
  };

  // 將進度 [0, HERO_EXIT_END_PROGRESS] 同步反映至 Canvas 影格、3D 玻璃滑桿與離場疊化轉場
  const applyProgress = (progress) => {
    const sampled = sampledIndicesRef.current;
    const railRatio = clamp01(progress / HERO_SCRUB_END_PROGRESS);
    // 全程單一等速線性耦合（0 ~ 1.26）：確保變透明與往上滑離場時，影格播放速率 1:1 緊貼滑動速度不降速卡頓
    const frameRatio = clamp01(progress / HERO_EXIT_END_PROGRESS);
    const maxSlot = Math.max(0, sampled.length - 1);
    const targetSlot = Math.round(frameRatio * maxSlot);
    const displayFrame = sampled[targetSlot] ?? 0;

    if (targetSlot !== drawnSlotRef.current) {
      const nearest = findNearestLoadedSlot(framesRef.current, targetSlot);
      if (nearest !== -1 && nearest !== drawnSlotRef.current) {
        drawSlot(nearest);
      }
    }

    const railKey = railRatio.toFixed(4);
    if (railKey !== lastRailKeyRef.current) {
      lastRailKeyRef.current = railKey;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleY(${railKey})`;
      }
      if (progressThumbRef.current) {
        progressThumbRef.current.style.transform = `translate3d(0, ${(railRatio * 100).toFixed(3)}%, 0)`;
      }
    }

    const frameNumber = String(displayFrame + 1);
    if (frameNumber !== lastFrameAttrRef.current) {
      lastFrameAttrRef.current = frameNumber;
      if (canvasRef.current) {
        canvasRef.current.dataset.frame = frameNumber;
      }
      if (sliderRef.current) {
        sliderRef.current.setAttribute('aria-valuenow', frameNumber);
        sliderRef.current.setAttribute(
          'aria-valuetext',
          `第 ${frameNumber} 格，共 ${TOTAL_SOURCE_FRAMES} 格`
        );
      }
    }

    // 全程保留「向下滑動推進」與滑桿底端箭頭引導，快刷到主定版前（73% -> 83%）同步淡出
    const hintOpacity = clamp01(1 - (progress - 0.73) / 0.1).toFixed(3);
    if (hintOpacity !== lastHintOpacityRef.current) {
      lastHintOpacityRef.current = hintOpacity;
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = hintOpacity;
      }
      if (scrollArrowRef.current) {
        scrollArrowRef.current.style.opacity = hintOpacity;
      }
    }

    // 尾段 87% -> 100% 桌機銀幕微縮半透明（手機版維持滿寬原尺寸不縮小），100% -> 126% 隨上滑離場柔和淡出並切換 visibility: hidden 剔除合成層
    if (stageRef.current) {
      if (prefersReduced) {
        if (lastStageKeyRef.current !== 'reduced') {
          lastStageKeyRef.current = 'reduced';
          stageRef.current.style.transform = '';
          stageRef.current.style.opacity = '1';
          stageRef.current.style.visibility = 'visible';
        }
      } else {
        const stickyOutro = clamp01(
          (progress - HERO_OUTRO_START_PROGRESS) / (1 - HERO_OUTRO_START_PROGRESS)
        );
        const exitOutro = clamp01((progress - 1) / (HERO_EXIT_END_PROGRESS - 1));
        const isIdleMainZone = stickyOutro === 0 && exitOutro === 0;
        const stageTransform =
          isIdleMainZone || isMobile
            ? ''
            : `translate3d(0, ${(-stickyOutro * 22).toFixed(2)}px, 0) scale(${(
                1 -
                stickyOutro * 0.055 -
                exitOutro * 0.025
              ).toFixed(4)})`;
        const opacityNum = isIdleMainZone
          ? 1
          : Math.max(0, 1 - stickyOutro * 0.62 - exitOutro * 0.38);
        const opacityStr = isIdleMainZone ? '1' : opacityNum.toFixed(3);
        const visibilityStr = opacityNum <= 0.002 ? 'hidden' : 'visible';
        const stageKey = `${stageTransform}|${opacityStr}|${visibilityStr}`;
        if (stageKey !== lastStageKeyRef.current) {
          lastStageKeyRef.current = stageKey;
          stageRef.current.style.transform = stageTransform;
          stageRef.current.style.opacity = opacityStr;
          stageRef.current.style.visibility = visibilityStr;
        }
      }
    }
  };

  // 將指定刷幀比例 [0, 1] 轉換為實際頁面垂直捲動座標（支援滑桿直接點擊／拖曳／鍵盤微調）
  const scrollToScrubRatio = (ratio) => {
    const container = containerRef?.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollable = getHeroStickyScrollable(container, rect);
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
    const stepSize = 0.05;
    const pageStep = 0.15;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio + stepSize);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio - stepSize);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio + pageStep);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      scrollToScrubRatio(currentRatio - pageStep);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToScrubRatio(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToScrubRatio(1);
    }
  };

  // Canvas 資產防右鍵／防批次 dump 保護 ＋ 視窗失焦自動解除滑桿拖曳鎖定（防止 Cmd+Tab 切回後黏連）
  useEffect(() => {
    const resetDrag = () => {
      isDraggingRailRef.current = false;
    };
    window.addEventListener('blur', resetDrag);

    const canvas = canvasRef.current;
    if (!canvas) {
      return () => window.removeEventListener('blur', resetDrag);
    }
    const blockMenu = (e) => e.preventDefault();
    canvas.addEventListener('contextmenu', blockMenu);
    try {
      canvas.toDataURL = () => 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
      canvas.toBlob = () => null;
    } catch (_) {}
    return () => {
      window.removeEventListener('blur', resetDrag);
      canvas.removeEventListener('contextmenu', blockMenu);
      ctxRef.current = null;
      canvas.width = 0;
      canvas.height = 0;
    };
  }, []);

  // 兩階段骨架交錯預解碼載入（桌機全 117 格原生 30fps / 手機 59 格減重；減少動態模式直接載入第 80 格清晰定版幀）
  useEffect(() => {
    let isCancelled = false;
    let unlocked = false;
    const sampled = prefersReduced ? [HERO_REDUCED_MOTION_FRAME] : buildSampledFrames(step);
    sampledIndicesRef.current = sampled;
    framesRef.current = new Array(sampled.length).fill(null);
    drawnSlotRef.current = -1;
    setHasDrawnFrame(false);

    const unlock = () => {
      if (isCancelled || unlocked) return;
      unlocked = true;
      setIsLoading(false);
      if (onLoaded) onLoaded();
    };

    const fallbackTimer = setTimeout(unlock, 2500);
    const holdSlot = sampled.findIndex((f) => f >= HERO_REDUCED_MOTION_FRAME);
    const loadQueue = buildLoadOrder(sampled.length, holdSlot);
    let cursor = 0;
    let activeLoads = 0;

    const commitDecodedImage = (slot, img) => {
      if (isCancelled) return;
      framesRef.current[slot] = img;
      const currentRatio = clamp01(currentProgressRef.current / HERO_EXIT_END_PROGRESS);
      const desiredSlot = Math.round(currentRatio * Math.max(0, sampled.length - 1));
      if (slot === 0) {
        const nearest = findNearestLoadedSlot(framesRef.current, desiredSlot);
        drawSlot(nearest !== -1 ? nearest : 0);
        unlock();
      } else if (
        slot === desiredSlot ||
        (drawnSlotRef.current !== -1 &&
          Math.abs(slot - desiredSlot) < Math.abs(drawnSlotRef.current - desiredSlot))
      ) {
        // 若訪客正停在此格（或視窗縮放重載時有更貼近當前捲動位置的骨架幀就緒），立即補繪消除閃跳
        drawSlot(slot);
      }
    };

    const pump = () => {
      while (!isCancelled && activeLoads < MAX_CONCURRENT_LOADS && cursor < loadQueue.length) {
        const queueRank = cursor;
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
          // 僅對第 0/1 層關鍵骨架幀與當前停留位置前後 ±14 格執行強制點陣預解碼，釋放數百 MB 未壓縮 RGBA 記憶體峰值
          const currentRatio = clamp01(currentProgressRef.current / HERO_EXIT_END_PROGRESS);
          const currentTargetSlot = Math.round(currentRatio * Math.max(0, sampled.length - 1));
          const shouldForceDecode =
            queueRank < 16 || Math.abs(slot - currentTargetSlot) <= 14;

          if (shouldForceDecode && typeof img.decode === 'function') {
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
        img.src = `${basePath}${folder}/png-0_${String(frameNum).padStart(8, '0')}.webp?${sequenceVersion}`;
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
  }, [isMobile, prefersReduced, basePath, folder, step]);

  // 滾動監聽 ＋ 幾何指標快取（消除滾動熱路徑同步 offsetHeight 重排）＋ 時間無關阻尼引擎
  useEffect(() => {
    let lastFrameTime = 0;
    let cachedHeroTop = 0;
    let cachedScrollable = 1;
    let hasDomElement = false;

    const refreshHeroMetrics = () => {
      const container = containerRef?.current;
      if (!container) return;
      hasDomElement = typeof Element !== 'undefined' && container instanceof Element;
      const rect = container.getBoundingClientRect();
      cachedHeroTop = rect.top + window.scrollY;
      cachedScrollable = Math.max(1, getHeroStickyScrollable(container, rect));
    };
    refreshHeroMetrics();

    const computeScrollProgress = () => {
      const container = containerRef?.current;
      if (!container) return 0;
      if (hasDomElement) {
        return Math.max(
          0,
          Math.min(HERO_EXIT_END_PROGRESS, (window.scrollY - cachedHeroTop) / cachedScrollable)
        );
      }
      const rect = container.getBoundingClientRect();
      const denom = Math.max(1, getHeroStickyScrollable(container, rect));
      return Math.max(0, Math.min(HERO_EXIT_END_PROGRESS, -rect.top / denom));
    };

    const tick = (now) => {
      if (document.hidden || isModalOpenRef.current) {
        rafIdRef.current = null;
        lastFrameTime = 0;
        return;
      }

      const target = targetProgressRef.current;
      const diff = target - currentProgressRef.current;

      // 若全域 Lenis 已對 scrollY 做平滑插值，直接 1:1 零延遲同步影格，消除雙重阻尼造成的上滑拖慢卡頓
      if (window.lenis || Math.abs(diff) < 0.0005 || prefersReduced) {
        currentProgressRef.current = target;
        applyProgress(target);
        rafIdRef.current = null;
        lastFrameTime = 0;
        return;
      }

      // 無 Lenis 環境（如純觸控原生捲動）：高響應時間無關追隨，緊貼手指滑動速度
      const ts = typeof now === 'number' ? now : performance.now();
      const dt = lastFrameTime ? Math.min(0.05, Math.max(0.001, (ts - lastFrameTime) / 1000)) : 1 / 60;
      lastFrameTime = ts;
      const lambda = 42;
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

    const handleResizeMetrics = () => {
      refreshHeroMetrics();
      handleScrollOrResize();
    };

    const containerEl = containerRef?.current;
    const heroResizeObserver =
      typeof ResizeObserver !== 'undefined' &&
      typeof Element !== 'undefined' &&
      containerEl instanceof Element
        ? new ResizeObserver(refreshHeroMetrics)
        : null;
    heroResizeObserver?.observe(containerEl);

    // 初始同步一次（支援重新整理時捲動在頁面中段）
    const initial = computeScrollProgress();
    targetProgressRef.current = initial;
    currentProgressRef.current = initial;
    applyProgress(initial);

    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleResizeMetrics, { passive: true });
    document.addEventListener('visibilitychange', resumeIfPending);

    return () => {
      resumeTickRef.current = null;
      heroResizeObserver?.disconnect();
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleResizeMetrics);
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
    <div ref={stageRef} className="relative w-full origin-top will-change-transform">
      {/* 手機版隱藏右側滑桿並貼齊螢幕滿寬吃滿橘框高度；桌機採左右 24px 對稱平衡網格維持銀幕置中，右側掛載 3D 玻璃棱柱滑桿 */}
      <div
        className={
          prefersReduced
            ? 'w-full'
            : 'w-full md:grid md:grid-cols-[24px_minmax(0,1fr)_24px] md:gap-4 items-stretch'
        }
      >
        {/* 桌機左側隱形對稱平衡欄，防止銀幕因右側立體玻璃滑桿往左偏移 */}
        {!prefersReduced && <div className="hidden md:block" aria-hidden="true" />}

        <div
          data-testid="hero-screen"
          className="relative w-full h-[calc(100dvh-4.75rem)] md:h-auto md:aspect-video flex items-center justify-center bg-transparent md:bg-[#030407] shadow-none md:shadow-[0_32px_90px_rgba(0,0,0,0.85)] overflow-hidden"
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

          {/* 逐幀滾動 Canvas 銀幕本體：手機版以 9:10 視窗精準對位原圖 x=464..1436 不切字範圍並加上下暗房柔邊；桌機維持 16:9 滿版 */}
          <div
            onContextMenu={(e) => e.preventDefault()}
            className={`relative max-md:w-[min(100%,calc((100dvh-4.75rem)*0.9))] max-md:aspect-[9/10] max-md:[mask-image:linear-gradient(to_bottom,transparent_0%,black_9%,black_90%,transparent_100%)] md:w-full md:h-full overflow-hidden transition-[opacity,transform] duration-700 ease-out ${
              isLoading ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
            }`}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block pointer-events-none object-cover max-md:object-[48.95%_50%] md:object-center"
              style={
                !hasDrawnFrame
                  ? {
                      backgroundImage: `url(${posterSrc})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: 'cover',
                      backgroundPosition: isMobile ? '48.95% 50%' : 'center',
                    }
                  : undefined
              }
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
            className="hidden md:flex group relative before:content-[''] before:absolute before:inset-y-0 before:-left-4 before:-right-2 flex-col items-center self-stretch select-none pt-[3px] pr-[5px] cursor-ns-resize touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
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

      {/* 銀幕下方資訊列：手機版懸浮壓於滿框銀幕底部內緣；桌機版沿用對稱網格讓紅箭頭與右側 3D 玻璃柱中軸同軸對齊 */}
      {!prefersReduced && (
        <div
          className="max-md:absolute max-md:inset-x-0 max-md:bottom-5 max-md:z-20 max-md:pointer-events-none md:mt-3 flex items-center justify-center gap-1.5 md:grid md:grid-cols-[24px_minmax(0,1fr)_24px] md:gap-4 select-none text-[11px] text-zinc-200/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]"
          aria-hidden="true"
        >
          {/* 桌機左側隱形對稱平衡欄 */}
          <div className="hidden md:block" />

          {/* 銀幕欄：手機置中、桌機靠右切齊銀幕右緣 */}
          <div className="flex items-center justify-center md:justify-end">
            <span
              ref={scrollHintRef}
              data-testid="hero-scroll-hint"
              className="tracking-[0.18em] text-zinc-200/90 transition-opacity duration-300"
            >
              向下滑動推進
            </span>
          </div>

          {/* 右側同軸欄：桌機補償 3D 玻璃右切面寬度對齊滑桿中軸，手機緊隨提示文字右側 */}
          <div
            ref={scrollArrowRef}
            className="flex items-center justify-center md:pr-[5px] transition-opacity duration-300"
          >
            <ArrowDown size={13} className="text-spectral-crimson animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
}
