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
    title: 'Editing & Color',
    subtitle: '剪接調色',
    desc: '熟練掌握後期製程中的剪輯節奏與色彩科學，鏈結前后期工作流。在緊迫的商業專案時程下，提供精準的色域轉換、影音對齊與高品質播映規格輸出。',
    stats: [
      { name: 'Timeline Editing & Rhythm', value: 93, code: 'TIMELINE_CUT' },
      { name: 'Color Grading & Science', value: 91, code: 'COLOR_GRADE' },
      { name: 'Broadcast Mastering Standards', value: 94, code: 'MASTER_OUTPUT' },
    ],
    meta: 'PIPELINE.COLOR: ACTIVE // PORT: 7002'
  },
  {
    id: '03',
    title: 'AI Capabilities',
    subtitle: 'AI能力',
    desc: '積極探索並實踐 generative AI 工具在後期特效與創意開發中的潛能。將 AI 去背、擴圖、超解析度與生成式元素無縫整合入傳統 VFX 管線，倍增生產效率。',
    stats: [
      { name: 'Generative AI Integration', value: 90, code: 'AI_FLOW_SYNC' },
      { name: 'AI Upscaling & Inpainting', value: 92, code: 'INPAINT_UPSCAL' },
      { name: 'Prompt-to-Asset Pipeline', value: 88, code: 'PROMPT_ASSET' },
    ],
    meta: 'AI.COGNITIVE: ACTIVE // PORT: 7003'
  }
];

export default function Manifesto() {
  const [activeTab, setActiveTab] = useState('01');
  const activeCategory = skillCategories.find(cat => cat.id === activeTab) || skillCategories[0];

  return (
    <section id="about" className="max-w-6xl mx-auto px-8 py-24 relative border-t border-border">
      {/* 網格裝飾背景 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="relative z-10">
        {/* 頂部：標題區 */}
        <div className="text-center mb-16 relative z-10">
          <div className="mono text-[6px] text-aurora-blue mb-6 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue animate-pulse" />
            01 // The Narrative & Skills
          </div>
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title text-white">
            The <span className="text-aurora-blue">Manifesto</span>
          </h2>
          <p className="text-zinc-300 font-light max-w-2xl mx-auto text-lg leading-relaxed">
            用極致合成 架起溝通橋樑
          </p>
        </div>

        {/* 內容區：左右對齊，items-start 使右側卡片完美對齊左側首段段落上方 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* 左側：品牌文字宣言 */}
          <div className="md:col-span-6 space-y-8 text-info-gold-gray text-lg leading-relaxed font-light">
            <p>
              在後期合成的視界裡，每一個像素都關乎物理真實與美學底蘊。我將十餘年對光影折射、色彩科學與幾何運動的感知，融入 <span className="text-white font-medium">Autodesk Flame 高階合成系統</span>。特效不只是數位元素的堆疊，更是以極致的細節，在虛實之間重塑故事的靈魂。
            </p>
            <p>
              完美的後期製作是一場將抽象想像落地的嚴謹戰役。我立足於技術最前端，用清晰、高效的轉譯語言，將導演的藝術想像、代理商的商業策略與客戶的期待完美收斂，在追逐極致畫面的同時，以堅實的整合管線讓每件作品順暢著陸。
            </p>
            <p>
              面對這個 AI 時代，我也不停嘗試使用 AI 技能，將先進的智慧輔助技術融入傳統合成流程，以更高的效率與敏銳的視覺直覺，探索影音後期創作的全新邊界。
            </p>
            <p className="italic border-l-2 border-aurora-blue pl-6 py-2 text-zinc-300">
              「科技在於加速想像力的落地，而合成師則是守候在終點線前的藝術封裝者。我們重塑像素，更在串聯每個創意的生命力。」
            </p>
          </div>

          {/* 右側：整合的小型 HUD 技能進度條面板 */}
          <div className="md:col-span-6 flex flex-col">
          {/* 微型 Tabs 切換 */}
          <div className="flex gap-2 mb-4">
            {skillCategories.map((cat) => {
              const labelMap = {
                '01': { eng: 'VFX', zht: '特效合成' },
                '02': { eng: 'EDITING', zht: '剪接調色' },
                '03': { eng: 'AI SKILLS', zht: 'AI能力' }
              };
              const label = labelMap[cat.id];
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-4 py-2 flex flex-col items-center justify-center text-center transition-all duration-300 border rounded-sm min-w-[90px] leading-none ${
                    activeTab === cat.id
                      ? 'border-aurora-blue text-black bg-aurora-blue shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                      : 'border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950/20'
                  }`}
                >
                  <span className={`text-[6px] mono tracking-widest uppercase mb-0.5 ${
                    activeTab === cat.id ? 'text-black/70' : 'text-zinc-500'
                  }`}>{label.eng}</span>
                  <span className="text-[10px] font-normal tracking-wider">{label.zht}</span>
                </button>
              );
            })}
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
                      <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-baseline gap-2 flex-wrap">
                        <span>{activeCategory.title}</span>
                        <span className="text-[10px] text-zinc-400 font-normal normal-case tracking-wide">// {activeCategory.subtitle}</span>
                      </h3>
                    </div>
                    <div className="mono text-[6px] text-zinc-500 px-2.5 py-1 border border-border bg-zinc-950 rounded-sm flex items-center gap-1.5">
                      <Cpu size={10} className="text-aurora-blue" />
                      OPTIMAL
                    </div>
                  </div>

                  {/* 描述 */}
                  <p className="text-lg text-info-gold-gray font-light leading-relaxed mb-6">
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
    </div>
  </section>
  );
}
