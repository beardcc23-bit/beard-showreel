import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Play, ArrowUpRight } from 'lucide-react';
import { categories, normalizeItem } from '../data/portfolio';
import { openSafeExternalUrl } from '../utils/url';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

const loadedImageCache = new Set();

const GRID_VARIANTS = {
  enter: { opacity: 1 },
  center: { opacity: 1 },
  exit: (dir) => ({
    opacity: 0,
    x: dir * -16,
    transition: { duration: 0.12, ease: [0.4, 0, 1, 1] },
  }),
};

const CARD_VARIANTS = {
  enter: ({ dir, index }) => ({
    opacity: 0,
    x: dir * 20,
    scale: index === 0 ? 0.985 : 1,
  }),
  center: ({ index }) => ({
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: index === 0 ? 0.34 : 0.28,
      delay: Math.min(index, 8) * 0.022,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const getDisplayImageUrl = (item) => {
  if (!item?.bgImage) return null;
  return item.featured ? `${item.bgImage}?v=2` : item.bgImage;
};

const BrandCard = React.memo(({ item, onPlayVideo, isFeatured, index, direction }) => {
  const { hasVideo } = item;
  const bgImageUrl = getDisplayImageUrl(item);
  const isInlineVideo = Boolean(item.videoId && !item.isFacebook);
  const isExternalVideo = Boolean(hasVideo && !isInlineVideo);
  const isInteractive = isInlineVideo || isExternalVideo;

  const CardElement = isInteractive ? m.button : m.div;
  const [isImageLoaded, setIsImageLoaded] = useState(() =>
    bgImageUrl ? loadedImageCache.has(bgImageUrl) : false
  );
  const [hasImageError, setHasImageError] = useState(false);

  const handleClick = () => {
    if (isInlineVideo) {
      onPlayVideo(item.videoId, false, item.aspect);
    } else if (isExternalVideo) {
      openSafeExternalUrl(item.url);
    }
  };

  const ariaLabel = isInlineVideo
    ? `播放影片：${item.name}`
    : isExternalVideo
    ? `開啟外部影片：${item.name}`
    : undefined;

  return (
    <CardElement
      type={isInteractive ? 'button' : undefined}
      onClick={isInteractive ? handleClick : undefined}
      aria-label={ariaLabel}
      custom={{ dir: direction, index }}
      variants={CARD_VARIANTS}
      className={`brand-card-spring group relative text-left w-full h-full flex-col overflow-hidden bg-transparent border transition-colors duration-300 ${
        isInteractive
          ? 'flex border-white/[0.14] hover:border-white/[0.28] cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson'
          : 'hidden md:flex border-white/[0.08] cursor-default'
      } ${isFeatured ? 'lg:col-span-2 lg:row-span-2' : ''}`}
    >
      {/* 上方純淨 16:9 無壓字商業劇照銀幕（桌機主推卡透過 lg:flex-1 與右側雙排小卡像素級等高對齊） */}
      <div
        className={`relative w-full overflow-hidden bg-[#07090E] pointer-events-none ${
          isFeatured ? 'aspect-video lg:aspect-auto lg:flex-1 lg:min-h-[240px]' : 'aspect-video'
        }`}
      >
        {bgImageUrl && !hasImageError && (
          <>
            {!isImageLoaded && <div className="absolute inset-0 bg-zinc-950 animate-pulse" />}
            <img
              src={bgImageUrl}
              alt={item.name}
              width={isFeatured ? 1200 : 600}
              height={isFeatured ? 675 : 337}
              loading={isFeatured ? 'eager' : 'lazy'}
              decoding="async"
              onLoad={() => {
                loadedImageCache.add(bgImageUrl);
                setIsImageLoaded(true);
              }}
              onError={() => {
                setHasImageError(true);
                setIsImageLoaded(true);
              }}
              className={`w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out ${
                isInteractive ? 'group-hover:scale-[1.04]' : ''
              } ${
                isImageLoaded
                  ? isInteractive
                    ? 'opacity-92 group-hover:opacity-100'
                    : 'opacity-85'
                  : 'opacity-0'
              }`}
            />
          </>
        )}

        {/* 劇照與底欄交界處的懸停光譜快門線（僅限有影片連結的卡片） */}
        {isInteractive && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 right-0 h-[1.5px] z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #EB4A2E 45%, #1276B8 100%)' }}
          />
        )}
      </div>

      {/* 下方半透明透光磨砂文字欄（無黑底；無連結項目右側留白、無 icon、不觸發 hover 高亮） */}
      <div
        className={`w-full px-3.5 sm:px-4 py-3 border-t border-white/[0.12] backdrop-blur-md backdrop-saturate-[160%] flex items-center justify-between gap-3 pointer-events-none ${
          isInteractive
            ? 'bg-white/[0.06] group-hover:bg-white/[0.10] transition-colors duration-300'
            : 'bg-white/[0.04]'
        }`}
      >
        <span
          className={`truncate tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] transition-colors duration-200 ${
            isFeatured
              ? 'text-sm sm:text-[15px] font-semibold text-white'
              : isInteractive
              ? 'text-xs sm:text-[13px] font-medium text-zinc-100 group-hover:text-white'
              : 'text-xs sm:text-[13px] font-medium text-zinc-300'
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
      </div>
    </CardElement>
  );
});

BrandCard.displayName = 'BrandCard';

/**
 * 第四幕 VisualSynthesis：暗房調光台 1 大 4 小非對稱 Bento × 裱框分離透光分鏡格
 */
export default function VisualSynthesis({ onPlayVideo }) {
  const [{ activeTab, direction }, setTabState] = useState({ activeTab: 'food', direction: 1 });
  const sectionRef = useRef(null);
  const prefetchTimerRef = useRef(null);
  useOffscreenPause(sectionRef);

  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, []);

  const prefetchCategory = (catId, limit = 6) => {
    const target = categories.find((c) => c.id === catId);
    if (!target) return;
    const isMobileViewport = typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)').matches;
    const featured = target.items.find((it) => it.featured);
    const ordered = featured
      ? [featured, ...target.items.filter((it) => it !== featured)]
      : target.items;
    ordered
      .map((raw) => normalizeItem(raw))
      .filter((item) => !isMobileViewport || item.hasVideo)
      .slice(0, limit)
      .forEach((normalized) => {
        const bgImage = getDisplayImageUrl(normalized);
        if (!bgImage || loadedImageCache.has(bgImage)) return;
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => loadedImageCache.add(bgImage);
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

  const handleTabChange = (newTabId) => {
    if (newTabId === activeTab) return;
    cancelPrefetch();
    const prevIdx = categories.findIndex((c) => c.id === activeTab);
    const nextIdx = categories.findIndex((c) => c.id === newTabId);
    setTabState({ activeTab: newTabId, direction: nextIdx >= prevIdx ? 1 : -1 });
  };

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  // 優先將指定 featured 主推作品置於左上角第一位，構成 1 大帶 4 小黃金比例
  const orderedItems = React.useMemo(() => {
    const list = currentCategory.items.map((raw) => normalizeItem(raw));
    let featIdx = list.findIndex((it) => it.featured);
    if (featIdx === -1) {
      featIdx = list.findIndex(
        (it) => it.videoId && !it.isFacebook && it.aspect !== 'portrait' && it.aspect !== 'square'
      );
    }
    if (featIdx <= 0) return list;
    return [list[featIdx], ...list.slice(0, featIdx), ...list.slice(featIdx + 1)];
  }, [currentCategory]);

  return (
    <section
      ref={sectionRef}
      id="vfx"
      className="w-full relative py-28 md:py-36 px-5 md:px-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto">
        {/* 左對齊編輯標頭 */}
        <div className="mb-12 md:mb-16">
          <h2 className="font-display text-[clamp(2.6rem,7.5vw,6.2rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-title-white">
            ADVERTISING
          </h2>
        </div>

        {/* 磨砂毛玻璃剪接軌道分類切換列 */}
        <div
          role="tablist"
          aria-label="作品專案分類"
          onPointerLeave={cancelPrefetch}
          className="optical-surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-10"
        >
          {categories.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                role="tab"
                id={`vfx-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="vfx-tabpanel"
                key={tab.id}
                onPointerEnter={() => schedulePrefetch(tab.id)}
                onFocus={() => schedulePrefetch(tab.id)}
                onBlur={cancelPrefetch}
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
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                    <m.div
                      layoutId="activeTabGlow"
                      className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
                      style={{ background: 'linear-gradient(90deg, #EB4A2E 0%, #D0346C 50%, #1276B8 100%)' }}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
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

        {/* 透光間距非對稱 Bento 裱框牆（方向感知＋主推先行波浪分鏡動態） */}
        <div
          id="vfx-tabpanel"
          role="tabpanel"
          aria-labelledby={`vfx-tab-${activeTab}`}
          className="relative min-h-[320px] overflow-x-clip"
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <m.div
              key={activeTab}
              custom={direction}
              variants={GRID_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4 grid-flow-dense"
            >
              {orderedItems.map((item, index) => (
                <BrandCard
                  key={`${activeTab}-${item.name}-${index}`}
                  item={item}
                  index={index}
                  direction={direction}
                  isFeatured={index === 0}
                  onPlayVideo={onPlayVideo}
                />
              ))}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
