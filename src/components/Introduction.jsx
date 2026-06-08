import React from 'react';
import { motion } from 'framer-motion';

export default function Introduction({ onPlayVideo }) {
  return (
    <section id="introduction" className="relative min-h-screen flex items-center justify-center py-24 border-t border-zinc-900 bg-bg-core/60">
      {/* 網格背景與漸層 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">
          
          {/* 左側：文字與按鈕 */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
            
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
              className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none glow-title"
            >
              Beard <span className="text-aurora-blue">Chou</span>
            </motion.h2>

            {/* 行動裝置專用照片 (大標題正下方，大螢幕隱藏) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="block md:hidden my-8 w-full max-w-[280px]"
            >
              <div className="gold-flow-border aspect-[888/1024] transition-all duration-700 ease-out origin-center hover:rotate-[13deg] hover:scale-105">
                <div className="gold-flow-inner w-full h-full">
                  <img
                    src="/avatar.jpg"
                    alt="Beard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
            
            {/* 精雕文案 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-zinc-300 text-base md:text-lg font-light leading-relaxed tracking-wide mb-12"
            >
              <span className="text-white font-medium">十三年的頂尖視覺特效與 Flame 合成深耕</span>，賦予我對每一影格光影物理的絕對掌控；多年的跨界協作，則淬煉出我對複雜製程需求的敏銳度。
              <br />
              <br />
              我不只用電影級的畫面實力與合成美感驚艷感官，更用<span className="text-aurora-blue font-medium">完整且清晰的跨界溝通力</span>，在導演、客戶與技術團隊之間架起最穩固的橋樑，將每個驚艷的創意精準落地。
            </motion.p>

            {/* 霓虹光感按鈕組 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full flex justify-center md:justify-start"
            >
              <button
                onClick={() => onPlayVideo('s6s2p87fPdA')}
                className="prism-button px-16 py-5 text-black font-bold rounded-sm uppercase text-xs tracking-[0.2em] text-center w-full sm:w-auto"
              >
                觀看作品集
              </button>
            </motion.div>
          </div>

          {/* 右側：照片區 (含金色流光) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex md:col-span-5 justify-center md:justify-end w-full"
          >
            <div className="gold-flow-border w-[280px] sm:w-[320px] md:w-[350px] aspect-[888/1024] transition-all duration-700 ease-out origin-center hover:rotate-[13deg] hover:scale-105">
              <div className="gold-flow-inner w-full h-full">
                <img
                  src="/avatar.jpg"
                  alt="Beard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
