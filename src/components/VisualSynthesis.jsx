import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { categories } from '../data/portfolio';

const BrandCard = React.memo(React.forwardRef(({ item, onPlayVideo }, ref) => {
  const hasVideo = !!item.videoId || !!item.url;
  const CardElement = hasVideo ? motion.button : motion.div;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const innerRef = React.useRef(null);

  // 物理 Motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRotX = useMotionValue(0);
  const rawRotY = useMotionValue(0);
  const rawRotZ = useMotionValue(0);
  const rawScale = useMotionValue(1);

  // 高感官 Q 彈 Spring 物理參數 (stiffness: 400, damping: 14)
  const springConfig = { stiffness: 400, damping: 14, mass: 0.5 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);
  const rotateX = useSpring(rawRotX, springConfig);
  const rotateY = useSpring(rawRotY, springConfig);
  const rotateZ = useSpring(rawRotZ, springConfig);
  const scale = useSpring(rawScale, springConfig);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handlePointerEnter = (e) => {
    // 手機/觸控螢幕 (hover: none) 阻斷 Bobble 滑動，避免頁面滾動時干擾視覺與效能
    if (window.matchMedia('(hover: none)').matches) return;

    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const enterX = e.clientX - rect.left - rect.width / 2;
    const dirX = enterX >= 0 ? 1 : -1;

    // 移入時激發強烈的 Q 彈 Bobble 果動
    rawY.set(-16);
    rawRotZ.set(dirX * 7);
    rawScale.set(1.09);
    rawRotX.set(-10);
    rawRotY.set(dirX * 10);

    // 100ms 後收斂至 Hover 跟隨態
    setTimeout(() => {
      rawY.set(-6);
      rawRotZ.set(0);
      rawScale.set(1.04);
    }, 100);
  };

  const rafRef = React.useRef(null);
  const handleMouseMove = (e) => {
    // 觸控螢幕降級阻斷
    if (window.matchMedia('(hover: none)').matches) return;

    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const centerX = mouseX - rect.width / 2;
    const centerY = mouseY - rect.height / 2;

    // 指針在卡片內移動時帶動 3D 懸浮與微妙 Tilt
    rawRotX.set((-centerY / rect.height) * 18);
    rawRotY.set((centerX / rect.width) * 18);
    rawX.set((centerX / rect.width) * 12);
    rawY.set((centerY / rect.height) * 10 - 6);

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (innerRef.current) {
        innerRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
        innerRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
      }
      rafRef.current = null;
    });
  };

  const handlePointerLeave = () => {
    if (window.matchMedia('(hover: none)').matches) return;
    // 離開卡片時柔和彈回靜止原位
    rawX.set(0);
    rawY.set(0);
    rawRotX.set(0);
    rawRotY.set(0);
    rawRotZ.set(0);
    rawScale.set(1);
  };

  const handleClick = () => {
    if (!hasVideo) return;
    if (item.isFacebook && item.url) {
      if (window.innerWidth < 768) {
        window.location.href = item.url;
      } else {
        const newWindow = window.open(item.url, '_blank');
        if (newWindow) newWindow.opener = null;
      }
    } else if (item.videoId) {
      onPlayVideo(item.videoId, false, item.aspect);
    } else if (item.url) {
      if (window.innerWidth < 768) {
        window.location.href = item.url;
      } else {
        const newWindow = window.open(item.url, '_blank');
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
      whileTap={{ scale: 0.96 }}
      tabIndex={hasVideo ? 0 : -1}
      role={hasVideo ? "button" : "presentation"}
      aria-label={hasVideo ? `播放影片：${item.name}` : item.name}
      className={`prism-border text-left w-full p-3.5 rounded-sm flex flex-col justify-between transition-colors duration-300 relative overflow-hidden group min-h-[95px] backdrop-blur-none md:backdrop-blur-[8px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)] focus:outline-none focus:ring-1 focus:ring-aurora-blue ${hasVideo
        ? 'bg-white/[0.02] border-white/15 hover:border-aurora-blue/85 cursor-pointer hover:shadow-[0_0_25px_rgba(212,175,55,0.25)]'
        : 'bg-white/[0.01] border-white/8 cursor-default'
        }`}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        rotateZ,
        scale,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        '--border-color': hasVideo ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* 項目背景底圖 (僅限有 bgImage 的卡片) */}
      {item.bgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-sm pointer-events-none">
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-zinc-950 animate-pulse flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-aurora-blue/5 filter blur-md" />
            </div>
          )}
          <img
            src={item.bgImage}
            alt={`${item.name} background`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 scale-105 group-hover:scale-100 ${isImageLoaded ? 'opacity-80 group-hover:opacity-100' : 'opacity-0'
              }`}
          />
          {/* 全區域暗化遮罩與玻璃模糊效果：手機版關閉模糊以確保滾動效能 */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-none md:backdrop-blur-[1px] group-hover:backdrop-blur-none group-hover:bg-black/5 transition-all duration-300" />
          {/* 漸層遮罩：滑鼠移入時變淡，釋放圖片色彩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25 group-hover:from-black/85 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />
        </div>
      )}

      {/* 淡淡的金色漸層 hover 底色 (僅限有影片且無 bgImage) */}
      {hasVideo && !item.bgImage && (
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10 pointer-events-none">
        <div
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.3)' }}
          className={`text-xs tracking-wide transition-colors duration-300 leading-snug ${hasVideo
            ? 'text-zinc-100 group-hover:text-white font-semibold'
            : 'text-zinc-200 font-semibold'
            }`}
        >
          {item.name}
        </div>
      </div>

      {hasVideo ? (
        <div
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
          className="relative z-10 mt-2.5 flex items-center gap-1 text-[9px] text-aurora-blue font-black tracking-widest uppercase opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 pointer-events-none"
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
          <h2 className="text-[48px] md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title text-white">
            ADVER<span className="text-aurora-blue">TISING</span>
          </h2>
          <p className="text-zinc-300 font-light max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
            近期參與的廣告專案。
          </p>
        </div>

        {/* 分類切換 Tab (帶有 layoutId 絲滑流光滑塊) */}
        <div className="grid grid-cols-3 gap-2 max-w-xl lg:max-w-5xl mx-auto px-4 lg:flex lg:flex-row lg:flex-nowrap lg:justify-center lg:gap-4 mb-12 relative z-10">
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
                className={`hud-btn relative px-1.5 lg:px-5 py-2.5 lg:py-3 flex flex-col items-center justify-center text-center min-w-0 leading-none focus:outline-none focus:ring-0 focus-visible:outline-none ${isActive ? 'is-active text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                {/* 絲滑液態金屬 Tab 高光滑塊 (layoutId 跨元件平滑動畫 - 純金黃光底色，無白框) */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-sm bg-aurora-blue/[0.08] shadow-[0_0_20px_rgba(212,175,55,0.35)] pointer-events-none z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`hud-eng relative z-10 text-[5px] lg:text-[6px] mono tracking-widest uppercase mb-1 whitespace-nowrap ${isActive ? 'text-aurora-blue font-bold' : 'text-zinc-500'
                  }`}>{engName}</span>
                <span className="hud-zht relative z-10 text-[11px] lg:text-xs font-normal tracking-wider whitespace-nowrap">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* 品牌卡片 Grid - 方案三：加長景深失焦 (0.68s Cinematic Depth Blur) 與 3D 立體翻轉 */}
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
              className="grid grid-cols-3 md:grid-cols-5 gap-3"
            >
              {currentCategory.items.map((item, index) => (
                <BrandCard
                  key={`${activeTab}-${item.name}-${index}`}
                  item={item}
                  onPlayVideo={onPlayVideo}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
