import React from 'react';
import { motion } from 'framer-motion';
import RefractionCard from './RefractionCard';
import { careerHistory } from '../data/experience';

export default function ExperienceTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8 }}
      className="w-full mt-16 pt-10 border-t border-white/[0.08]"
    >
      <RefractionCard
        className="w-full rounded-[24px] p-6 sm:p-10 border border-white/[0.1] relative overflow-hidden group transition-colors duration-500 hover:border-aurora-blue/30"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(0, 0, 0, 0.88) 100%)',
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          boxShadow: 'inset 0 1.5px 1.5px rgba(255, 255, 255, 0.25), inset 0 15px 30px rgba(255, 255, 255, 0.02), 0 30px 60px rgba(0, 0, 0, 0.55)'
        }}
      >
        {/* 背景環境微光 (以 radial-gradient 取代 blur-3xl，零 GPU 濾鏡開銷) */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)' }}
        />

        {/* 整合單一時間軸列表 */}
        <ol className="relative border-l border-white/[0.12] ml-3 sm:ml-4 space-y-7 sm:space-y-8 relative z-10">
          {careerHistory.map((item, idx) => (
            <li key={idx} className="ml-6 sm:ml-8 group/item relative">
              {/* 節點錨點 */}
              <span
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border transition-colors duration-300 ${
                  item.highlight
                    ? 'bg-aurora-blue border-white shadow-[0_0_14px_rgba(212,175,55,0.9)] scale-110'
                    : 'bg-zinc-800 border-zinc-500 group-hover/item:border-aurora-blue group-hover/item:bg-aurora-blue/70'
                }`}
              />

              {/* 內容行 */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4">
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <h4 className="font-sans text-base sm:text-lg font-bold text-zinc-100 tracking-tight group-hover/item:text-white transition-colors">
                    {item.title}
                  </h4>
                  {item.role && (
                    <span className="text-xs sm:text-sm text-zinc-400 font-light">
                      {item.role}
                    </span>
                  )}
                </div>

                <time className="mono text-xs sm:text-sm font-bold text-aurora-blue tracking-wider shrink-0 order-first sm:order-last">
                  {item.period}
                </time>
              </div>
            </li>
          ))}
        </ol>
      </RefractionCard>
    </motion.div>
  );
}
