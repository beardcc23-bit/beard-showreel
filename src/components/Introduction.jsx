import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import RefractionCard from './RefractionCard';

function AnimatedCounter({ value, trigger, duration = 1.5 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

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
  }, [trigger, value, duration]);

  return <span>{count}</span>;
}

export default function Introduction({ onPlayVideo }) {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" });

  return (
    <section id="introduction" className="relative min-h-screen flex items-center justify-center py-24 bg-bg-core/60">
      {/* 網格背景與漸層 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-16 xl:gap-20 items-center">

          {/* 左側：文字與按鈕 */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">

            {/* 精緻標題 */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-[44px] sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 leading-none glow-title whitespace-nowrap"
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
              <div className="gold-flow-border aspect-[3/4] transition-all duration-700 ease-out origin-center hover:rotate-[13deg] hover:scale-105">
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
              重力與空氣的流動、光線穿透塵埃的折射軌跡、人物肌膚的毛孔質感——這些構築真實感的微小物理，是我畫面創作的日常。
              <br />
              <br />
              最極致的合成特效，往往不著痕跡。在長期與頂級品牌合作的洗禮下，我立足於感性與理性之間 —— 精準收攏導演天馬行空的想像，在有限時程內交付無可挑剔的商業影片。


            </motion.p>

            {/* 實戰成就數據面板 */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-2xl mb-12"
            >
              <RefractionCard
                className="flex justify-around w-full py-6 px-2 md:px-8 text-center backdrop-blur-2xl border border-white/[0.1] rounded-[24px] shadow-2xl relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 50%, rgba(0, 0, 0, 0.65) 100%)',
                  backgroundColor: 'rgba(6, 6, 6, 0.45)',
                  boxShadow: 'inset 0 1.5px 1.5px rgba(255, 255, 255, 0.25), inset 0 15px 30px rgba(255, 255, 255, 0.02), 0 30px 60px rgba(0, 0, 0, 0.55)'
                }}
              >
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex flex-col lg:flex-row items-center lg:items-baseline justify-center">
                    <div>
                      <AnimatedCounter value={13} trigger={statsInView} />+
                    </div>
                    <span className="text-aurora-blue text-[9px] font-semibold tracking-wider mono mt-1 lg:mt-0 lg:ml-1">//Years</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2 mono">
                    後期資歷
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center relative z-10 translate-x-[2px] md:translate-x-0">
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex flex-col lg:flex-row items-center lg:items-baseline justify-center">
                    <div>
                      <AnimatedCounter value={300} trigger={statsInView} />+
                    </div>
                    <span className="text-aurora-blue text-[9px] font-semibold tracking-wider mono mt-1 lg:mt-0 lg:ml-1">//Campaigns</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2 mono">
                    廣告專案
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="text-3xl md:text-4xl font-black text-white tracking-tight glow-text flex flex-col lg:flex-row items-center lg:items-baseline justify-center">
                    <div>
                      <AnimatedCounter value={1000} trigger={statsInView} />+
                    </div>
                    <span className="text-aurora-blue text-[9px] font-semibold tracking-wider mono mt-1 lg:mt-0 lg:ml-1">//Versions</span>
                  </div>
                  <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2 mono">
                    播放版本
                  </div>
                </div>
              </RefractionCard>
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
                SHOWREEL
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
            <div className="gold-flow-border w-[280px] sm:w-[320px] md:w-[350px] aspect-[3/4] transition-all duration-700 ease-out origin-center hover:rotate-[13deg] hover:scale-105">
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
