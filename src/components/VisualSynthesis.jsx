import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function VisualSynthesis({ onPlayVideo }) {
  const cards = [
    {
      id: 'showreel',
      title: 'Showreel 2026',
      subtitle: '視覺特效合成作品精選',
      videoId: 's6s2p87fPdA',
      gradient: 'from-cyan-500/20 via-blue-900/50 to-bg-core',
      label: 'Showreel 2026',
      tag: 'Flame Synthesis',
    },
    {
      id: 'commercial',
      title: 'Commercial Synthesis',
      subtitle: '高階商業影視廣告合成',
      videoId: 's6s2p87fPdA',
      gradient: 'from-emerald-500/20 via-teal-900/50 to-bg-core',
      label: 'Commercial Reel',
      tag: 'VFX Compositing',
    },
    {
      id: 'chromatic',
      title: 'Chromatic Mastery',
      subtitle: '色彩科學與專業調色校正',
      videoId: 's6s2p87fPdA',
      gradient: 'from-amber-500/20 via-orange-950/50 to-bg-core',
      label: 'Color Grading',
      tag: 'Color Science',
    },
  ];

  return (
    <section id="vfx" className="max-w-6xl mx-auto px-8 py-24">
      {/* 標頭 */}
      <div className="text-center mb-24">
        <div className="mono text-xs text-aurora-blue mb-6 uppercase tracking-[0.3em]">
          03 // Visual Synthesis
        </div>
        <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title">
          The <span className="text-aurora-blue">Synthesis</span>
        </h2>
        <p className="text-zinc-500 font-light max-w-2xl mx-auto text-lg leading-relaxed">
          13 年 Flame 合成經驗，將影像處理的極限精準度，轉化為跨次元的視覺敘事力。
        </p>
      </div>

      {/* 影片卡片網格 */}
      <div className="grid md:grid-cols-3 gap-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            onClick={() => onPlayVideo(card.videoId)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            whileHover={{ scale: 1.02 }}
            className="tech-card group relative aspect-video rounded-sm overflow-hidden cursor-pointer bg-zinc-950"
          >
            {/* 電影感科幻漸層底圖代替 Placeholder */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-20 transition-opacity duration-500`} />
            <div className="absolute inset-0 grid-bg opacity-20" />
            
            {/* 播放按鈕 Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-20">
              <div className="prism-button text-black p-4 rounded-full scale-75 group-hover:scale-100 transition duration-300">
                <Play size={20} fill="currentColor" />
              </div>
            </div>

            {/* 科技感點綴文字 */}
            <div className="absolute top-4 right-4 mono text-[8px] text-zinc-500 tracking-widest uppercase">
              // {card.tag}
            </div>

            {/* 底部文字標籤 */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col">
              <span className="mono text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-1 backdrop-blur-sm border border-zinc-800 text-white">
                {card.label}
              </span>
              <span className="text-[10px] text-zinc-400 mt-2 font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {card.subtitle}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 底部歸檔連結按鈕 */}
      <div className="mt-24 text-center">
        <button
          onClick={() => onPlayVideo('s6s2p87fPdA')}
          className="inline-block px-14 py-5 border border-zinc-800 text-zinc-500 hover:text-white hover:border-aurora-blue transition-all duration-300 mono text-xs uppercase tracking-widest bg-transparent"
        >
          Access Synthesis Archive →
        </button>
      </div>
    </section>
  );
}
