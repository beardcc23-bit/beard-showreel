import React from 'react';
import { motion } from 'framer-motion';

export default function Introduction() {
  return (
    <section id="introduction" className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden border-t border-zinc-900 bg-bg-core/60">
      {/* 網格背景與漸層 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-8 text-center relative z-10 flex flex-col items-center">
        {/* 呼吸感狀態點綴 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mono text-xs text-aurora-blue uppercase tracking-[0.5em] mb-8 opacity-80 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-aurora-blue animate-ping" />
          SYSTEM_STATUS : OPTIMAL // ARCHIVE_ACTIVE
        </motion.div>
        
        {/* 精緻標題 */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-12 leading-none glow-title"
        >
          Beard <br /> <span className="text-aurora-blue">Showreel</span>
        </motion.h2>
        
        {/* 精雕文案 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-lg md:text-2xl font-light text-zinc-400 max-w-3xl mx-auto mb-16 leading-relaxed tracking-wide"
        >
          以 13 年 Flame 電影級特效合成之極致微米精度，解構並重塑數位產品的交互靈魂。<br />
          <span className="text-white font-medium">我們在三維光影與二維邏輯的交界處，為您構建直覺、流暢且具備感官震撼力的次世代數位互動。</span>
        </motion.p>

        {/* 霓虹光感按鈕組 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
        >
          <a
            href="#uiux"
            className="prism-button px-12 py-5 text-black font-bold rounded-sm uppercase text-xs tracking-[0.2em] text-center"
          >
            探索設計系統
          </a>
          <button
            onClick={() => window.open('https://www.youtube.com/watch?v=s6s2p87fPdA&t=1s', '_blank')}
            className="px-12 py-5 border border-zinc-700 hover:border-aurora-blue text-white font-bold rounded-sm transition-all duration-300 uppercase text-xs tracking-[0.2em] bg-transparent"
          >
            觀看合成作品集
          </button>
        </motion.div>
      </div>
    </section>
  );
}
