import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { categories } from '../data/portfolio';
import { emilSpring, tapFeedback } from '../utils/motion';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { NAV_SCROLL_OFFSET, getHeroFinalFrameY } from '../constants/heroScroll';
import { APP_EVENTS } from '../constants/siteConfig';
import { smoothScrollTo } from '../utils/scroll';

const SECTION_IDS = ['introduction', 'about', 'vfx', 'contact'];
const MENU_ITEMS = [
  { name: '個人介紹', href: '#introduction' },
  { name: '視覺思考', href: '#about' },
  { name: '作品案例', href: '#vfx', hasSubmenu: true },
];
// 行動端母選單與右側作品子選單共用完全一致的字體、字級、字重與字距
const MOBILE_MENU_TEXT_CLASS = 'text-[16px] min-[390px]:text-[18px] font-medium tracking-[0.06em]';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [activePortfolioTab, setActivePortfolioTab] = useState(
    () =>
      (typeof document !== 'undefined' && document.documentElement.dataset.portfolioTab) ||
      categories[0]?.id ||
      'food'
  );
  const drawerRef = useRef(null);
  const progressBarRef = useRef(null);
  const portfolioBtnRef = useRef(null);
  const subpanelRef = useRef(null);

  // 關閉選單時僅設 isOpen=false，讓母頁面與已展開的子頁面連體同步向左退場消失；待退場完成後於 onExitComplete 重置子面板狀態
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      if (!prev) setIsPortfolioOpen(false);
      return !prev;
    });
  };

  // Scroll Spy + 頂部 1px 全站光譜滾動進度線（直寫 transform，零重排）
  useEffect(() => {
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
      if (elements.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            let latestId = null;
            for (let i = 0; i < entries.length; i += 1) {
              if (entries[i].isIntersecting) {
                latestId = entries[i].target.id;
              }
            }
            if (latestId !== null) {
              setActiveSection(latestId);
            }
          },
          { rootMargin: '-35% 0px -55% 0px' }
        );
        elements.forEach((el) => observer.observe(el));
      }
    }

    let cachedMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    let cachedHeroClearThreshold = 160;
    let lastRatio = -1;

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
        if (Math.abs(ratio - lastRatio) >= 0.0005) {
          lastRatio = ratio;
          progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
        }
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

  // 同步追蹤 VisualSynthesis 目前所在的作品分類，以於子面板精準高亮當前分類
  useEffect(() => {
    const syncTab = (e) => {
      const catId = e.detail?.categoryId;
      if (catId) setActivePortfolioTab(catId);
    };
    window.addEventListener(APP_EVENTS.PORTFOLIO_CATEGORY_CHANGED, syncTab);
    return () => window.removeEventListener(APP_EVENTS.PORTFOLIO_CATEGORY_CHANGED, syncTab);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const currentAttr = document.documentElement.dataset.portfolioTab;
    if (currentAttr) setActivePortfolioTab(currentAttr);
    const handleResize = () => {
      if (window.innerWidth >= 768) closeMenu();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, closeMenu]);

  const handleScroll = (e, href) => {
    if (e) e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (!element) return;

    setActiveSection(targetId);
    closeMenu();
    smoothScrollTo(element, { offset: -NAV_SCROLL_OFFSET });
  };

  const handleSelectPortfolioCategory = (categoryId) => {
    setActivePortfolioTab(categoryId);
    window.dispatchEvent(
      new CustomEvent(APP_EVENTS.SELECT_PORTFOLIO_CATEGORY, { detail: { categoryId } })
    );
    setActiveSection('vfx');
    closeMenu();
    const targetEl = document.getElementById('vfx-tabs') || document.getElementById('vfx');
    if (targetEl) {
      smoothScrollTo(targetEl, { offset: -(NAV_SCROLL_OFFSET + 12) });
    }
  };

  const scrollToHeroEnd = (e) => {
    if (e) e.preventDefault();
    setActiveSection('');
    closeMenu();
    smoothScrollTo(getHeroFinalFrameY());
  };

  return (
    <>
      <nav
        style={{ right: 'var(--scrollbar-comp, 0px)' }}
        className="optical-frosted-drawer fixed top-0 left-0 z-50 px-5 md:px-10 h-16 md:h-[72px] flex justify-between items-center border-b border-white/[0.12] bg-[#05080F]/45 backdrop-blur-xl backdrop-saturate-[180%] shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
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
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
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
            <span className="font-display text-lg md:text-xl font-extrabold tracking-[-0.03em] text-title-white group-hover:opacity-85 transition-opacity">
              Beard<span className="text-spectral-crimson"> Showreel</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1">
            {MENU_ITEMS.map((item) => {
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

      {/* 行動裝置側邊選單：母子連體雙翼架構（關閉時母頁面與子頁面同步向左滑出消失） */}
      <AnimatePresence onExitComplete={() => setIsPortfolioOpen(false)}>
        {isOpen && (
          <>
            <m.div
              key="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] md:hidden"
            />
            <m.div
              key="mobile-menu-stage"
              ref={drawerRef}
              onKeyDown={(e) => {
                if (!isPortfolioOpen) return;
                const inSubpanel = subpanelRef.current?.contains(document.activeElement);
                if (e.key === 'Escape' || (e.key === 'ArrowLeft' && inSubpanel)) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPortfolioOpen(false);
                  portfolioBtnRef.current?.focus({ preventScroll: true });
                }
              }}
              initial={{ x: '-100%', opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={emilSpring.gentle}
              className="fixed inset-y-0 left-0 z-[1000] flex items-stretch pointer-events-none md:hidden"
            >
              {/* 左側母選單（z-20 在前） */}
              <div
                id="mobile-nav-drawer"
                data-lenis-prevent
                aria-label="行動版導覽選單"
                className="optical-frosted-drawer relative z-20 pointer-events-auto w-[198px] min-[390px]:w-[216px] sm:w-[260px] h-full overflow-y-auto overscroll-contain bg-[#060911]/88 backdrop-blur-2xl backdrop-saturate-[180%] flex flex-col px-4 sm:px-6 pt-3 pb-[calc(1.75rem+env(safe-area-inset-bottom))] border-r border-white/15"
              >
                <div className="h-14 flex items-center justify-end border-b border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="text-title-white hover:text-spectral-crimson transition-colors min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                    aria-label="Close Menu"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-7 py-6 pl-2 min-[390px]:pl-3 sm:pl-5">
                  {MENU_ITEMS.map((item, index) => {
                    const sectionKey = item.href.slice(1);
                    if (item.hasSubmenu) {
                      const isHighlighted = isPortfolioOpen || activeSection === sectionKey;
                      return (
                        <m.button
                          key={item.href}
                          ref={portfolioBtnRef}
                          type="button"
                          aria-expanded={isPortfolioOpen}
                          aria-controls="mobile-portfolio-subpanel"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...emilSpring.smooth, delay: 0.05 * index }}
                          onClick={() => setIsPortfolioOpen((prev) => !prev)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowRight') {
                              e.preventDefault();
                              setIsPortfolioOpen(true);
                              requestAnimationFrame(() => {
                                subpanelRef.current
                                  ?.querySelector('button')
                                  ?.focus({ preventScroll: true });
                              });
                            }
                          }}
                          className={`w-full text-left ${MOBILE_MENU_TEXT_CLASS} transition-colors duration-200 flex items-center justify-between pl-5 sm:pl-6 pr-1 py-1.5 border-l-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                            isHighlighted
                              ? 'text-white border-spectral-crimson'
                              : 'text-zinc-300 hover:text-white border-white/10'
                          }`}
                        >
                          <span>{item.name}</span>
                          <ChevronRight
                            size={19}
                            strokeWidth={2.25}
                            data-testid="portfolio-submenu-arrow"
                            className={`shrink-0 text-spectral-crimson transition-transform duration-200 ${
                              isPortfolioOpen ? 'translate-x-1' : ''
                            }`}
                          />
                        </m.button>
                      );
                    }

                    // 當「作品案例」子選單展開時，其他項目的橘色線自動暗掉，維持單一互斥焦點
                    const isHighlighted = !isPortfolioOpen && activeSection === sectionKey;
                    return (
                      <m.a
                        key={item.href}
                        href={item.href}
                        aria-current={isHighlighted ? 'location' : undefined}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...emilSpring.smooth, delay: 0.05 * index }}
                        onClick={(e) => handleScroll(e, item.href)}
                        className={`${MOBILE_MENU_TEXT_CLASS} transition-colors duration-200 flex flex-col pl-5 sm:pl-6 pr-1 py-1.5 border-l-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                          isHighlighted
                            ? 'text-white border-spectral-crimson'
                            : 'text-zinc-300 hover:text-white border-white/10'
                        }`}
                      >
                        {item.name}
                      </m.a>
                    );
                  })}

                  <m.a
                    href="#contact"
                    aria-current={
                      !isPortfolioOpen && activeSection === 'contact' ? 'location' : undefined
                    }
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...emilSpring.smooth, delay: 0.15 }}
                    onClick={(e) => handleScroll(e, '#contact')}
                    className="spectral-cta w-fit px-5 sm:px-6 py-3.5 inline-flex items-center justify-center leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-crimson"
                  >
                    <span className={MOBILE_MENU_TEXT_CLASS}>建立聯繫</span>
                  </m.a>
                </div>
              </div>

              {/* 右側 6 大作品分類子面板（z-10 在母選單後方，由邊界向右滑出且上下精準對齊，關閉時隨父層一體退場） */}
              <div className="relative z-10 h-full overflow-hidden pointer-events-none flex flex-col justify-center pt-[calc(0.75rem+3.5rem)] pb-[calc(1.75rem+env(safe-area-inset-bottom))]">
                <div className="py-6 max-h-full flex items-center">
                  <AnimatePresence>
                    {isPortfolioOpen && (
                      <m.div
                        key="mobile-portfolio-subpanel"
                        ref={subpanelRef}
                        id="mobile-portfolio-subpanel"
                        data-testid="mobile-portfolio-subpanel"
                        data-lenis-prevent
                        role="region"
                        aria-label="作品案例分類子選單"
                        initial={{ x: '-102%' }}
                        animate={{ x: '0%' }}
                        exit={{ x: '-102%' }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="optical-frosted-drawer pointer-events-auto w-[min(170px,calc(100vw-204px))] min-[390px]:w-[min(186px,calc(100vw-222px))] sm:w-[216px] max-h-full overflow-y-auto overscroll-contain bg-[#060911]/90 backdrop-blur-2xl backdrop-saturate-[180%] border-y border-r border-white/[0.14] p-2.5 flex flex-col gap-2 shadow-[16px_24px_48px_rgba(0,0,0,0.85)]"
                      >
                        {categories.map((cat) => {
                          const isCatActive = activePortfolioTab === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleSelectPortfolioCategory(cat.id)}
                              className={`w-full px-3.5 sm:px-5 py-2.5 text-left ${MOBILE_MENU_TEXT_CLASS} whitespace-nowrap border transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson ${
                                isCatActive
                                  ? 'border-spectral-crimson/75 bg-spectral-crimson/[0.14] text-white'
                                  : 'border-white/[0.12] bg-white/[0.02] text-zinc-200 hover:border-spectral-crimson/50 hover:bg-white/[0.06] hover:text-white active:bg-spectral-crimson/20'
                              }`}
                            >
                              {cat.name}
                            </button>
                          );
                        })}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
