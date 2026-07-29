import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { categories } from '../data/portfolio';

const BrandCard = React.memo(React.forwardRef(({ item, onPlayVideo }, ref) => {
  const hasVideo = !!item.videoId || !!item.url;
  const CardElement = hasVideo ? motion.button : motion.div;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const innerRef = React.useRef(null);

  // Motion values 用於物理 Bobble Hover 彈跳動效
  const x = motion.useMotionValue(0);
  const y = motion.useMotionValue(0);
  const rotate = motion.useMotionValue(0);
  const scale = motion.useMotionValue(1);

  const lastPosRef = React.useRef({ x: 0, y: 0, time: 0 });
  const isAnimatingRef = React.useRef(false);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const triggerBobble = (vx, vy) => {
    const speed = Math.hypot(vx, vy);
    // 根據指針移動速度動態計算彈跳強度 (夾值 0.8 ~ 2.5)
    const intensity = Math.min(Math.max(speed * 0.8, 0.8), 2.5);
    
    // 計算彈跳方向
    const dirX = vx !== 0 ? Math.sign(vx) : (Math.random() > 0.5 ? 1 : -1);
    const dirY = vy !== 0 ? Math.sign(vy) : -1;

    const moveX = dirX * 8 * intensity;
    const moveY = dirY * 8 * intensity;
    const rotDeg = dirX * 3.5 * intensity;
    const scaleUp = 1 + 0.04 * intensity;

    // 使用物理彈簧曲線 (Spring Physics) 進行彈性跳動與恢復
    motion.animate(x, [0, moveX, 0], { type: "spring", stiffness: 450, damping: 12 });
    motion.animate(y, [0, moveY, 0], { type: "spring", stiffness: 450, damping: 12 });
    motion.animate(rotate, [0, rotDeg, 0], { type: "spring", stiffness: 400, damping: 10 });
    motion.animate(scale, [1, scaleUp, 1], { type: "spring", stiffness: 500, damping: 14 });
  };

  const handlePointerEnter = (e) => {
    lastPosRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    // 初次移入時以預設感應強度觸發 Bobble
    triggerBobble(1.2, -1.2);
  };

  const rafRef = React.useRef(null);
  const handleMouseMove = (e) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 計算滑鼠移動速度
    const now = performance.now();
    const dt = (now - lastPosRef.current.time) / 1000;
    if (dt > 0.01) {
      const vx = (e.clientX - lastPosRef.current.x) / (dt * 1000);
      const vy = (e.clientY - lastPosRef.current.y) / (dt * 1000);
      
      // 如果移動速度快速且不在連續動畫衝擊中，觸發動態 Bobble
      if (Math.hypot(vx, vy) > 1.5 && !isAnimatingRef.current) {
        isAnimatingRef.current = true;
        triggerBobble(vx, vy);
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 300);
      }
      lastPosRef.current = { x: e.clientX, y: e.clientY, time: now };
    }

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (innerRef.current) {
        innerRef.current.style.setProperty('--mouse-x', `${mouseX}px`);
        innerRef.current.style.setProperty('--mouse-y', `${mouseY}px`);
      }
      rafRef.current = null;
    });
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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
        rotate,
        scale,
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

        {/* 分類切換 Tab */}
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
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`hud-btn px-1.5 lg:px-5 py-2.5 lg:py-3 flex flex-col items-center justify-center text-center min-w-0 leading-none ${activeTab === tab.id ? 'is-active' : ''}`}
              >
                <span className={`hud-eng text-[5px] lg:text-[6px] mono tracking-widest uppercase mb-1 whitespace-nowrap ${activeTab === tab.id ? '' : 'text-zinc-500'
                  }`}>{engName}</span>
                <span className="hud-zht text-[11px] lg:text-xs font-normal tracking-wider whitespace-nowrap">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* 品牌卡片 Grid - 6 個類別各自靜態預渲染，透過 display 與 CSS 動畫切換，達到 0 毫秒 JS 阻塞 */}
        <div className="relative z-10 min-h-[300px]">
          {categories.map((category) => {
            const isActive = category.id === activeTab;
            return (
              <div
                key={category.id}
                className={`grid grid-cols-3 md:grid-cols-5 gap-3 ${isActive ? 'tab-content-active' : 'tab-content-hidden'
                  }`}
              >
                {category.items.map((item, index) => (
                  <BrandCard
                    key={`${category.id}-${item.name}-${index}`}
                    item={item}
                    onPlayVideo={onPlayVideo}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
