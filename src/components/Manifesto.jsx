import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Play, ArrowUpRight } from './common/Icons';
import RefractionCard from './RefractionCard';
import ScrubText from './common/ScrubText';
import RevealHeading from './common/RevealHeading';
import { APP_EVENTS } from '../constants/siteConfig';
import { getSafeExternalUrl } from '../utils/url';
import { useOffscreenPause } from '../hooks/useOffscreenPause';
import { useMediaQuery } from '../hooks/useMediaQuery';

const lawCategories = [
  {
    id: '01',
    subtitle: 'AI 素材合成',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(235, 74, 46, 0.17) 0%, transparent 62%)',
    quoteBorderClass: 'border-spectral-crimson/70',
    watermarkClass: 'text-spectral-crimson/[0.08]',
    stickyTop: 'top-[76px] md:top-24',
    quote: '「AI 給的是素材，不是成品。」',
    desc: 'AI 生成的畫面常有物理錯誤、閃爍、細節前後對不上。我從一堆生成結果裡挑出能用的部分，和實拍素材合在一起，修到能上電視播。',
    params: [
      {
        key: 'Foxtron Cavira',
        value: '實拍車輛行駛畫面，背景換成 AI 生成的淡江大橋，在 Flame 裡重新對齊透視，補上車身反光和光影。',
        videoId: 'pCBQA1vEDig',
      },
      {
        key: '活沛多',
        value: '用 AI 把實拍演員縮成迷你比例，再和其他 AI 角色放進同一個畫面互動。',
        videoId: 'Y4CG2QNa5hs',
      },
    ],
  },
  {
    id: '02',
    subtitle: '綠幕去背合成',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(208, 52, 108, 0.17) 0%, transparent 62%)',
    quoteBorderClass: 'border-[#D0346C]/70',
    watermarkClass: 'text-[#D0346C]/[0.08]',
    stickyTop: 'top-[92px] md:top-32',
    quote: '「去背切得再乾淨，光不對，一眼就假。」',
    desc: '最花時間的是髮絲、半透明邊緣、綠色反光，還有人和背景之間的光要對上。這些沒處理好，觀眾說不出哪裡怪，但就是覺得假。',
    params: [
      {
        key: 'UCC',
        value: '為了省掉出外景的時間，整場在棚內綠幕拍攝，後期再合成海景和山景，天光要做到像真的在現場拍。',
        videoId: 'AuuxyMIutf8',
      },
      {
        key: '磊山保經',
        value: '現場沒有綠幕，只能手工逐格把人物摳出來，再在人物前後穿插跳動的色塊，做出層次和節奏。',
        videoId: 'Rwrn87N2PUc',
      },
    ],
  },
  {
    id: '03',
    subtitle: '人物修膚與美體',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(18, 118, 184, 0.19) 0%, transparent 62%)',
    quoteBorderClass: 'border-[#1276B8]/75',
    watermarkClass: 'text-[#1276B8]/[0.09]',
    stickyTop: 'top-[108px] md:top-40',
    quote: '「修得好看，但不能修到不像本人。」',
    desc: '代言人的臉和身材要好看，但不能像塑膠。我用追蹤加逐格修飾處理膚質、輪廓和體態，盡量保留毛孔和皮膚原本的紋理。',
    params: [
      {
        key: 'TKLAB',
        value: '修飾小 S 的膚質和臉部輪廓，保留真實感，另外擦掉手部和腿上的刺青。',
        videoId: '1495921932163292',
        isFacebook: true,
        aspect: 'square',
        url: 'https://www.facebook.com/TKLAB.tw/videos/1495921932163292',
      },
      {
        key: 'LUX 髮的補給',
        value: '除了修膚，也處理頭髮擺動時的細節，讓長髮動起來更順、更輕。',
        videoId: '822528356385191',
        isFacebook: true,
        url: 'https://www.facebook.com/watch/?v=822528356385191',
      },
    ],
  },
];

let isFlameSchematicPreloaded = false;
const FLAME_SCHEMATIC_FILE = 'f1.webp?v=2';

/**
 * 第三幕 Manifesto：左側 Sticky 釘選核心宣言 × 右側三層滾動堆疊光譜分鏡卡 (Sticky-Stack)
 * - 無須手動點小按鈕，隨滾動由朱紅 -> 洋紅 -> 光學青藍層層向上覆蓋堆疊
 */
export default function Manifesto({ onPlayVideo }) {
  const sectionRef = useRef(null);
  const suppressNextFocusRef = useRef(false);
  const [flamePreview, setFlamePreview] = useState(null);
  const isTouchOnly = useMediaQuery('(hover: none) and (pointer: coarse)');
  useOffscreenPause(sectionRef);

  // 區塊進入視窗前背景預熱 f1.webp（115KB），模組級單次鎖確保首次懸停或聚焦 Autodesk Flame 時 0ms 無黑底秒出節點圖
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined' || isFlameSchematicPreloaded) return undefined;
    const preloadSchematic = () => {
      if (isFlameSchematicPreloaded) return;
      isFlameSchematicPreloaded = true;
      const img = new Image();
      img.decoding = 'async';
      img.src = `${import.meta.env.BASE_URL}${FLAME_SCHEMATIC_FILE}`;
    };
    if (typeof IntersectionObserver === 'undefined') {
      preloadSchematic();
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          preloadSchematic();
          io.disconnect();
        }
      },
      { rootMargin: '320px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!flamePreview) return undefined;
    const startScrollY = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - startScrollY) > 20) {
        setFlamePreview(null);
      }
    };
    const dismiss = () => setFlamePreview(null);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', dismiss, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', dismiss);
    };
  }, [flamePreview]);

  const showFlamePreviewFromTarget = (targetEl) => {
    if (!targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 24;
    const navSafeTop = 88;
    const cardW = Math.min(vw * 0.44, 680, vw - pad * 2);
    const estH = cardW * (902 / 1920) + 64;

    // 水平對齊文字右側，並防溢出螢幕右緣
    const left = Math.max(pad, Math.min(rect.right + 20, vw - cardW - pad));

    // 優先放文字右下方，下方空間不足則自動切至文字右上方並避開頂部導覽列
    const belowTop = rect.bottom + 14;
    const fitsBelow = belowTop + estH <= vh - pad;
    const top = fitsBelow
      ? belowTop
      : Math.max(navSafeTop, Math.min(rect.top - estH - 14, vh - estH - pad));

    setFlamePreview({ left, top, width: cardW });
  };

  const handleFlameEnter = (e) => {
    if (e.pointerType === 'touch') return;
    showFlamePreviewFromTarget(e.currentTarget);
  };

  const handleFlameFocus = (e) => {
    if (suppressNextFocusRef.current) {
      suppressNextFocusRef.current = false;
      return;
    }
    if (isTouchOnly) return;
    showFlamePreviewFromTarget(e.currentTarget);
  };

  const openFlameSchematic = () => {
    suppressNextFocusRef.current = true;
    setFlamePreview(null);
    window.dispatchEvent(
      new CustomEvent(APP_EVENTS.OPEN_IMAGE_MODAL, {
        detail: {
          imageUrl: `${import.meta.env.BASE_URL}${FLAME_SCHEMATIC_FILE}`,
          title: 'Autodesk Flame Batch Schematic',
          description: '實際專案 Batch 節點介面',
        },
      })
    );
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full relative py-28 md:py-40 px-5 md:px-12 section-hairline"
    >
      <div className="max-w-7xl mx-auto">
        {/* 左對齊編輯標頭 */}
        <div className="mb-16 md:mb-24">
          <RevealHeading className="font-display text-[clamp(1.8rem,6.8vw,5.8rem)] whitespace-nowrap font-extrabold uppercase leading-[0.92] tracking-[-0.035em] text-title-white">
            THE MANIFESTO
          </RevealHeading>
        </div>

        {/* 左欄 Sticky 釘選宣言 × 右欄 Sticky-Stack 三層光譜大卡 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* 左側：Sticky 宣言主文 */}
          <div className="md:col-span-5 md:sticky md:top-28 space-y-8 text-zinc-300 text-sm md:text-[16px] leading-[1.9] font-light">
            <p>
              作為台灣俗稱的 <span className="text-white font-normal">D1 技師 (VFX Artist)</span>，我接手廣告製作的最後一步。一支廣告片從前期創意發想、實際拍攝、Offline 剪接再到調光，最後檔案來到我手中，使用{' '}
              <button
                type="button"
                aria-label="檢視 Autodesk Flame 實際專案 Batch 節點介面"
                onPointerEnter={handleFlameEnter}
                onPointerLeave={(e) => {
                  if (document.activeElement !== e.currentTarget) {
                    setFlamePreview(null);
                  }
                }}
                onFocus={handleFlameFocus}
                onBlur={() => setFlamePreview(null)}
                onClick={openFlameSchematic}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && flamePreview) {
                    e.preventDefault();
                    e.stopPropagation();
                    setFlamePreview(null);
                  }
                }}
                className="relative inline-flex items-center gap-1 group/flame cursor-pointer bg-transparent border-0 p-0 align-baseline focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
              >
                <span className="text-white group-hover/flame:text-dawn-gold font-medium transition-colors duration-300">
                  Autodesk Flame
                </span>
                <ArrowUpRight size={13} className="text-spectral-crimson transition-transform duration-300 group-hover/flame:translate-x-0.5 group-hover/flame:-translate-y-0.5" />
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] spectral-underline" />
              </button>{' '}
              進行 Online。修膚、修穿幫、綠幕去背、3D 物件與商品合成、上字幕，都在這一關完成。經過導演、代理商和客戶一輪輪確認後，輸出 <span className="text-white font-normal">SC 播帶</span>交片。
            </p>

            <ScrubText text="交片前的修改不會少，我也不怕改。我在意的是每一次修改，都比上一版更接近客戶要的樣子。" />
            <ScrubText text="這兩年我把 AI 生成工具接進合成流程，用來補素材、做前期測試。工具一直在變，但最後一關的品質，還是得靠人眼把關。" />
            <ScrubText className="border-l-2 border-spectral-crimson py-2 text-title-white text-sm sm:text-base leading-relaxed pl-5 font-normal">
              「細心雕琢每一格畫面，在極限的時程裡，成為替導演與客戶解決問題的人。」
            </ScrubText>
          </div>

          {/* 右側：三層滾動堆疊磨砂毛玻璃分鏡面板 (Sticky-Stack，桌機與手機皆由 01 -> 02 -> 03 依序疊壓) */}
          <div className="md:col-span-7 flex flex-col gap-8 md:gap-14">
            {lawCategories.map((cat, idx) => (
              <div
                key={cat.id}
                data-testid={`manifesto-stack-${cat.id}`}
                style={{ zIndex: 11 + idx }}
                className={`sticky ${cat.stickyTop}`}
              >
                <RefractionCard className="w-full p-7 sm:p-10 !bg-[#060911]/[0.92] !backdrop-blur-md">
                  {/* 內層裁切裝飾容器（保留外層 3D 立體玻璃厚邊不被 overflow-hidden 裁掉） */}
                  <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[2px] spectral-flow-line" />
                    <div className="absolute inset-0" style={{ background: cat.ambientGlow }} />
                    <span className={`font-display text-7xl sm:text-8xl font-extrabold ${cat.watermarkClass} absolute top-4 right-6 leading-none select-none`}>
                      {cat.id}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-semibold text-title-white tracking-tight mb-5">
                      {cat.subtitle}
                    </h3>

                    <blockquote
                      className={`text-zinc-100 font-normal text-base sm:text-lg leading-relaxed border-l-2 ${cat.quoteBorderClass} py-0.5 mb-5`}
                      style={{ textIndent: '-1em', paddingLeft: 'calc(1rem + 1em)' }}
                    >
                      {cat.quote}
                    </blockquote>

                    <p className="text-sm sm:text-[15px] text-zinc-300 font-light leading-[1.85] mb-8">
                      {cat.desc}
                    </p>

                    {/* 實戰案例播放條 */}
                    <div className="border-t border-white/10 divide-y divide-white/[0.08]">
                      {cat.params.map((param) => {
                        const hasVideo = Boolean(param.videoId);
                        const safeExternalUrl = param.isFacebook ? getSafeExternalUrl(param.url) : null;
                        const triggerVideo = () => {
                          if (!hasVideo) return;
                          if (onPlayVideo) {
                            onPlayVideo(
                              param.videoId,
                              param.isFacebook,
                              param.aspect,
                              param.url,
                              param.key
                            );
                          }
                        };

                        return (
                          <div key={param.key} className="py-4 first:pt-5 last:pb-0">
                            {safeExternalUrl ? (
                              <a
                                href={safeExternalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group/play w-full flex items-center justify-between text-left mb-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                              >
                                <span className="inline-flex items-center gap-2.5 text-sm sm:text-[15px] font-medium text-title-white group-hover/play:text-dawn-gold transition-colors">
                                  <Play
                                    size={11}
                                    fill="currentColor"
                                    className="text-spectral-crimson transition-transform duration-200 group-hover/play:scale-125"
                                  />
                                  <span>{param.key}</span>
                                </span>
                                <ArrowUpRight
                                  size={14}
                                  className="shrink-0 text-zinc-500 group-hover/play:text-spectral-crimson group-hover/play:translate-x-0.5 group-hover/play:-translate-y-0.5 transition-[color,transform] duration-200"
                                />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={triggerVideo}
                                className="group/play w-full flex items-center justify-between text-left mb-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                              >
                                <span className="inline-flex items-center gap-2.5 text-sm sm:text-[15px] font-medium text-title-white group-hover/play:text-dawn-gold transition-colors">
                                  <Play
                                    size={11}
                                    fill="currentColor"
                                    className="text-spectral-crimson transition-transform duration-200 group-hover/play:scale-125"
                                  />
                                  <span>{param.key}</span>
                                </span>
                              </button>
                            )}
                            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed pl-5">
                              {param.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </RefractionCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 游標懸停 Autodesk Flame 時於文字右下或右上方完整呈現無裁切 Batch 節點介面（純觸控手機跳過 Portal 掛載） */}
      {typeof document !== 'undefined' &&
        !isTouchOnly &&
        ReactDOM.createPortal(
          <AnimatePresence>
            {flamePreview && (
              <m.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden="true"
                data-testid="flame-hover-preview"
                style={{
                  position: 'fixed',
                  left: `${flamePreview.left}px`,
                  top: `${flamePreview.top}px`,
                  width: `${flamePreview.width}px`,
                }}
                className="fixed z-[9990] pointer-events-none"
              >
                <div className="optical-surface p-2.5 md:p-3 shadow-[0_28px_80px_rgba(0,0,0,0.9)]">
                  <div className="w-full aspect-[1920/902] border border-white/10 bg-black overflow-hidden">
                    <img
                      src={`${import.meta.env.BASE_URL}${FLAME_SCHEMATIC_FILE}`}
                      alt="Autodesk Flame Batch Schematic"
                      width="1920"
                      height="902"
                      decoding="async"
                      className="block w-full h-full object-contain"
                    />
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-zinc-300 tracking-wide">
                    <span className="w-1.5 h-1.5 bg-spectral-crimson shrink-0" />
                    <span>實際專案 Batch 節點介面</span>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
