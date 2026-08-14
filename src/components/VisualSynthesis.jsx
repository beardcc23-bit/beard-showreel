import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { categories, normalizeItem } from '../data/portfolio';

const BrandCard = React.memo(React.forwardRef(({ item: rawItem, onPlayVideo }, ref) => {
  const item = normalizeItem(rawItem);
  const { hasVideo, bgImage: bgImageUrl } = item;
  const CardElement = hasVideo ? 'button' : 'div';
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const innerRef = React.useRef(null);
  const rafRef = React.useRef(null);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  React.useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerEnter = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const isLeft = (e.clientX - rect.left) < rect.width / 2;

    innerRef.current.classList.remove('bobble-left', 'bobble-right');
    void innerRef.current.offsetWidth; // 強制重繪重啟 keyframe
    innerRef.current.classList.add(isLeft ? 'bobble-left' : 'bobble-right');
  };

  const handleMouseMove = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const centerX = mouseX - rect.width / 2;
    const centerY = mouseY - rect.height / 2;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (innerRef.current) {
        innerRef.current.style.setProperty('--tilt-x', `${(-centerY / rect.height) * 14}deg`);
        innerRef.current.style.setProperty('--tilt-y', `${(centerX / rect.width) * 14}deg`);
        innerRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
        innerRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
      }
      rafRef.current = null;
    });
  };

  const handlePointerLeave = () => {
    if (innerRef.current) {
      innerRef.current.classList.remove('bobble-left', 'bobble-right');
      innerRef.current.style.setProperty('--tilt-x', '0deg');
      innerRef.current.style.setProperty('--tilt-y', '0deg');
    }
  };

  const handleClick = () => {
    if (!hasVideo) return;
    const targetUrl = item.url;
    if (item.videoId && !item.isFacebook) {
      onPlayVideo(item.videoId, false, item.aspect);
    } else if (targetUrl) {
      if (window.innerWidth < 768) {
        window.location.href = targetUrl;
      } else {
        const newWindow = window.open(targetUrl, '_blank');
        if (newWindow) newWindow.opener = null;
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <CardElement
      ref={setRefs}
      onPointerEnter={handlePointerEnter}
      onMouseMove={handleMouseMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={hasVideo ? 0 : -1}
      role={hasVideo ? "button" : "presentation"}
      aria-label={hasVideo ? `播放影片：${item.name}` : item.name}
      className={`prism-border brand-card-spring text-left w-full aspect-square md:aspect-video p-3 rounded-sm flex flex-col justify-between relative overflow-hidden group shadow-md focus:outline-none focus:ring-1 focus:ring-aurora-blue bg-[#121314] ${hasVideo
        ? 'border-white/15 hover:border-aurora-blue/85 cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] active:scale-[0.97]'
        : 'border-white/8 cursor-default'
        }`}
      style={{
        transformStyle: 'preserve-3d',
        '--border-color': hasVideo ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* 頂部極細黃金雷射光束條 */}
      {hasVideo && (
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-dawn-gold/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
      )}

      {/* 項目背景底圖 (僅限有 bgImage 的卡片) */}
      {bgImageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-[inherit] pointer-events-none bg-[#121314]">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-zinc-950 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-aurora-blue/5 filter blur-md" />
            </div>
          )}
          <img
            src={bgImageUrl}
            alt={`${item.name} background`}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${isImageLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'
              }`}
          />
          {/* 頂部輕量文字襯底 Scrim 漸層：保證文字清晰又保留畫面構圖 */}
          <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-black/70 via-black/20 to-transparent transition-opacity duration-300 z-[1]" />
          
          {/* 底部 Play 標籤細膩 Scrim 漸層：通透柔和，徹底融解底圖邊緣 */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 group-hover:via-black/40 transition-all duration-300 z-[1]" />
        </div>
      )}

      {/* 淡淡的金色漸層 hover 底色 (僅限有影片且無 bgImage) */}
      {hasVideo && !item.bgImage && (
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 pointer-events-none">
        <div
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}
          className={`text-[11px] sm:text-xs tracking-wide transition-colors duration-300 leading-tight line-clamp-2 ${hasVideo
            ? 'text-zinc-100 group-hover:text-white font-semibold'
            : 'text-zinc-200 font-semibold'
            }`}
        >
          {item.name}
        </div>
      </div>

      {hasVideo ? (
        <div
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
          className="relative z-10 mt-auto pt-1 flex items-center gap-1 text-[9px] text-aurora-blue font-black tracking-widest uppercase opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 pointer-events-none"
        >
          <Play size={8} fill="currentColor" className="play-triangle-pulse" /> Play
        </div>
      ) : null}
    </CardElement>
  );
}));

BrandCard.displayName = 'BrandCard';

export default function VisualSynthesis({ onPlayVideo }) {
  const [activeTab, setActiveTab] = useState('food');
  const [direction, setDirection] = useState(1);

  const handleTabChange = (newTabId) => {
    if (newTabId === activeTab) return;
    const oldIndex = categories.findIndex((c) => c.id === activeTab);
    const newIndex = categories.findIndex((c) => c.id === newTabId);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTabId);
  };

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  return (
    <section id="vfx" className="w-full relative py-24">
      {/* 滿版背景點綴網格 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        {/* 區段標頭 */}
        <div className="text-center mb-16 relative z-10">
          <h2 className="text-[clamp(2.5rem,11.5vw,9.5rem)] font-black tracking-[-0.04em] uppercase mb-6 glow-title text-white whitespace-nowrap leading-none w-full flex justify-between sm:justify-center items-center">
            <span>ADVER</span>
            <span className="text-aurora-blue">TISING</span>
          </h2>
          <p className="text-zinc-300 font-light max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
            近期參與的廣告專案。
          </p>
        </div>

        {/* 分類切換 Tab (手機版 2 欄整齊上下排網格 + layoutId 絲滑滑塊) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-center gap-2.5 lg:gap-4 max-w-5xl mx-auto px-2 md:px-4 mb-12 relative z-10 py-1">
          {categories.map((tab) => {
            const engMap = {
              food: 'FOOD & BEV',
              tech: 'TECH & TELECOM',
              vehicle: 'AUTO & TRAVEL',
              lifestyle: 'LIFESTYLE',
              beauty: 'BEAUTY & HEALTH',
              finance: 'FINANCE & INS'
            };
            const engName = engMap[tab.id] || tab.id.toUpperCase();
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`hud-btn relative px-3 lg:px-5 py-2.5 lg:py-3 flex flex-col items-center justify-center text-center w-full min-w-0 leading-none focus:outline-none focus:ring-0 focus-visible:outline-none ${isActive ? 'is-active text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {/* 絲滑液態金屬 Tab 高光滑塊 (無多餘二重內框) */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-sm bg-dawn-gold/[0.12] shadow-[0_0_20px_rgba(212,175,55,0.25)] pointer-events-none z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`hud-eng relative z-10 text-[6px] lg:text-[6px] mono tracking-widest uppercase mb-1 whitespace-nowrap ${isActive ? 'text-dawn-gold font-bold' : 'text-zinc-400'
                  }`}>{engName}</span>
                <span className="hud-zht relative z-10 text-[11px] lg:text-xs font-normal tracking-wider whitespace-nowrap">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* 品牌卡片 Grid - 手機版 3 欄 (grid-cols-3)、電腦版 5 欄 (md:grid-cols-5) */}
        <div className="relative z-10 min-h-[300px]" style={{ perspective: '1200px' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              initial={{
                opacity: 0,
                rotateY: direction * 22,
                filter: 'blur(12px)',
                scale: 0.93
              }}
              animate={{
                opacity: 1,
                rotateY: 0,
                filter: 'blur(0px)',
                scale: 1
              }}
              exit={{
                opacity: 0,
                rotateY: direction * -22,
                filter: 'blur(12px)',
                scale: 0.93
              }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{ transformStyle: 'preserve-3d', willChange: 'transform, filter, opacity' }}
              className="grid grid-cols-3 md:grid-cols-5 gap-2.5 md:gap-3.5"
            >
              {currentCategory.items.map((item, index) => (
                <motion.div
                  key={`${activeTab}-${item.name}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                >
                  <BrandCard
                    item={item}
                    onPlayVideo={onPlayVideo}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
