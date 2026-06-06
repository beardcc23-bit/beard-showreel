import React from 'react';
import { motion } from 'framer-motion';

export default function Manifesto() {
  const cards = [
    {
      domain: 'UI Design',
      version: 'v.2.0',
      title: '視覺系統與組件庫',
      desc: '專注於建立可擴展的 Design Tokens 系統，確保跨平台視覺一致性，並嚴格遵守 WCAG AA 可訪問性標準。',
    },
    {
      domain: 'UX Architecture',
      version: 'v.2.0',
      title: '交互路徑優化',
      desc: '透過 User Journey Mapping 識別摩擦點，利用微交互 (Micro-interactions) 強化系統反饋，降低用戶認知負荷。',
    },
    {
      domain: 'Visual Synthesis',
      version: 'v.13.0',
      title: '電影級視覺敘事',
      desc: '13 年 Flame 專業合成經驗，精通色彩科學、空間構圖與動態節奏，賦予數位產品極致的視覺張力。',
    },
  ];

  return (
    <section id="about" className="max-w-6xl mx-auto px-8 py-24">
      <div className="grid md:grid-cols-2 gap-24 items-center">
        {/* 左側：品牌文字宣言 */}
        <div className="space-y-12">
          <div className="mono text-xs text-aurora-blue uppercase tracking-[0.3em]">
            01 // The Narrative
          </div>
          <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter glow-title">
            從 <span className="text-zinc-600">視覺合成</span> <br />
            到 <span className="text-aurora-blue">體驗構建</span>
          </h2>
          <div className="space-y-8 text-info-gold-gray text-lg leading-relaxed font-light">
            <p>
              在電影工業頂尖的 Flame 特效合成領域深耕 13 年，我對『幀』的雕琢已融入本能。那是對每一像素光影邏輯、光學物理與色彩科學的絕對誠實。如今，我將這份對{' '}
              <span className="text-white font-medium">Pixel-Perfect</span> 的微米級精度，注入使用者體驗 (UX) 的架構中。
            </p>
            <p>
              我不再僅僅是合成視覺，而是透過嚴謹的{' '}
              <span className="text-white font-medium">資訊架構 (Information Architecture)</span> 與流暢的{' '}
              <span className="text-white font-medium">微交互原型迭代</span>，將複雜、生硬的業務邏輯，轉化為毫无摩擦、低認知負荷的極致直覺界面。
            </p>
            <p className="italic border-l-2 border-aurora-blue pl-6 py-2 text-zinc-300">
              「視覺是敲開感官的引信，而邏輯是留住心靈的錨點。我們不只是創造畫面，更在構建會呼吸的數位生態。」
            </p>
          </div>
        </div>

        {/* 右側：卡片列表 */}
        <div className="grid grid-cols-1 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.domain}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ scale: 1.02 }}
              className="tech-card p-8 rounded-sm cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="mono text-[10px] uppercase text-aurora-blue font-bold tracking-widest">
                  Domain: {card.domain}
                </span>
                <span className="text-zinc-600 text-[10px] mono">{card.version}</span>
              </div>
              <p className="text-white font-bold text-xl mb-3 group-hover:text-aurora-blue transition-colors duration-300">
                {card.title}
              </p>
              <p className="text-xs text-info-gold-gray leading-relaxed tracking-wide font-light">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
