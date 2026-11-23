import React, { useState, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { categories, normalizeItem } from '../data/portfolio';
import { openSafeExternalUrl } from '../utils/url';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

const loadedImageCache = new Set();

const CATEGORY_ENG_MAP = {
  food: 'FOOD & BEV',
  tech: 'TECH & HOME',
  vehicle: 'MOBILITY',
  lifestyle: 'LIFESTYLE',
  beauty: 'BEAUTY & CARE',
  finance: 'FINANCE',
};

const BrandCard = React.memo(({ item: rawItem, onPlayVideo, isFeatured }) => {
  const item = React.useMemo(() => normalizeItem(rawItem), [rawItem]);
  const { hasVideo, bgImage: bgImageUrl } = item;
  const CardElement = hasVideo ? 'button' : 'div';
  const [isImageLoaded, setIsImageLoaded] = useState(() =>
    bgImageUrl ? loadedImageCache.has(bgImageUrl) : false
  );
  const [hasImageError, setHasImageError] = useState(false);

  const handleClick = () => {
    if (!hasVideo) return;
    if (item.videoId && !item.isFacebook) {
      onPlayVideo(item.videoId, false, item.aspect);
    } else {
      openSafeExternalUrl(item.url);
    }
  };

  return (
    <CardElement
      type={hasVideo ? 'button' : undefined}
      onClick={hasVideo ? handleClick : undefined}
      aria-label={hasVideo ? `播放影片：${item.name}` : item.name}
      className={`brand-card-spring group relative text-left w-full aspect-video p-4 sm:p-5 flex flex-col justify-between overflow-hidden bg-[#07090E] focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
        isFeatured ? 'md:col-span-2 md:row-span-2' : ''
      } ${hasVideo ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* 懸停底部 45° 光譜快門線 */}
      {hasVideo && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] z-20 pointer-events-none scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #EB4A2E 45%, #1276B8 100%)' }}
        />
      )}

      {/* 16:9 完整不裁切商業廣告底圖 */}
      {bgImageUrl && !hasImageError && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#07090E]">
          {!isImageLoaded && <div className="absolute inset-0 bg-zinc-950 animate-pulse" />}
          <img
            src={bgImageUrl}
            alt={`${item.name} background`}
            width="600"
            height="337"
            loading="lazy"
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
              hasVideo ? 'group-hover:scale-[1.05]' : ''
            } ${
              isImageLoaded
                ? hasVideo
                  ? 'opacity-85 group-hover:opacity-100'
                  : 'opacity-65'
                : 'opacity-0'
            }`}
          />
          <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/75 via-black/20 to-transparent z-[1]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-[1]" />
        </div>
      )}

      {/* 左上角主推標記或作品標題 */}
      <div className="relative z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}
          className={`tracking-wide leading-snug line-clamp-2 ${
            isFeatured ? 'text-sm sm:text-lg font-semibold text-white' : 'text-xs sm:text-[13px] font-medium text-zinc-100'
          }`}
        >
          {item.name}
        </div>
        {isFeatured && (
          <span className="hidden md:inline-block shrink-0 px-2 py-0.5 bg-[#05070B]/80 border border-white/20 mono text-[9px] uppercase tracking-[0.2em] text-dawn-gold">
            FEATURED
          </span>
        )}
      </div>

      {/* 左下角互動狀態 */}
      <div className="relative z-10 mt-auto pt-2 flex items-center justify-between pointer-events-none">
        {hasVideo ? (
          <span
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}
            className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.22em] text-zinc-200 group-hover:text-white transition-colors"
          >
            <Play size={9} fill="currentColor" className="text-spectral-crimson" />
            <span>Play</span>
          </span>
        ) : (
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
            Archive
          </span>
        )}
      </div>
    </CardElement>
  );
});

BrandCard.displayName = 'BrandCard';

/**
 * 第四幕 VisualSynthesis：主推雙倍銀幕 Bento × 1px 髮絲線暗房燈箱膠片牆
 * - 每個分類前 2 支有影片作品放大為 2x2 主推焦點，打破均質小格子疲勞感
 */
export default function VisualSynthesis({ onPlayVideo }) {
  const [activeTab, setActiveTab] = useState('food');
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);

  const prefetchCategory = (catId) => {
    const target = categories.find((c) => c.id === catId);
    if (!target) return;
    target.items.slice(0, 10).forEach((raw) => {
      const { bgImage } = normalizeItem(raw);
      if (!bgImage || loadedImageCache.has(bgImage)) return;
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => loadedImageCache.add(bgImage);
      img.src = bgImage;
    });
  };

  const handleTabChange = (newTabId) => {
    if (newTabId === activeTab) return;
    setActiveTab(newTabId);
  };

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  // 挑出該分類前 2 支有影片作品作為 2x2 視覺主推卡
  const featuredIndices = React.useMemo(() => {
    const indices = new Set();
    for (let i = 0; i < currentCategory.items.length && indices.size < 2; i += 1) {
      if (normalizeItem(currentCategory.items[i])?.hasVideo) {
        indices.add(i);
      }
    }
    return indices;
  }, [currentCategory]);

  return (
    <section
      ref={sectionRef}
      id="vfx"
      className="w-full relative py-28 md:py-36 px-5 md:px-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto">
        {/* 左對齊編輯標頭 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <div>
            <span className="mono text-xs uppercase tracking-[0.26em] text-spectral-crimson block mb-4">
              03 / PRODUCTION FILES
            </span>
            <h2 className="font-display text-[clamp(2.6rem,7.5vw,6.2rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-title-white">
              ADVERTISING
            </h2>
          </div>
          <p className="text-zinc-300 font-light text-sm md:text-base leading-relaxed md:text-right">
            近期參與的廣告專案。
          </p>
        </div>

        {/* 磨砂毛玻璃剪接軌道分類切換列 */}
        <div
          role="tablist"
          aria-label="作品專案分類"
          className="optical-surface grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-10"
        >
          {categories.map((tab) => {
            const engName = CATEGORY_ENG_MAP[tab.id] || tab.id.toUpperCase();
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                role="tab"
                id={`vfx-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="vfx-tabpanel"
                key={tab.id}
                onPointerEnter={() => prefetchCategory(tab.id)}
                onFocus={() => prefetchCategory(tab.id)}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-3.5 flex flex-col items-start justify-between text-left border-b lg:border-b-0 border-r border-white/10 last:border-r-0 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                  isActive ? 'bg-white/[0.06] text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <m.div
                    layoutId="activeTabGlow"
                    className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, #EB4A2E 0%, #D0346C 50%, #1276B8 100%)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  />
                )}
                <div className="w-full flex items-center justify-between gap-2 mb-1">
                  <span className={`mono text-[9px] tracking-[0.18em] uppercase ${isActive ? 'text-spectral-crimson' : 'text-zinc-500'}`}>
                    {engName}
                  </span>
                  <span className="mono text-[10px] tabular-nums text-zinc-500">
                    [{String(tab.items.length).padStart(2, '0')}]
                  </span>
                </div>
                <span className="text-xs sm:text-[13px] font-medium tracking-wider">
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* 1px 細線無圓角膠片燈箱牆（桌機 4 欄 Bento，手機 2 欄完整 16:9 構圖） */}
        <div
          id="vfx-tabpanel"
          role="tabpanel"
          aria-labelledby={`vfx-tab-${activeTab}`}
          className="relative min-h-[320px]"
        >
          <AnimatePresence mode="wait">
            <m.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/15 border border-white/15 grid-flow-dense"
            >
              {currentCategory.items.map((item, index) => (
                <BrandCard
                  key={`${activeTab}-${item.name}-${index}`}
                  item={item}
                  isFeatured={featuredIndices.has(index)}
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
