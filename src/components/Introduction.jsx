import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ value, duration = 1.5 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

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
              身為資深特效合成師 (VFX Compositing Artist / D1)，在 13 年的職涯淬鍊中，我親手護航並見證了超過 300 支頂級商業廣告的誕生。從前期的實拍、剪輯、調光，到最終由我Online 、精準去背、數位修復、虛實融合與動態視覺。我深知在後期製程的終點線前，每一步都關乎製播品質的絕對完美，容不得絲毫差池。
              <br />
              <br />
              我不僅以敏銳的光影美感與技術底蘊封裝視覺，更穿梭於導演、廣告代理商與品牌主之間，擔任核心的「技術與創意轉譯橋樑」。我擅長排解製程中的繁複瓶頸，確保每一件作品皆以最高規格，完美跨螢登陸電視與數位全媒體。
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
                  <AnimatedCounter value={13} />+<span className="text-aurora-blue text-xs font-bold mono">//Years</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  後期資歷
                </div>
              </div>
              <div className="border-x border-zinc-800/80 px-6">
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex items-baseline gap-1">
                  <AnimatedCounter value={300} />+<span className="text-aurora-blue text-xs font-bold mono">//Campaigns</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  廣告專案
                </div>
              </div>
              <div className="pl-2">
                <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex items-baseline gap-1">
                  <AnimatedCounter value={1000} />+<span className="text-aurora-blue text-xs font-bold mono">//Versions</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1.5 mono">
                  播放版本
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
