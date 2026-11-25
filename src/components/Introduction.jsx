import React, { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { Play } from 'lucide-react';
import AnimatedCounter from './common/AnimatedCounter';
import ScrubText from './common/ScrubText';
import RevealHeading from './common/RevealHeading';
import ExperienceTimeline from './ExperienceTimeline';
import { achievementStats } from '../data/experience';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

/**
 * 第二幕 Introduction：無框雜誌肖像 × 瑞士海報巨型數據 × 演職員履歷表
 * - 淘汰舊站圓角黑玻璃卡片與旋轉歪斜照片，以 1px 光學細線與強烈比例反差構成
 */
export default function Introduction({ onPlayVideo }) {
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { margin: '-50px', once: true });

  return (
    <section
      ref={sectionRef}
      id="introduction"
      className="relative pt-6 pb-24 md:py-36 px-5 md:px-12 md:border-t md:border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* 不對稱雙欄：左肖像 + 右大標與文案 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* 左側：銳利直角雜誌肖像（左側帶 45° 光譜邊緣光條） */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-5 lg:col-span-4"
          >
            <div className="group relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-none mx-auto aspect-[3/4] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.75)]">
              <img
                src={`${import.meta.env.BASE_URL}avatar.webp`}
                alt="Beard Chou"
                width="888"
                height="1024"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            </div>
          </m.div>

          {/* 右側：標題、三段文案與 SHOWREEL 按鈕 */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col items-start">
            <RevealHeading className="font-display text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-[-0.035em] leading-[0.94] text-title-white mb-10">
              Beard <span className="text-spectral-crimson">Chou</span>
            </RevealHeading>

            <div className="text-zinc-300 text-sm sm:text-base md:text-[17px] font-light leading-[1.9] tracking-wide space-y-6 max-w-[62ch]">
              <ScrubText text="重力與空氣的流動、光線穿透塵埃的折射軌跡、人物肌膚的毛孔質感——這些構築真實感的微小物理，是我的日常畫面。" />
              <ScrubText text="最極致的合成特效，往往不著痕跡。在長期與頂級品牌合作的洗禮下，我立足於感性與理性之間 —— 精準收攏導演天馬行空的想像，在有限時程內交付無可挑剔的商業影片。" />
              <ScrubText text="我習慣將這份對細節的敏銳，投射在螢幕彼端，那雙尋找解答也渴望被美感觸動的眼睛。不論是追求極致視覺的宏大敘事，還是需要嚴謹邏輯的商業落地。在光影與像素之間，創造下一個讓人駐足的瞬間。" />
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={() => onPlayVideo('s6s2p87fPdA')}
                className="group spectral-cta px-10 py-4 inline-flex items-center gap-3 mono text-xs uppercase tracking-[0.26em] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-crimson"
              >
                <Play
                  size={12}
                  fill="currentColor"
                  className="text-spectral-crimson group-hover:text-white transition-colors duration-300"
                />
                <span>SHOWREEL</span>
              </button>
            </div>
          </div>
        </div>

        {/* 純淨磨砂毛玻璃數據牆 */}
        <m.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 md:mt-28 optical-surface grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15"
        >
          {achievementStats.map((stat) => (
            <div
              key={stat.key}
              className="p-7 sm:p-9 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center">
                <span className="text-xs text-zinc-400 font-medium tracking-[0.2em]">
                  {stat.label}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-x-2.5 gap-y-1.5 flex-wrap">
                <div className="inline-flex items-baseline font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] text-title-white tabular-nums leading-none">
                  <AnimatedCounter value={stat.getValue()} trigger={statsInView} />
                  <sup className="static self-start text-spectral-crimson text-2xl md:text-3xl lg:text-4xl font-extrabold leading-none ml-0.5 -mt-1">
                    +
                  </sup>
                </div>
                <span className="font-display text-xs md:text-sm font-bold uppercase tracking-[0.14em] text-white leading-none">
                  {stat.unit.replace(/^\/\//, '')}
                </span>
              </div>
            </div>
          ))}
        </m.div>

        {/* 電影演職員表風格學經歷 */}
        <ExperienceTimeline />
      </div>
    </section>
  );
}
