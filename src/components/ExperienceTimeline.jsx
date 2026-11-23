import React from 'react';
import { m } from 'framer-motion';
import { careerHistory } from '../data/experience';

/**
 * 電影演職員表風格履歷列表 (Film Credits Sheet)
 * - 移除厚重圓角玻璃盒，改以 1px 精密水平線、tabular-nums 時間碼與懸停漫射微光構成
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
      <div className="flex items-center justify-between mb-6">
        <span className="mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
          CAREER &amp; EDUCATION CHRONOLOGY
        </span>
      </div>

      <ol className="optical-surface px-6 sm:px-8 py-2 divide-y divide-white/[0.10]">
        {careerHistory.map((item, idx) => (
          <li
            key={idx}
            className="group relative grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-6 py-5 sm:items-baseline transition-colors duration-300 hover:bg-white/[0.03] px-2 -mx-2"
          >
            {/* 左側懸停朱紅光標 */}
            <span
              aria-hidden="true"
              className={`hidden sm:block absolute left-0 inset-y-2 w-[2px] transition-opacity duration-300 ${
                item.highlight ? 'bg-spectral-crimson opacity-100' : 'bg-spectral-cyan opacity-0 group-hover:opacity-100'
              }`}
            />

            <time className="mono text-xs sm:text-sm text-zinc-400 tabular-nums tracking-wider sm:col-span-3 sm:pl-3">
              {item.period}
            </time>

            <h4
              className={`text-base sm:text-lg tracking-tight sm:col-span-5 transition-colors ${
                item.highlight ? 'font-semibold text-white' : 'font-normal text-zinc-200 group-hover:text-white'
              }`}
            >
              {item.title}
            </h4>

            {item.role && (
              <span
                className={`text-xs sm:text-sm sm:col-span-4 sm:text-right font-light ${
                  item.highlight ? 'text-spectral-crimson font-normal' : 'text-zinc-400'
                }`}
              >
                {item.role}
              </span>
            )}
          </li>
        ))}
      </ol>
    </m.div>
  );
}
