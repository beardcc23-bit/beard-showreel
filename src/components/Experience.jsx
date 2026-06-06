import React from 'react';
import { motion } from 'framer-motion';

export default function Experience({ onOpenProject }) {
  const projects = [
    {
      id: '01',
      title: '智慧家居控制系統',
      category: 'UX Architecture / Prototyping',
      problem: '使用者在管理大量不同品牌的 IoT 設備時，面臨控制介面支離破碎、層級過深，以及不同情境切換時極高的認知負荷（Cognitive Load）。',
      solution: '重新梳理資訊架構（IA），引入「層次化情境觸發」與「動態組件卡片」設計。透過優化交互路徑，將日常最常使用的情境（如離家、劇院模式）提取至首頁觸發，並以平滑微交互引導操作反饋，成功減少 40% 的平均操作時間。',
      tags: ['UX Design', 'Information Architecture', 'Prototyping', 'System Logic'],
      gradient: 'from-blue-600/40 via-indigo-900/60 to-bg-core',
      decor: '智能控制 // IoT_MATRIX_v2.0',
    },
    {
      id: '02',
      title: '電商美學-高端品牌體驗',
      category: 'Visual Design / Design System',
      problem: '高端品牌電商在追求極致的「留白藝術感」與「極簡美學」的同時，往往容易犧牲引導性，導致核心選單難以發現、轉單路徑摩擦過大。',
      solution: '構建一套基於 Design Tokens 的跨平台視覺設計系統，確保在極簡的留白排版中擁有高度一致的比例與排版。利用極其精確的微互動（Micro-interactions）與微妙的網格漸層引導使用者的視覺流向，在維持品牌高端調性的同時，顯著提升了導航效率與轉單率。',
      tags: ['Visual Design', 'Design Systems', 'Micro-interactions', 'Brand Strategy'],
      gradient: 'from-pink-600/30 via-purple-900/60 to-bg-core',
      decor: '極簡美學 // AESTHETIC_CORE_v1.1',
    },
  ];

  return (
    <section id="uiux" className="bg-zinc-100 text-black py-24 relative overflow-hidden">
      {/* 背景點狀裝飾 */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-6xl mx-auto px-8 relative z-10">
        {/* 標頭 */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-3xl">
            <div className="mono text-xs text-zinc-500 mb-6 uppercase tracking-[0.3em]">
              02 // Experience Design
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-black">
              Surgical <span className="text-zinc-400">Precision</span>
              <br />
              In Interaction
            </h2>
          </div>
          <div className="hidden md:block text-right max-w-xs">
            <p className="text-sm text-zinc-500 font-light italic leading-relaxed">
              將 13 年的視覺直覺轉化為可度量的設計決策，追求形式與功能的絕對統一。
            </p>
          </div>
        </div>

        {/* 專案卡片列表 */}
        <div className="grid md:grid-cols-2 gap-20">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              onClick={() => onOpenProject(project)}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="group cursor-pointer"
            >
              {/* 高階漸層卡片封面代替 Placeholder */}
              <div className="aspect-video rounded-sm mb-10 overflow-hidden border border-zinc-200 bg-zinc-950 relative flex items-center justify-center shadow-lg transition-all duration-500 group-hover:shadow-xl group-hover:border-zinc-400">
                <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute inset-0 grid-bg opacity-30" />
                
                {/* 科技感點綴 */}
                <div className="absolute inset-x-6 top-6 flex justify-between items-center z-10 mono text-[9px] text-zinc-400">
                  <span>SYSTEM // ONLINE</span>
                  <span>{project.decor}</span>
                </div>
                
                {/* 精密十字線條 */}
                <div className="absolute inset-8 border border-zinc-800/40 pointer-events-none z-10 flex items-center justify-center">
                  <div className="w-4 h-[1px] bg-zinc-700/60 absolute" />
                  <div className="h-4 w-[1px] bg-zinc-700/60 absolute" />
                </div>

                {/* 點選提示 */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                  <span className="mono text-[10px] text-white bg-black px-4 py-2 border border-white tracking-widest font-black uppercase shadow-lg">
                    Read Case Study
                  </span>
                </div>

                <div className="absolute top-4 right-4 mono text-[10px] bg-white px-2 py-1 text-black border border-black z-30">
                  case_{project.id}.fig
                </div>
              </div>

              <h3 className="text-3xl font-black mb-6 group-hover:translate-x-3 transition-transform duration-300 tracking-tight text-black">
                {project.title}
              </h3>
              
              <div className="space-y-6 text-zinc-600 mb-8 font-light leading-relaxed">
                <p className="text-sm">
                  <strong className="text-black font-bold uppercase text-[10px] tracking-widest block mb-1">
                    Problem:
                  </strong>{' '}
                  {project.problem}
                </p>
              </div>

              <div className="flex gap-4">
                {project.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-3 py-1 bg-black text-white font-bold uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
