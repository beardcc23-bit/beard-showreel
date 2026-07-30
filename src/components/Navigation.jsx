import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: '個人介紹', eng: 'CREATIVE PROFILE', href: '#introduction' },
    { name: '視覺思考', eng: 'VISUAL LOGIC', href: '#about' },
    { name: '作品案例', eng: 'PRODUCTION FILES', href: '#vfx' },
  ];

  const handleScroll = (e, href) => {
    if (e) e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) return;
    
    setIsOpen(false); // 關閉行動版選單

    if (window.lenis) {
      window.lenis.scrollTo(element, { offset: -85 });
      return;
    }

    const targetPosition = element.getBoundingClientRect().top + window.scrollY - 85;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 400; // 400ms 高速直達
    let startTime = null;

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const easedPercent = easeInOutCubic(percent);
      window.scrollTo(0, startPosition + distance * easedPercent);
      if (progress < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (window.lenis) {
      window.lenis.scrollTo(0);
      return;
    }
    const startPosition = window.scrollY;
    const distance = -startPosition;
    const duration = 400; // 400ms 高速直達頂端
    let startTime = null;

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const animateScroll = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const easedPercent = easeInOutCubic(percent);
      window.scrollTo(0, startPosition + distance * easedPercent);
      if (progress < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center backdrop-blur-xl border-b border-border bg-bg-core/40 transition-colors duration-500">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={toggleMenu}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center text-white-or-black hover:text-aurora-blue transition focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-sm"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={scrollToTop}
            className="text-xl font-black tracking-tighter font-space-mono text-white-or-black hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue cursor-pointer text-left rounded-sm"
            aria-label="Beard Showreel - Scroll to top"
          >
            Beard<span className="text-aurora-blue"> Showreel</span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center space-x-12">
          <div className="flex space-x-12">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="hover:text-aurora-blue transition duration-300 relative group flex items-center focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-sm outline-none"
              >
                <span className="text-xs font-normal tracking-wider">{item.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-aurora-blue transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <a
            href="#contact"
            onClick={(e) => handleScroll(e, '#contact')}
            className="hud-btn is-active px-5 py-3 flex items-center justify-center text-center leading-none focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-sm outline-none"
          >
            <span className="hud-zht text-xs font-normal uppercase tracking-widest">建立聯繫</span>
          </a>
        </div>
      </nav>

      {/* 行動裝置側邊選單 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/10 backdrop-blur-md z-[999] md:hidden"
            />
            {/* 側邊選單主體 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[80%] max-w-[320px] h-screen bg-bg-core/95 backdrop-blur-2xl z-[1000] md:hidden flex flex-col justify-center p-8 gap-10 border-r border-border"
            >
              <button
                onClick={toggleMenu}
                className="absolute top-6 right-6 text-white-or-black hover:text-aurora-blue transition"
                aria-label="Close Menu"
              >
                <X size={28} />
              </button>

              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleScroll(e, item.href)}
                  className="text-base font-normal uppercase tracking-tighter mono text-white-or-black hover:text-aurora-blue transition duration-300 flex flex-col"
                >
                  <span className="text-[9px] text-zinc-400 font-medium tracking-widest mono mb-1">{item.eng}</span>
                  {item.name}
                </a>
              ))}

              <a
                href="#contact"
                onClick={(e) => handleScroll(e, '#contact')}
                className="hud-btn is-active w-fit px-6 py-3.5 flex flex-col items-start justify-center leading-none mt-2 -ml-6"
              >
                <span className="hud-eng text-[9px] opacity-70 tracking-widest mono mb-1.5 uppercase">Establish Connection</span>
                <span className="hud-zht text-base font-normal uppercase tracking-widest">建立聯繫</span>
              </a>

              {/* 手機水平儀/姿態感應授權按鈕 (100% 喚起 iOS 系統彈窗) */}
              <button
                type="button"
                onClick={() => {
                  if (window.requestGyroPermission) {
                    window.requestGyroPermission();
                  }
                }}
                className="mt-4 px-4 py-3 rounded-sm border border-aurora-blue/40 bg-aurora-blue/10 text-left flex flex-col gap-1 active:scale-95 transition-all cursor-pointer"
              >
                <span className="mono text-[8px] text-aurora-blue tracking-widest uppercase font-bold">// TILT SENSOR CONTROL</span>
                <span className="text-xs text-zinc-100 tracking-wider">開啟手機姿態 / 水平儀流光 ➔</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
