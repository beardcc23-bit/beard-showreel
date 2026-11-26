import React, { useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { Play } from './common/Icons';
import AnimatedCounter from './common/AnimatedCounter';
import ScrubText from './common/ScrubText';
import RevealHeading from './common/RevealHeading';
import RefractionCard from './RefractionCard';
import ExperienceTimeline from './ExperienceTimeline';
import { achievementStats } from '../data/experience';
import {
  SHOWREEL_2026_VIDEO_ID,
  SHOWREEL_2025_VIDEO_ID,
} from '../constants/siteConfig';
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
      className="relative pt-6 pb-24 md:py-36 px-5 md:px-12 md-section-hairline"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* 不對稱雙欄：左肖像 + 右大標與文案 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* 左側：銳利直角雜誌肖像（左側帶光譜導光細絲、內嵌玻璃刃口與懸停暗房反光掠過） */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:col-span-5 lg:col-span-4"
          >
            <div className="group relative w-full max-w-[260px] sm:max-w-[320px] md:max-w-none mx-auto aspect-[3/4] overflow-hidden ring-1 ring-inset ring-white/[0.12] shadow-[0_28px_80px_rgba(0,0,0,0.82)]">
              <img
                src={`${import.meta.env.BASE_URL}avatar.webp?v=2`}
                alt="Beard Chou"
                width="768"
                height="1024"
                sizes="(max-width: 639px) 260px, (max-width: 767px) 320px, (max-width: 1023px) 40vw, 384px"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {/* 左緣 1.5px 暗房光譜導光刃 */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-[1.5px] z-10 spectral-bar-v opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              />
              {/* 懸停 115° 暗房玻璃微光掠過（純 GPU transform 合成層） */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -inset-y-12 -left-1/2 w-2/3 -skew-x-[22deg] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent -translate-x-[160%] group-hover:translate-x-[280%] transition-transform duration-1000 ease-out z-10"
              />
            </div>
          </m.div>

          {/* 右側：標題、三段文案與 SHOWREEL 按鈕 */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col items-start">
            <RevealHeading className="font-display text-[clamp(2.5rem,5.4vw,6rem)] whitespace-nowrap font-extrabold tracking-[-0.035em] leading-[0.94] text-title-white mb-10">
              Beard <span className="text-spectral-crimson">Chou</span>
            </RevealHeading>

            <div className="text-zinc-300 text-sm sm:text-base md:text-[17px] font-light leading-[1.9] tracking-wide space-y-6 max-w-[62ch]">
              <ScrubText text="重力與空氣的流動、光線穿透塵埃的折射軌跡、人物肌膚的毛孔質感——這些構築真實感的微小物理，是我的日常畫面。" />
              <ScrubText text="最極致的合成特效，往往不著痕跡。在長期與頂級品牌合作的洗禮下，我立足於感性與理性之間 —— 精準收攏導演天馬行空的想像，在有限時程內交付無可挑剔的商業影片。" />
              <ScrubText text="我習慣將這份對細節的敏銳，投射在螢幕彼端，那雙尋找解答也渴望被美感觸動的眼睛。不論是追求極致視覺的宏大敘事，還是需要嚴謹邏輯的商業落地。在光影與像素之間，創造下一個讓人駐足的瞬間。" />
            </div>

            <div className="mt-10 w-full sm:w-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() =>
                  onPlayVideo(SHOWREEL_2026_VIDEO_ID, false, 'video', null, '2026 SHOWREEL')
                }
                className="group spectral-cta px-3 sm:px-8 py-4 inline-flex items-center justify-center gap-2 sm:gap-3 mono text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.22em] whitespace-nowrap active:scale-[0.985] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-crimson"
              >
                <Play
                  size={11}
                  fill="currentColor"
                  className="shrink-0 text-spectral-crimson group-hover:text-white transition-colors duration-300"
                />
                <span>2026 SHOWREEL</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onPlayVideo(SHOWREEL_2025_VIDEO_ID, false, 'video', null, '2025 SHOWREEL')
                }
                className="group spectral-cta-secondary px-3 sm:px-8 py-4 inline-flex items-center justify-center gap-2 sm:gap-3 mono text-[11px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.22em] whitespace-nowrap active:scale-[0.985] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-spectral-cyan"
              >
                <Play
                  size={11}
                  fill="currentColor"
                  className="shrink-0 text-zinc-400 group-hover:text-white transition-colors duration-300"
                />
                <span>2025 SHOWREEL</span>
              </button>
            </div>
          </div>
        </div>

        {/* 純淨磨砂毛玻璃數據牆（支援雙色溫游標折射漫射追蹤） */}
        <m.div
          ref={statsRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20 md:mt-28"
        >
          <RefractionCard className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
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
                    {stat.unit}
                  </span>
                </div>
              </div>
            ))}
          </RefractionCard>
        </m.div>

        {/* 電影演職員表風格學經歷 */}
        <ExperienceTimeline />
      </div>
    </section>
  );
}
