import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { Play, ArrowUpRight, ArrowRight } from './common/Icons';
import { categories, normalizeItem } from '../data/portfolio';
import { NAV_SCROLL_OFFSET } from '../constants/heroScroll';
import { APP_EVENTS } from '../constants/siteConfig';
import { instantScrollTo } from '../utils/scroll';
import { emilSpring } from '../utils/motion';
import { getSafeExternalUrl } from '../utils/url';
import { useOffscreenPause } from '../hooks/useOffscreenPause';
import { useMediaQuery } from '../hooks/useMediaQuery';
import RevealHeading from './common/RevealHeading';

const loadedImageCache = new Set();
const inflightImageCache = new Set();

// 模組載入時一次性預先正規化 97 筆靜態作品、安全外部連結、主推排序與行動端可見索引（渲染期 0 次 URL 解析與迴圈計數）
function buildOrderedCategoryItems(category) {
  const list = category.items.map((raw) => {
    const it = normalizeItem(raw);
    const isInlineVideo = Boolean(it.videoId && !it.isFacebook);
    const safeExternalUrl = !isInlineVideo && it.hasVideo ? getSafeExternalUrl(it.url) : null;
    const isExternalVideo = Boolean(safeExternalUrl);
    const isInteractive = isInlineVideo || isExternalVideo;
    return {
      ...it,
      isInlineVideo,
      safeExternalUrl,
      isExternalVideo,
      isInteractive,
    };
  });
  // 6 大分類皆具備唯一顯式 featured: true 主推作品（由 portfolio.test.js 單元測試強制把關）
  const featIdx = list.findIndex((it) => it.featured);
  const ordered =
    featIdx <= 0 ? list : [list[featIdx], ...list.slice(0, featIdx), ...list.slice(featIdx + 1)];

  let mobileCounter = 0;
  return ordered.map((item, idx) => ({
    ...item,
    mobileIdx: item.isInteractive ? mobileCounter++ : idx,
  }));
}

const ORDERED_ITEMS_BY_ID = new Map(
  categories.map((cat) => [cat.id, buildOrderedCategoryItems(cat)])
);

const SHUTTER_EASE = [0.25, 0.85, 0.32, 1];

/**
 * 計算網頁版（4 欄 Bento Z 字分鏡 -> 下方整排接續）與手機版（2 欄波浪）的快門顯影延遲
 */
function resolveCardShutterTiming({
  index,
  mobileIdx,
  isCompactViewport,
  isFoldTriggered,
  waveStartAt,
}) {
  const now = typeof performance !== 'undefined' ? performance.now() : 0;
  const elapsedSec = waveStartAt > 0 ? (now - waveStartAt) / 1000 : 99;

  if (isCompactViewport) {
    if (!isFoldTriggered) {
      // 手機首屏（前 5 張）：0 號滿版大圖 -> 第 1 排 (1,2) -> 第 2 排 (3,4) 嚴格依序接棒
      if (mobileIdx === 0) return { delay: 0.02, duration: 0.68 };
      if (mobileIdx <= 2) return { delay: 0.22 + (mobileIdx - 1) * 0.12, duration: 0.58 };
      return { delay: 0.48 + (mobileIdx - 3) * 0.12, duration: 0.58 };
    }
    const colInRow = Math.max(0, mobileIdx - 1) % 2;
    const extraRow = Math.floor(Math.max(0, mobileIdx - 5) / 2);
    // 若在超高視窗同屏初始曝光，強制排在首屏第 2 排之後；若為後續手動下滑則即時觸發
    const baseDelay = elapsedSec < 0.65 ? Math.max(0, 0.72 + extraRow * 0.22 - elapsedSec) : 0;
    return { delay: baseDelay + colInRow * 0.12, duration: 0.58 };
  }

  if (!isFoldTriggered) {
    // 桌機首屏（前 9 張）：
    // 1. 左側 2x2 主推大卡 (0)：0.02s
    // 2. 右側 4 張小卡 Z 字序 (1~4)：0.22s -> 0.36s -> 0.50s -> 0.64s
    // 3. 最下方一整排 4 張 (5~8)：嚴格等右邊 4 張跑出後，從 0.78s -> 0.91s -> 1.04s -> 1.17s 由左至右接力曝光
    if (index === 0) return { delay: 0.02, duration: 0.78 };
    if (index <= 4) return { delay: 0.22 + (index - 1) * 0.14, duration: 0.65 };
    return { delay: 0.78 + (index - 5) * 0.13, duration: 0.64 };
  }

  // 桌機第 4 列起（index >= 9）：若超高螢幕初始同屏可見則排在 index 5~8 之後；若為後續往下滑動則即時掀起波浪
  const colInRow = (index - 5) % 4;
  const extraRow = Math.floor((index - 9) / 4);
  const baseDelay = elapsedSec < 1.1 ? Math.max(0, 1.3 + extraRow * 0.36 - elapsedSec) : 0;
  return { delay: baseDelay + colInRow * 0.13, duration: 0.64 };
}

const GRID_VARIANTS = {
  enter: { opacity: 1 },
  center: { opacity: 1 },
  exit: ({ dir, mode }) =>
    mode === 'reveal'
      ? {
          opacity: 0,
          transition: { duration: 0.1, ease: 'easeOut' },
        }
      : {
          opacity: 0,
          x: dir * -12,
          transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
        },
};

const CARD_SHELL_VARIANTS = {
  hidden: { opacity: 0 },
  visible: (ctx) => {
    const { delay } = resolveCardShutterTiming(ctx);
    return {
      opacity: 1,
      transition: { duration: 0.26, delay, ease: 'easeOut' },
    };
  },
};

const SHUTTER_MEDIA_VARIANTS = {
  hidden: ({ dir }) => ({
    clipPath: dir < 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
    scale: 1.085,
    opacity: 0.3,
  }),
  visible: (ctx) => {
    const { delay, duration } = resolveCardShutterTiming(ctx);
    return {
      clipPath: 'inset(0% 0% 0% 0%)',
      scale: 1,
      opacity: 1,
      transition: {
        clipPath: { duration, delay, ease: SHUTTER_EASE },
        scale: { duration: duration * 1.15, delay, ease: SHUTTER_EASE },
        opacity: { duration: duration * 0.65, delay, ease: 'easeOut' },
      },
    };
  },
};

const CAPTION_VARIANTS = {
  hidden: { opacity: 0, y: 5 },
  visible: (ctx) => {
    const { delay, duration } = resolveCardShutterTiming(ctx);
    return {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32,
        delay: delay + duration * 0.28,
        ease: SHUTTER_EASE,
      },
      transitionEnd: {
        transform: 'none',
      },
    };
  },
};

const VFX_ASSET_VERSION = 'v5';

const getDisplayImageUrl = (item) => {
  if (!item?.bgImage) return null;
  return `${item.bgImage}?${VFX_ASSET_VERSION}`;
};

const BrandCard = React.memo(
  ({
    item,
    onPlayVideo,
    isFeatured,
    index,
    mobileIdx,
    direction,
    isCompactViewport,
    isStageEntered,
    waveOriginRef,
    prefersReduced,
  }) => {
    const { isInlineVideo, safeExternalUrl, isExternalVideo, isInteractive } = item;
    const bgImageUrl = getDisplayImageUrl(item);

    const CardElement = isInlineVideo ? m.button : isExternalVideo ? m.a : m.div;
    const [isImageLoaded, setIsImageLoaded] = useState(() =>
      bgImageUrl ? loadedImageCache.has(bgImageUrl) : false
    );
    const [hasImageError, setHasImageError] = useState(false);
    const [shutterSettled, setShutterSettled] = useState(prefersReduced);

    // 修復 Safari / WebKit 記憶體快取同步命中時 img.complete 已為 true 卻不補發 onLoad 的邊界問題
    const handleImgRef = React.useCallback(
      (imgEl) => {
        if (imgEl && imgEl.complete && imgEl.naturalWidth > 0 && bgImageUrl) {
          loadedImageCache.add(bgImageUrl);
          setIsImageLoaded(true);
        }
      },
      [bgImageUrl]
    );

    const handleClick = () => {
      if (isInlineVideo) {
        onPlayVideo(item.videoId, false, item.aspect, null, item.name);
      }
    };

    const ariaLabel = isInlineVideo
      ? `播放影片：${item.name}`
      : isExternalVideo
      ? `開啟外部影片：${item.name}`
      : undefined;

    // 首屏編排區（桌機前 9 張 = 1 大 4 小 + 正下方整排 4 張；手機可見前 5 張）嚴格依序接力曝光，杜絕下方排搶跑
    const effectiveIdx = isCompactViewport ? mobileIdx : index;
    const aboveFoldCount = isCompactViewport ? 5 : 9;
    const isFoldTriggered = effectiveIdx >= aboveFoldCount;
    const customMotion = {
      dir: direction,
      index,
      mobileIdx,
      isCompactViewport,
      isFoldTriggered,
      waveStartAt: waveOriginRef?.current?.time || 0,
    };

    const motionProps = prefersReduced
      ? {}
      : isFoldTriggered
      ? {
          initial: 'hidden',
          whileInView: 'visible',
          viewport: { once: true, amount: 0.16, margin: '0px 0px -32px 0px' },
          custom: customMotion,
          variants: CARD_SHELL_VARIANTS,
        }
      : {
          initial: 'hidden',
          animate: isStageEntered ? 'visible' : 'hidden',
          custom: customMotion,
          variants: CARD_SHELL_VARIANTS,
        };

    return (
      <CardElement
        type={isInlineVideo ? 'button' : undefined}
        href={isExternalVideo ? safeExternalUrl : undefined}
        target={isExternalVideo ? '_blank' : undefined}
        rel={isExternalVideo ? 'noopener noreferrer' : undefined}
        onClick={isInlineVideo ? handleClick : undefined}
        aria-label={ariaLabel}
        {...motionProps}
        className={`brand-card-spring group relative text-left w-full h-full flex-col overflow-hidden bg-transparent border transition-colors duration-300 ${
          isInteractive
            ? 'flex border-white/[0.14] hover:border-white/[0.28] cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson'
            : 'hidden md:flex border-white/[0.08] cursor-default'
        } ${isFeatured ? 'col-span-2 lg:row-span-2' : ''}`}
      >
        {/* 上方純淨 16:9 無壓字商業劇照銀幕（桌機主推卡透過 lg:flex-1 與右側雙排小卡像素級等高對齊） */}
        <div
          className={`relative w-full overflow-hidden bg-[#07090E] pointer-events-none ${
            isFeatured ? 'aspect-video lg:aspect-auto lg:flex-1 lg:min-h-[240px]' : 'aspect-video'
          }`}
        >
          {bgImageUrl && !hasImageError && (
            <m.div
              data-testid="card-shutter-viewport"
              custom={customMotion}
              variants={prefersReduced ? undefined : SHUTTER_MEDIA_VARIANTS}
              onAnimationComplete={() => setShutterSettled(true)}
              className={`w-full h-full ${
                prefersReduced || shutterSettled ? '' : 'will-change-[clip-path,transform,opacity]'
              } ${isFeatured ? 'lg:absolute lg:inset-0' : ''}`}
            >
              {!isImageLoaded && <div className="absolute inset-0 bg-zinc-950 animate-pulse" />}
              <img
                ref={handleImgRef}
                src={bgImageUrl}
                alt={item.name}
                width={isFeatured ? 1200 : 600}
                height={isFeatured ? 675 : 337}
                loading={isStageEntered && index < 5 ? 'eager' : 'lazy'}
                fetchpriority={isStageEntered && isFeatured ? 'high' : 'auto'}
                decoding="async"
                style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                onLoad={() => {
                  loadedImageCache.add(bgImageUrl);
                  setIsImageLoaded(true);
                }}
                onError={() => {
                  setHasImageError(true);
                  setIsImageLoaded(true);
                }}
                className={`w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out ${
                  isFeatured ? 'lg:absolute lg:inset-0' : ''
                } ${
                  isInteractive ? 'group-hover:scale-[1.04]' : ''
                } ${
                  isImageLoaded
                    ? isInteractive
                      ? 'opacity-92 group-hover:opacity-100'
                      : 'opacity-85'
                    : 'opacity-0'
                }`}
              />
            </m.div>
          )}

          {/* 劇照與底欄交界處的懸停光譜快門線（僅限有影片連結的卡片） */}
          {isInteractive && (
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-0 h-[1.5px] z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left spectral-bar-h"
            />
          )}
        </div>

        {/* 下方暗房微透文字欄（隨快門拉開微幅浮現） */}
        <m.div
          custom={customMotion}
          variants={prefersReduced ? undefined : CAPTION_VARIANTS}
          className={`w-full border-t border-white/[0.12] flex items-center justify-between pointer-events-none ${
            isFeatured ? 'px-3.5 sm:px-4 py-3 gap-3' : 'px-2.5 sm:px-4 py-2.5 sm:py-3 gap-1.5 sm:gap-3'
          } ${
            isInteractive
              ? 'bg-[#0B0F18]/88 group-hover:bg-[#121826]/95 transition-colors duration-300'
              : 'bg-[#090C14]/80'
          }`}
        >
          <span
            className={`truncate tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] transition-colors duration-200 ${
              isFeatured
                ? 'text-sm sm:text-[15px] font-semibold text-white'
                : isInteractive
                ? 'text-[11px] sm:text-[13px] font-medium text-zinc-100 group-hover:text-white'
                : 'text-[11px] sm:text-[13px] font-medium text-zinc-300'
            }`}
          >
            {item.name}
          </span>

          {isInlineVideo ? (
            <Play
              size={11}
              fill="currentColor"
              className="shrink-0 text-spectral-crimson opacity-85 group-hover:opacity-100 transition-opacity"
            />
          ) : isExternalVideo ? (
            <ArrowUpRight
              size={14}
              className="shrink-0 text-spectral-crimson transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          ) : null}
        </m.div>
      </CardElement>
    );
  }
);

BrandCard.displayName = 'BrandCard';

/**
 * 第四幕 VisualSynthesis：暗房調光台 1 大 4 小非對稱 Bento × 裱框分離透光分鏡格
 */
export default function VisualSynthesis({ onPlayVideo }) {
  const [{ activeTab, direction, transitionMode }, setTabState] = useState({
    activeTab: 'food',
    direction: 1,
    transitionMode: 'slide',
  });
  const [isDissolving, setIsDissolving] = useState(false);
  const isCompactViewport = useMediaQuery('(max-width: 1023px)');
  const sectionRef = useRef(null);
  const tabListRef = useRef(null);
  const tabPanelRef = useRef(null);
  const prefetchTimerRef = useRef(null);
  const cutTimersRef = useRef([]);
  const prefersReduced = useReducedMotion();
  const isStageEntered = useInView(tabPanelRef, {
    once: true,
    amount: 0.08,
    margin: '0px 0px -48px 0px',
  });
  const waveOriginRef = useRef({ key: '', time: 0 });
  if (isStageEntered && typeof performance !== 'undefined') {
    const waveKey = `entered-${activeTab}`;
    if (waveOriginRef.current.key !== waveKey) {
      waveOriginRef.current = { key: waveKey, time: performance.now() };
    }
  }
  useOffscreenPause(sectionRef);

  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
      cutTimersRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  const prefetchCategory = (catId, limit = 6) => {
    const ordered = ORDERED_ITEMS_BY_ID.get(catId);
    if (!ordered) return;
    const isMobileViewport =
      typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches;
    ordered
      .filter((item) => !isMobileViewport || item.isInteractive)
      .slice(0, limit)
      .forEach((normalized) => {
        const bgImage = getDisplayImageUrl(normalized);
        if (!bgImage || loadedImageCache.has(bgImage) || inflightImageCache.has(bgImage)) return;
        inflightImageCache.add(bgImage);
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          const finalize = () => {
            inflightImageCache.delete(bgImage);
            loadedImageCache.add(bgImage);
          };
          if (typeof img.decode === 'function') {
            img.decode().catch(() => {}).finally(finalize);
          } else {
            finalize();
          }
        };
        img.onerror = () => {
          inflightImageCache.delete(bgImage);
        };
        img.src = bgImage;
      });
  };

  const schedulePrefetch = (catId) => {
    if (catId === activeTab) return;
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
    }
    prefetchTimerRef.current = setTimeout(() => {
      prefetchCategory(catId, 6);
    }, 120);
  };

  const cancelPrefetch = () => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  };

  const handleTabChange = React.useCallback(
    (newTabId, forceDirection, mode = 'slide') => {
      cutTimersRef.current.forEach((id) => clearTimeout(id));
      cutTimersRef.current = [];
      setIsDissolving(false);
      setTabState((prev) => {
        if (newTabId === prev.activeTab) return prev;
        cancelPrefetch();
        const prevIdx = categories.findIndex((c) => c.id === prev.activeTab);
        const nextIdx = categories.findIndex((c) => c.id === newTabId);
        if (nextIdx === -1) return prev;
        const nextDir = forceDirection ?? (nextIdx >= prevIdx ? 1 : -1);
        return { activeTab: newTabId, direction: nextDir, transitionMode: mode };
      });
    },
    []
  );

  // 與行動版漢堡選單「作品案例」右側 6 大分類子面板雙向同步
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.portfolioTab = activeTab;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(APP_EVENTS.PORTFOLIO_CATEGORY_CHANGED, { detail: { categoryId: activeTab } })
      );
    }
  }, [activeTab]);

  useEffect(() => {
    const onSelectCategory = (e) => {
      const catId = e.detail?.categoryId;
      if (catId) handleTabChange(catId);
    };
    window.addEventListener(APP_EVENTS.SELECT_PORTFOLIO_CATEGORY, onSelectCategory);
    return () => window.removeEventListener(APP_EVENTS.SELECT_PORTFOLIO_CATEGORY, onSelectCategory);
  }, [handleTabChange]);

  // 保留背景光影的原地溶解瞬切：僅將前景作品區透明淡出（不蓋黑幕、100% 保留背後 WebGL 流動光影），趁透明幀 0ms 回頂後原地顯影新分類
  const handleNextCategoryDissolveCut = (targetCategoryId) => {
    cutTimersRef.current.forEach((id) => clearTimeout(id));
    cutTimersRef.current = [];
    prefetchCategory(targetCategoryId, 8);

    const jumpToTabsTop = () => {
      const el = tabListRef.current;
      if (!el) return;
      instantScrollTo(el, { offset: -(NAV_SCROLL_OFFSET + 12) });
    };

    if (prefersReduced) {
      handleTabChange(targetCategoryId, 1, 'reveal');
      jumpToTabsTop();
      return;
    }

    setIsDissolving(true);
    const swapTimer = setTimeout(() => {
      jumpToTabsTop();
      handleTabChange(targetCategoryId, 1, 'reveal');
      const revealTimer = setTimeout(() => {
        setIsDissolving(false);
      }, 24);
      cutTimersRef.current.push(revealTimer);
    }, 150);
    cutTimersRef.current.push(swapTimer);
  };

  const rawCategoryIdx = categories.findIndex((c) => c.id === activeTab);
  const currentCategoryIdx = rawCategoryIdx === -1 ? 0 : rawCategoryIdx;
  const currentCategory = categories[currentCategoryIdx];
  const nextCategory = categories[(currentCategoryIdx + 1) % categories.length];
  const orderedItems = ORDERED_ITEMS_BY_ID.get(currentCategory.id) || [];

  return (
    <section
      ref={sectionRef}
      id="vfx"
      className="w-full relative py-28 md:py-36 px-5 md:px-12 section-hairline"
    >
      <div className="max-w-7xl mx-auto">
        {/* 左對齊編輯標頭 */}
        <div className="mb-12 md:mb-16">
          <RevealHeading className="font-display text-[clamp(2rem,6.8vw,5.8rem)] whitespace-nowrap font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-title-white">
            ADVERTISING
          </RevealHeading>
        </div>

        {/* 磨砂毛玻璃剪接軌道分類切換列 */}
        <div
          id="vfx-tabs"
          ref={tabListRef}
          role="tablist"
          aria-label="作品專案分類"
          onPointerLeave={cancelPrefetch}
          className="optical-surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-10"
        >
          {categories.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const handleTabKeyDown = (e) => {
              let targetIdx = -1;
              if (e.key === 'ArrowRight') {
                targetIdx = (idx + 1) % categories.length;
              } else if (e.key === 'ArrowLeft') {
                targetIdx = (idx - 1 + categories.length) % categories.length;
              } else if (e.key === 'Home') {
                targetIdx = 0;
              } else if (e.key === 'End') {
                targetIdx = categories.length - 1;
              }
              if (targetIdx === -1) return;
              e.preventDefault();
              const next = categories[targetIdx];
              handleTabChange(next.id, e.key === 'ArrowLeft' || e.key === 'Home' ? -1 : 1);
              document.getElementById(`vfx-tab-${next.id}`)?.focus();
            };

            return (
              <button
                type="button"
                role="tab"
                id={`vfx-tab-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls="vfx-tabpanel"
                key={tab.id}
                onPointerEnter={() => schedulePrefetch(tab.id)}
                onFocus={() => schedulePrefetch(tab.id)}
                onBlur={cancelPrefetch}
                onKeyDown={handleTabKeyDown}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-4 flex items-center justify-center text-center border-b lg:border-b-0 border-r border-white/10 last:border-r-0 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <>
                    <m.div
                      layoutId="activeTabSurface"
                      className="absolute inset-0 bg-white/[0.07] pointer-events-none"
                      transition={emilSpring.indicator}
                    />
                    <m.div
                      layoutId="activeTabGlow"
                      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none spectral-indicator-h"
                      transition={emilSpring.indicator}
                    />
                  </>
                )}
                <span className="relative z-10 text-xs sm:text-sm font-medium tracking-widest">
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 透光間距非對稱 Bento 裱框牆（方向感知＋主推先行波浪分鏡動態；換類時僅前景透明淡出以完整保留背後光影） */}
        <div
          id="vfx-tabpanel"
          ref={tabPanelRef}
          role="tabpanel"
          aria-labelledby={`vfx-tab-${activeTab}`}
          data-dissolving={isDissolving ? 'true' : 'false'}
          className={`relative min-h-[320px] overflow-x-clip transition-opacity duration-150 ease-out ${
            isDissolving ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <AnimatePresence
            mode="wait"
            custom={{ dir: direction, mode: transitionMode }}
          >
            <m.div
              key={activeTab}
              custom={{ dir: direction, mode: transitionMode }}
              variants={GRID_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 grid-flow-dense"
            >
              {orderedItems.map((item, index) => (
                <BrandCard
                  key={`${activeTab}-${item.name}-${index}`}
                  item={item}
                  index={index}
                  mobileIdx={item.mobileIdx}
                  direction={direction}
                  isCompactViewport={isCompactViewport}
                  isStageEntered={isStageEntered}
                  waveOriginRef={waveOriginRef}
                  prefersReduced={Boolean(prefersReduced)}
                  isFeatured={index === 0}
                  onPlayVideo={onPlayVideo}
                />
              ))}
            </m.div>
          </AnimatePresence>
        </div>

        {/* 行動端作品牆底部極簡單鍵：採用與上方作品牆完全相同的雙欄網格與內距，1:1 對齊上方右欄寬高 */}
        <div
          data-testid="mobile-vfx-bottom-nav"
          className={`mt-5 grid grid-cols-2 gap-2.5 sm:gap-3.5 md:gap-4 lg:hidden transition-opacity duration-150 ease-out ${
            isDissolving ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <button
            type="button"
            data-testid="mobile-next-category-btn"
            aria-label={`切換至下一分類：${nextCategory.name}`}
            onPointerEnter={() => schedulePrefetch(nextCategory.id)}
            onFocus={() => schedulePrefetch(nextCategory.id)}
            onBlur={cancelPrefetch}
            onClick={() => handleNextCategoryDissolveCut(nextCategory.id)}
            className="col-start-2 optical-surface w-full px-2.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-3 text-left text-title-white hover:bg-white/[0.03] active:bg-white/[0.07] active:scale-[0.985] transition-[background-color,transform] duration-150 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-spectral-crimson group"
          >
            <span className="text-[11px] sm:text-[13px] font-medium text-zinc-100 group-hover:text-white tracking-wide truncate">
              {nextCategory.name}
            </span>
            <ArrowRight
              size={14}
              className="shrink-0 text-spectral-crimson transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
