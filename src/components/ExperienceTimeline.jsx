import React from 'react';
import { motion } from 'framer-motion';
import { careerHistory } from '../data/experience';

function TimelineColumn({ title, items, subtitle, badge }) {
  return (
    <div
      className="flex-1 rounded-[24px] p-6 sm:p-8 border border-white/[0.08] relative overflow-hidden backdrop-blur-xl group transition-all duration-500 hover:border-aurora-blue/30"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(12, 13, 14, 0.88) 100%)',
        boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 20px 40px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* 頂部裝飾角光 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-blue/5 rounded-full blur-2xl pointer-events-none group-hover:bg-aurora-blue/10 transition-colors duration-500" />

      {/* 欄位標頭 */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08] relative z-10">
        <div>
          <span className="text-aurora-blue text-[11px] mono tracking-[0.2em] font-semibold uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue animate-pulse" />
            //{subtitle}
          </span>
          <h3 className="text-2xl font-black text-white tracking-tight mt-1">
            {title}
          </h3>
        </div>
        <span className="mono text-[11px] px-2.5 py-1 rounded border border-white/[0.1] bg-white/[0.03] text-zinc-400 tracking-wider">
          {badge}
        </span>
      </div>

      {/* 時間軸清單 */}
      <ol className="relative border-l border-white/[0.12] ml-2.5 sm:ml-3 space-y-7 relative z-10">
        {items.map((item, idx) => (
          <li key={idx} className="ml-5 sm:ml-6 group/item relative">
            {/* 時間軸錨點 */}
            <span
              className={`absolute -left-[25px] sm:-left-[29px] top-1.5 w-3 h-3 rounded-full border transition-all duration-300 ${
                item.highlight
                  ? 'bg-aurora-blue border-white shadow-[0_0_14px_rgba(212,175,55,0.9)] scale-110'
                  : 'bg-zinc-800 border-zinc-500 group-hover/item:border-aurora-blue group-hover/item:bg-aurora-blue/70'
              }`}
            />

            {/* 時間與標籤 */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <time className="mono text-xs font-bold text-aurora-blue tracking-wider">
                {item.period}
              </time>
              {item.tag && (
                <span className="mono text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-zinc-400 group-hover/item:text-zinc-200 transition-colors">
                  {item.tag}
                </span>
              )}
            </div>

            {/* 機構/單位名稱 */}
            <h4 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight group-hover/item:text-white transition-colors">
              {item.title}
            </h4>

            {/* 角色/說明 */}
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-light leading-relaxed">
              {item.role}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ExperienceTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: 0.15 }}
      className="w-full mt-16 pt-12 border-t border-white/[0.08]"
    >
      {/* 區塊微型導引標題 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-[1px] w-8 bg-aurora-blue/60" />
        <span className="mono text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold">
          TRACK RECORD // 學經歷歷程
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
        <TimelineColumn
          title="實戰經歷"
          subtitle="EXPERIENCE"
          badge="4 STAGES"
          items={careerHistory.work}
        />
        <TimelineColumn
          title="專業養成"
          subtitle="EDUCATION"
          badge="FOUNDATION"
          items={careerHistory.education}
        />
      </div>
    </motion.div>
  );
}
