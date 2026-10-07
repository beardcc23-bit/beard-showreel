import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { emilSpring, tapFeedback } from '../utils/motion';

// 獨立的平滑滾動 Helper
const animateScrollTo = (targetY, duration = 400) => {
  const startPosition = window.scrollY;
  const distance = targetY - startPosition;
  let startTime = null;

  const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    const easedPercent = easeInOutCubic(percent);
    window.scrollTo(0, startPosition + distance * easedPercent);
    if (progress < duration) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // 遵守 Apple HIG 鍵盤操作規範：當選單開啟時監聽 Escape 關閉
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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

    animateScrollTo(element.getBoundingClientRect().top + window.scrollY - 85);
  };

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (window.lenis) {
      window.lenis.scrollTo(0);
      return;
    }
    animateScrollTo(0);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 py-4 md:py-6 flex justify-between items-center backdrop-blur-md border-b border-border bg-bg-core/85 transition-colors duration-500">
        {/* 導覽列底部極細微光漸層雷射線 */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-aurora-blue/40 to-transparent pointer-events-none opacity-70" />

        <div className="flex items-center gap-3 md:gap-6">
          <motion.button
            whileTap={tapFeedback}
            onClick={toggleMenu}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center text-white-or-black hover:text-aurora-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-sm"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={24} />
          </motion.button>
          <motion.button
            whileTap={tapFeedback}
            onClick={scrollToTop}
            className="text-lg md:text-xl font-black tracking-tighter font-space-mono text-white-or-black hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue cursor-pointer text-left rounded-sm"
            aria-label="Beard Showreel - Scroll to top"
          >
            Beard<span className="text-aurora-blue"> Showreel</span>
          </motion.button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* 熱區：每個連結加 px-5 py-3（與右側 CTA 同尺寸），間距由 space-x-12 改 space-x-2
              → 文字之間視覺距離維持 48px（20 + 8 + 20），但整塊框框範圍都可感應 */}
          <div className="hidden md:flex space-x-2">
            {menuItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                whileHover={{ y: -1 }}
                whileTap={tapFeedback}
                transition={emilSpring.snappy}
                onClick={(e) => handleScroll(e, item.href)}
                className="px-5 py-3 border border-transparent leading-none hover:text-dawn-gold transition-colors duration-300 group flex items-center justify-center focus-visible:ring-2 focus-visible:ring-dawn-gold rounded-sm outline-none cursor-pointer"
              >
                {/* 底線掛在文字 span 上，寬度只跟文字等寬，不會被 padding 撐大 */}
                <span className="relative text-xs font-normal tracking-wider">
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-dawn-gold transition-all duration-300 group-hover:w-full" />
                </span>
              </motion.a>
            ))}
          </div>

          <motion.a
            href="#contact"
            whileTap={tapFeedback}
            whileHover={{ scale: 1.02 }}
            transition={emilSpring.snappy}
            onClick={(e) => handleScroll(e, '#contact')}
            className="hidden md:flex hud-btn is-active px-5 py-3 items-center justify-center text-center leading-none focus-visible:ring-2 focus-visible:ring-dawn-gold rounded-sm outline-none hover:shadow-[0_0_18px_rgba(212,175,55,0.25)] transition-shadow duration-300 cursor-pointer"
          >
            <span className="hud-zht text-xs font-normal uppercase tracking-widest">建立聯繫</span>
          </motion.a>
        </div>
      </nav>

      {/* 行動裝置側邊選單：Emil Kowalski 物理彈簧抽屜 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[999] md:hidden"
            />
            {/* 側邊選單主體 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={emilSpring.gentle}
              className="fixed top-0 left-0 w-[80%] max-w-[320px] h-screen bg-bg-core/95 backdrop-blur-2xl z-[1000] md:hidden flex flex-col justify-center p-8 gap-8 border-r border-border shadow-2xl"
            >
              <motion.button
                whileTap={tapFeedback}
                onClick={toggleMenu}
                className="absolute top-5 right-5 text-white-or-black hover:text-aurora-blue transition-colors min-w-[44px] min-h-[44px] p-2 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-full"
                aria-label="Close Menu"
              >
                <X size={24} />
              </motion.button>

              <div className="flex flex-col gap-6">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...emilSpring.smooth, delay: 0.05 * index }}
                    whileTap={tapFeedback}
                    onClick={(e) => handleScroll(e, item.href)}
                    className="text-base font-normal uppercase tracking-tighter mono text-white-or-black hover:text-aurora-blue transition-colors duration-200 flex flex-col py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue rounded-sm"
                  >
                    <span className="text-[11px] text-zinc-400 font-medium tracking-widest mono mb-1">{item.eng}</span>
                    {item.name}
                  </motion.a>
                ))}
              </div>

              <motion.a
                href="#contact"
                whileTap={tapFeedback}
                onClick={(e) => handleScroll(e, '#contact')}
                className="hud-btn is-active w-fit px-6 py-3.5 flex flex-col items-start justify-center leading-none mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-dawn-gold rounded-sm"
              >
                <span className="hud-eng text-[10px] opacity-70 tracking-widest mono mb-1.5 uppercase">Establish Connection</span>
                <span className="hud-zht text-base font-normal uppercase tracking-widest">建立聯繫</span>
              </motion.a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
