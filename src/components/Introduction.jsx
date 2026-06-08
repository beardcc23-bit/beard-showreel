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
              className="text-zinc-300 text-sm md:text-base font-light leading-relaxed tracking-wide mb-8 text-left"
            >
              身為<span className="text-white font-medium">特效合成師 (VFX Compositing Artist)</span>，在 13 年的職業生涯中，我執行並見證了超過 300 隻商業廣告片的誕生。從前期的拍攝、剪接、調光，到最終在我手中執行的 Online 合成、去背（Keying）、修圖、特效融合與字幕動態。我深知在後期製程中，每一步都關乎完美的播映品質，絕不容許任何出錯。
              <br />
              <br />
              我不只用細緻的光影美感與技術底蘊把關畫面，更穿梭於導演、廣告代理商與客戶之間，擔任<span className="text-aurora-blue font-medium">最清晰的溝通轉譯橋樑</span>，解決製程中的所有棘手問題，確保作品高質量地登上電視與網路大螢幕。
            </motion.p>

            {/* 實戰成就數據面板 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-3 gap-6 w-full max-w-lg mb-12 border-y border-zinc-800/80 py-6 text-left"
            >
              <div>
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex items-baseline gap-1">
                  13<span className="text-aurora-blue text-xs font-bold mono">//Years</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  後期資歷
                </div>
              </div>
              <div className="border-x border-zinc-800/80 px-6">
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex items-baseline gap-1">
                  300+<span className="text-aurora-blue text-xs font-bold mono">//Spots</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  執行廣告量
                </div>
              </div>
              <div className="pl-2">
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex items-baseline gap-1">
                  0<span className="text-aurora-blue text-xs font-bold mono">//Errors</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  播映失誤率
                </div>
              </div>
            </motion.div>

            {/* 霓虹光感按鈕組 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.25 }}
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
