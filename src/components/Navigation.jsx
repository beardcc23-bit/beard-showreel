import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { emilSpring, tapFeedback } from '../utils/motion';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { NAV_SCROLL_OFFSET, HERO_FINAL_FRAME_PROGRESS } from '../constants/heroScroll';

const SECTION_IDS = ['introduction', 'about', 'vfx', 'contact'];

// 計算 Hero 逐幀序列「最後一張定版（F 145）」對應的垂直捲動座標
const getHeroFinalFrameY = () => {
  const heroEl = document.getElementById('hero');
  if (!heroEl) return 0;
  const rect = heroEl.getBoundingClientRect();
  const scrollable = Math.max(0, rect.height - window.innerHeight);
  if (scrollable <= 0) return 0;
  const heroTop = rect.top + window.scrollY;
  return Math.round(heroTop + scrollable * HERO_FINAL_FRAME_PROGRESS);
};

const LENIS_ANCHOR_OPTIONS = {
  duration: 1.05,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};

let scrollRafId = null;
const animateScrollTo = (targetY, duration = 400) => {
  if (scrollRafId) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, targetY);
    return;
  }
  const startPosition = window.scrollY;
  const distance = targetY - startPosition;
  let startTime = null;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    window.scrollTo(0, startPosition + distance * easeInOutCubic(percent));
    if (progress < duration) {
      scrollRafId = requestAnimationFrame(step);
    } else {
      scrollRafId = null;
    }
  };
  scrollRafId = requestAnimationFrame(step);
};

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const drawerRef = useRef(null);
  const progressBarRef = useRef(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    return () => {
      if (scrollRafId) {
        cancelAnimationFrame(scrollRafId);
        scrollRafId = null;
      }
    };
  }, []);

  // Scroll Spy + 頂部 1px 全站光譜滾動進度線（直寫 transform，零重排）
  useEffect(() => {
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
      if (elements.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            for (let i = 0; i < entries.length; i += 1) {
              if (entries[i].isIntersecting) {
                setActiveSection(entries[i].target.id);
              }
            }
          },
          { rootMargin: '-35% 0px -55% 0px' }
        );
        elements.forEach((el) => observer.observe(el));
      }
    }

    let cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let cachedHeroClearThreshold = 160;

    const updateScrollMetrics = () => {
      cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const heroEl = document.getElementById('hero');
      cachedHeroClearThreshold = heroEl
        ? Math.max(160, heroEl.getBoundingClientRect().height - window.innerHeight * 0.5)
        : 160;
    };
    updateScrollMetrics();

    const handleScroll = () => {
      if (window.scrollY < cachedHeroClearThreshold) {
        setActiveSection((prev) => (prev ? '' : prev));
      }
      if (progressBarRef.current) {
        const ratio = Math.max(0, Math.min(1, window.scrollY / cachedMaxScroll));
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }
    };

    const docResizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScrollMetrics) : null;
    docResizeObserver?.observe(document.documentElement);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollMetrics, { passive: true });
    return () => {
      observer?.disconnect();
      docResizeObserver?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollMetrics);
    };
  }, []);

  useOverlayLock(isOpen, closeMenu, { containerRef: drawerRef });

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const menuItems = [
    { name: '個人介紹', href: '#introduction' },
    { name: '視覺思考', href: '#about' },
    { name: '作品案例', href: '#vfx' },
  ];

  const handleScroll = (e, href) => {
    if (e) e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) return;

    setActiveSection(targetId);
    setIsOpen(false);

    if (window.lenis) {
      window.lenis.start();
      window.lenis.scrollTo(element, { offset: -NAV_SCROLL_OFFSET, ...LENIS_ANCHOR_OPTIONS });
      return;
    }
    animateScrollTo(element.getBoundingClientRect().top + window.scrollY - NAV_SCROLL_OFFSET);
  };

  const scrollToHeroEnd = (e) => {
    if (e) e.preventDefault();
    setActiveSection('');
    setIsOpen(false);
    const targetY = getHeroFinalFrameY();
    if (window.lenis) {
      window.lenis.start();
      window.lenis.scrollTo(targetY, LENIS_ANCHOR_OPTIONS);
      return;
    }
    animateScrollTo(targetY);
  };

  return (
    <>
      <nav
        style={{ right: 'var(--scrollbar-comp, 0px)' }}
        className="fixed top-0 left-0 z-50 px-5 md:px-10 h-16 md:h-[72px] flex justify-between items-center border-b border-white/[0.12] bg-[#05080F]/45 backdrop-blur-xl backdrop-saturate-[180%] shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
      >
        {/* 頂部最上緣 1px 光譜滾動進度線 */}
        <div
          ref={progressBarRef}
          aria-hidden="true"
          style={{
            transform: 'scaleX(0)',
            background: 'linear-gradient(90deg, #FFFFFF 0%, #EB4A2E 38%, #D0346C 68%, #1276B8 100%)',
          }}
          className="absolute top-0 left-0 right-0 h-[1.5px] origin-left pointer-events-none will-change-transform"
        />

        <div className="flex items-center gap-3 md:gap-5">
          <m.button
            type="button"
            whileTap={tapFeedback}
            onClick={toggleMenu}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center text-title-white hover:text-spectral-crimson transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </m.button>

          <button
            type="button"
            onClick={scrollToHeroEnd}
            className="group flex items-center gap-3 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson cursor-pointer"
            aria-label="Beard Showreel - 回到首頁主視覺定版"
          >
            <span className="font-space-mono text-lg md:text-xl font-bold tracking-tighter text-title-white group-hover:opacity-85 transition-opacity">
              Beard<span className="text-spectral-crimson"> Showreel</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const isCurrent = activeSection === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent ? 'location' : undefined}
                  onClick={(e) => handleScroll(e, item.href)}
                  className={`relative px-4 py-2.5 text-xs tracking-widest transition-colors duration-200 group focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson cursor-pointer ${
                    isCurrent ? 'text-white font-medium' : 'text-zinc-400 hover:text-title-white'
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`absolute bottom-1 left-4 right-4 h-[1.5px] transition-transform duration-300 origin-left ${
                      isCurrent ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    style={{
                      background: 'linear-gradient(90deg, #EB4A2E 0%, #1276B8 100%)',
                    }}
                  />
                </a>
              );
            })}
          </div>

          <a
            href="#contact"
            aria-current={activeSection === 'contact' ? 'location' : undefined}
            onClick={(e) => handleScroll(e, '#contact')}
            className="hidden md:inline-flex spectral-cta px-5 py-2.5 text-xs tracking-[0.18em] uppercase items-center justify-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-crimson cursor-pointer"
          >
            <span>建立聯繫</span>
          </a>
        </div>
      </nav>

      {/* 行動裝置側邊選單：90 度銳利直角暗房面板 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] md:hidden"
            />
            <m.div
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={emilSpring.gentle}
              data-lenis-prevent
              aria-label="行動版導覽選單"
              className="fixed inset-y-0 left-0 w-[82%] max-w-[320px] overflow-y-auto overscroll-contain bg-[#060911]/72 backdrop-blur-2xl backdrop-saturate-[180%] z-[1000] md:hidden flex flex-col justify-between px-8 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] border-r border-white/15"
            >
              <div className="flex items-center justify-end border-b border-white/10 pb-5 shrink-0">
                <button
                  type="button"
                  onClick={toggleMenu}
                  className="text-title-white hover:text-spectral-crimson transition-colors min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                  aria-label="Close Menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center gap-6 py-6">
                {menuItems.map((item, index) => {
                  const isCurrent = activeSection === item.href.slice(1);
                  return (
                    <m.a
                      key={item.href}
                      href={item.href}
                      aria-current={isCurrent ? 'location' : undefined}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...emilSpring.smooth, delay: 0.05 * index }}
                      onClick={(e) => handleScroll(e, item.href)}
                      className={`text-lg font-medium tracking-tight transition-colors duration-200 flex flex-col px-6 py-1.5 border-l-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                        isCurrent
                          ? 'text-white border-spectral-crimson'
                          : 'text-zinc-300 hover:text-white border-white/10'
                      }`}
                    >
                      {item.name}
                    </m.a>
                  );
                })}
              </div>

              <a
                href="#contact"
                aria-current={activeSection === 'contact' ? 'location' : undefined}
                onClick={(e) => handleScroll(e, '#contact')}
                className="spectral-cta shrink-0 w-full px-6 py-4 flex items-center justify-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-crimson"
              >
                <span className="text-base font-semibold tracking-widest">建立聯繫</span>
              </a>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
