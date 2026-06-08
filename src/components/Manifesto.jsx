import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Binary, Cpu } from 'lucide-react';
import RefractionCard from './RefractionCard';

const skillCategories = [
  {
    id: '01',
    title: 'VFX & Compositing',
    subtitle: '特效合成與美學把關',
    desc: '深厚駕馭 Autodesk Flame 高階合成系統，精準執行去背（Keying）、追蹤（Tracking）、數位擦除（Cleanup）及複雜修補；深度整合 2D 與 3D 數位元素，確保特效與實拍天衣無縫。',
    stats: [
      { name: 'Autodesk Flame Compositing', value: 98, code: 'FLAME_ONLINE' },
      { name: 'Cleanup, Keying & Tracking', value: 95, code: 'VFX_CLEANUP' },
      { name: '2D / 3D Element Integration', value: 96, code: 'SPACE_BLEND' },
    ],
    meta: 'FLAME.SYSTEM: ACTIVE // PORT: 7001'
  },
  {
    id: '02',
    title: 'Pipeline & Delivery',
    subtitle: '核心整合與製播輸出',
    desc: '統籌後期特效合成流程，完美鏈結剪輯與調光。在高壓且緊迫時程限制下，透過高規格的製程管理確保專案如期，輸出品質符合頂級商業與播映標準。',
    stats: [
      { name: 'Broadcast & Delivery Standards', value: 98, code: 'MASTER_OUTPUT' },
      { name: 'Post-Pipeline Integration', value: 95, code: 'WORKFLOW_ALIGN' },
      { name: 'High-Pressure Management', value: 92, code: 'DEADLINE_EXEC' },
    ],
    meta: 'PIPELINE.DELIVERY: ACTIVE // PORT: 7002'
  },
  {
    id: '03',
    title: 'Synergy & Translation',
    subtitle: '跨界轉譯與協作應變',
    desc: '敏銳穿梭於導演、代理商與客戶三方，將抽象指令轉譯為高效執行方案；以高 EQ 快速響應修改需求，主動提供優化建議並共創完美體驗。',
    stats: [
      { name: 'Director-Agency-Client Bridge', value: 97, code: 'THREE_WAY_SYNC' },
      { name: 'Collaboration & High EQ', value: 96, code: 'AGILE_RESPONSE' },
      { name: 'Visual Optimization Proposal', value: 91, code: 'CREATIVE_PITCH' },
    ],
    meta: 'COMMUNICATION.SYNERGY: ACTIVE // PORT: 7003'
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
          <div className="mono text-[6px] text-aurora-blue uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue animate-pulse" />
            01 // The Narrative & Skills
          </div>
          <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter glow-title text-white">
            用 <span className="text-white font-normal">極致合成</span> <br />
            架起 <span className="text-aurora-blue">溝通橋樑</span>
          </h2>
          <div className="space-y-8 text-info-gold-gray text-lg leading-relaxed font-light">
            <p>
              十三年的 <span className="text-white font-medium">VFX 視覺特效與 Flame 合成生涯</span>，磨練出我對光影折射、色彩科學與畫面美學的極致追求。對我而言，合成不只是將素材拼湊，更是重新賦予每個鏡頭生命力與故事溫度。
            </p>
            <p>
              在追求視覺巔峰的同時，我深知後期製作是一場不容出錯的高壓戰役。我以<span className="text-white font-medium">完整的跨領域溝通與整合能力</span>，在導演、藝術家、廣告代理商與客戶之間建立清晰、高效的轉譯語言，確保 300+ 隻廣告片從拍攝、剪接、調光到最終 Online 播帶的每一步均完美無瑕。
            </p>
            <p className="italic border-l-2 border-aurora-blue pl-6 py-2 text-zinc-300">
              「畫面是敲開感官的引信，而溝通是將想像落地的錨點。我們不只是合成像素，更在串聯每個創意的靈魂。」
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
                      <span className="mono text-[6px] text-aurora-blue uppercase tracking-widest block mb-1">
                        {activeCategory.meta}
                      </span>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {activeCategory.title}
                      </h3>
                    </div>
                    <div className="mono text-[6px] text-zinc-500 px-2.5 py-1 border border-border bg-zinc-950 rounded-sm flex items-center gap-1.5">
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
                        
                        <div className="mono text-[6px] text-zinc-650">
                          ADDR: 0x8A2C // REG: {stat.code}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 底部 HUD 裝飾 */}
                <div className="border-t border-border pt-5 mt-6 flex justify-between items-center mono text-[6px] text-zinc-500">
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
