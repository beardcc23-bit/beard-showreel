import React from 'react';
import { m } from 'framer-motion';
import RefractionCard from './RefractionCard';
import { careerHistory } from '../data/experience';

/**
 * 電影演職員表風格履歷列表 (Film Credits Sheet)
 * - 以 1px 精密水平線、tabular-nums 時間碼、雙色溫游標折射與懸停微推手感構成
 */
export default function ExperienceTimeline() {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7 }}
      className="w-full mt-16 md:mt-20"
    >
      <RefractionCard as="ol" className="px-6 sm:px-8 py-2 divide-y divide-white/[0.10]">
        {careerHistory.map((item) => (
          <li
            key={`${item.period}-${item.title}`}
            className={`group relative grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-6 py-5 sm:items-baseline transition-colors duration-300 px-2 -mx-2 ${
              item.highlight
                ? 'bg-gradient-to-r from-spectral-crimson/[0.06] via-transparent to-transparent hover:from-spectral-crimson/[0.10]'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            {/* 左側現職朱紅發光細標／歷史經歷懸停冷藍光標 */}
            <span
              aria-hidden="true"
              className={`hidden sm:block absolute left-0 inset-y-2 w-[2px] transition-opacity duration-300 ${
                item.highlight
                  ? 'bg-spectral-crimson opacity-100 shadow-[0_0_10px_rgba(235,74,46,0.65)]'
                  : 'bg-spectral-cyan opacity-0 group-hover:opacity-100'
              }`}
            />

            <time className="mono text-xs sm:text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors tabular-nums tracking-wider sm:col-span-3 sm:pl-3">
              {item.period}
            </time>

            <h4
              className={`text-base sm:text-lg tracking-tight sm:col-span-5 transition-[color,transform] duration-300 group-hover:translate-x-1 ${
                item.highlight ? 'font-semibold text-white' : 'font-normal text-zinc-200 group-hover:text-white'
              }`}
            >
              {item.title}
            </h4>

            {item.role && (
              <span
                className={`text-xs sm:text-sm sm:col-span-4 sm:text-right font-light transition-colors duration-300 ${
                  item.highlight ? 'text-spectral-crimson font-normal' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {item.role}
              </span>
            )}
          </li>
        ))}
      </RefractionCard>
    </m.div>
  );
}
