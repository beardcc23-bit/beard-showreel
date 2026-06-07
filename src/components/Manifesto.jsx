import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Binary, Cpu } from 'lucide-react';
import RefractionCard from './RefractionCard';

const skillCategories = [
  {
    id: '01',
    title: 'Visual Synthesis',
    subtitle: '視覺合成與動態美學',
    desc: '13 年電影級 Flame 特效合成背景，擅長光學折射、流體動力學與三維幾何在二維螢幕上的完美重組。',
    stats: [
      { name: 'Flame / VFX Compositing', value: 98, code: 'FLAME_RENDER' },
      { name: '3D Sequence Crafting', value: 92, code: 'POLY_SEQ_v3' },
      { name: 'Color Science & Specularity', value: 95, code: 'HDR_OPTICAL' },
    ],
    meta: 'CORE.MODULE: ACTIVE // PORT: 7001'
  },
  {
    id: '02',
    title: 'UX Architecture',
    subtitle: '體驗架構與系統邏輯',
    desc: '注重形式與功能的絕對統一。利用資訊架構（IA）解構用戶痛點，建立高效率、低認知負荷的微互動。',
    stats: [
      { name: 'Information Architecture', value: 90, code: 'INFO_ROUTING' },
      { name: 'Interactive Prototyping', value: 94, code: 'UX_LOGIC_PROTO' },
      { name: 'Design Token Systems', value: 88, code: 'TOKEN_REGISTRY' },
    ],
    meta: 'UX.MODULE: ACTIVE // PORT: 7002'
  },
  {
    id: '03',
    title: 'Creative Front-End',
    subtitle: '創意前端與互動特效',
    desc: '拒絕平庸的靜態網頁。使用 React / Vite / Framer Motion 等技術，將高端視覺理念完美還原在瀏覽器中。',
    stats: [
      { name: 'React / Next.js Ecosystem', value: 91, code: 'DOM_VIRTUAL' },
      { name: 'Vite / Fast Build Tooling', value: 95, code: 'VITE_COMPILER' },
      { name: 'Framer Motion Mechanics', value: 96, code: 'SPRING_ENGINE' },
    ],
    meta: 'DEV.MODULE: ACTIVE // PORT: 7003'
  }
];

export default function Manifesto() {
  const [activeTab, setActiveTab] = useState('01');
  const activeCategory = skillCategories.find(cat => cat.id === activeTab) || skillCategories[0];

  return (
    <section id="about" className="max-w-6xl mx-auto px-8 py-24 relative border-t border-border">
      {/* 網格裝飾背景 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center relative z-10">
        {/* 左側：品牌文字宣言 */}
        <div className="md:col-span-6 space-y-12">
          <div className="mono text-xs text-aurora-blue uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue animate-pulse" />
            01 // The Narrative & Skills
          </div>
          <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter glow-title text-white">
            從 <span className="text-white font-normal">視覺合成</span> <br />
            到 <span className="text-aurora-blue">體驗構建</span>
          </h2>
          <div className="space-y-8 text-info-gold-gray text-lg leading-relaxed font-light">
            <p>
              十三年的 <span className="text-white font-medium">Flame 特效生涯</span>，讓雕琢影格成為我的呼吸。那是對每一影格的光影與物理科學，最誠實的致敬。
            </p>
            <p>
              如今，我帶著這份對專業級的執著，跨界重構 <span className="text-white font-medium whitespace-nowrap">使用者體驗（UX）</span>。不再拘泥於畫面的完美，我用嚴謹的 <span className="text-white font-medium">資訊架構</span> 為骨幹、<span className="text-white font-medium">微交互</span> 為血肉，將複雜的業務邏輯，精煉為毫無摩擦的極致直覺。
            </p>
            <p className="italic border-l-2 border-aurora-blue pl-6 py-2 text-zinc-300">
              「視覺是敲開感官的引信，而邏輯是留住心靈的錨點。我們不只是創造畫面，更在構建會呼吸的數位生態。」
            </p>
          </div>
        </div>

        {/* 右側：整合的小型 HUD 技能進度條面板 */}
        <div className="md:col-span-6 flex flex-col h-full">
          {/* 微型 Tabs 切換 */}
          <div className="flex gap-2 mb-4">
            {skillCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2.5 text-[10px] mono tracking-widest font-black uppercase transition-all duration-300 border rounded-sm ${
                  activeTab === cat.id
                    ? 'border-aurora-blue text-black bg-aurora-blue shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                    : 'border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950/20'
                }`}
              >
                {cat.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* HUD 面板卡片 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <RefractionCard className="bg-zinc-950/40 backdrop-blur-md border border-border rounded-sm p-6 md:p-8 flex flex-col justify-between min-h-[380px] shadow-2xl">
                {/* 面板頂部資訊 */}
                <div>
                  <div className="flex justify-between items-center border-b border-border pb-5 mb-6">
                    <div>
                      <span className="mono text-[9px] text-aurora-blue uppercase tracking-widest block mb-1">
                        {activeCategory.meta}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {activeCategory.title}
                      </h3>
                    </div>
                    <div className="mono text-[8px] text-zinc-500 px-2.5 py-1 border border-border bg-zinc-950 rounded-sm flex items-center gap-1.5">
                      <Cpu size={10} className="text-aurora-blue" />
                      OPTIMAL
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-xs text-zinc-400 font-light leading-relaxed mb-6">
                    {activeCategory.desc}
                  </p>

                  {/* 進度條 */}
                  <div className="space-y-5">
                    {activeCategory.stats.map((stat, i) => (
                      <div key={stat.name} className="space-y-1.5">
                        <div className="flex justify-between items-end text-[10px]">
                          <span className="font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Binary size={10} className="text-aurora-blue" />
                            {stat.name}
                          </span>
                          <span className="mono font-bold text-aurora-blue">{stat.value}%</span>
                        </div>
                        
                        {/* 條體 */}
                        <div className="h-1.5 w-full bg-zinc-900/80 border border-border rounded-full overflow-hidden p-[1px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.08 }}
                            className="h-full rounded-full bg-aurora-blue shadow-[0_0_6px_var(--color-aurora-blue)]"
                          />
                        </div>
                        
                        <div className="mono text-[8px] text-zinc-650">
                          ADDR: 0x8A2C // REG: {stat.code}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部 HUD 裝飾 */}
                <div className="border-t border-border pt-5 mt-6 flex justify-between items-center mono text-[8px] text-zinc-500">
                  <span>SYS_TEMP: 38.2°C // VOLT: 1.2V</span>
                  <span className="flex items-center gap-1">
                    <Terminal size={8} className="text-aurora-blue animate-pulse" />
                    SHELL: ZSH // AGENT: ACTIVE
                  </span>
                </div>
              </RefractionCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
