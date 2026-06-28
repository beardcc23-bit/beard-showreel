import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Binary, Cpu } from 'lucide-react';
import RefractionCard from './RefractionCard';

const lawCategories = [
  {
    id: '01',
    title: 'CHROMA KEYING',
    subtitle: '綠幕去背合成',
    meta: 'SYSTEM.CHROMA: KEY_EXTRACTION // MATTE: ACTIVE',
    quote: '「無痕去背的關鍵，在於邊緣的光影與溢色折射。」',
    desc: '綠幕去背與合成不只是套用濾鏡。它考量頭髮邊緣的透明度、場景的溢色（Green Spill）消除，以及實拍人物與背景之間的景深與光線流向。我只做一件事：重塑髮絲極致細節，重建完美的物理邊界。',
    params: [
      { key: '茶飲品牌形象廣告', value: '精細還原代言人飄逸髮絲邊緣，並完美濾除綠幕溢色，讓人物無縫融入大自然茶園天光。' },
      { key: '科技跑車宣傳片', value: '處理大面積綠幕去背與車身玻璃反射，精準合成霓虹賽博朋克街景，重現動態溢光。' }
    ]
  },
  {
    id: '02',
    title: 'BEAUTY RETOUCHING',
    subtitle: '人物美體膚質精修',
    meta: 'SYSTEM.RETOUCH: FACE_TRACKING // SKIN: OPTIMAL',
    quote: '「最頂級的人像修飾，是保留皮膚真實毛孔的自然質感。」',
    desc: '人像與美體精修不能像塑膠蠟像。我專注於臉部追蹤與肌肉動態，進行身材比例微調與膚質雜點清潔，同時保留毛孔紋理與光影高光。在極限時程內，交付導演與客戶挑剔的特寫鏡頭。',
    params: [
      { key: '國際美妝保養廣告', value: '對女主角面部進行高精度追蹤，無痕清潔膚質暗沉與微小瑕疵，保留自然皮脂反光。' },
      { key: '運動服飾代言片', value: '依據人體肌肉紋理與運動軌跡，細緻微調身材比例與線條，呈現健康優美的物理動態。' }
    ]
  },
  {
    id: '03',
    title: 'AI GENERATION',
    subtitle: 'AI 智慧影像生成',
    meta: 'SYSTEM.AI: VIDEO_SYNTHESIS // DIFFUSION: COMPILING',
    quote: '「AI 負責拓寬創意的邊界，而我們負責將其無縫封裝落地。」',
    desc: 'AI 影片生成帶來無限可能，但也伴隨著雜訊與動態抖動。我將先進的 AI 生成技術融入傳統合成工作流中，利用 AI 進行材質擴展、補幀與煙霧去背，在大幅提升效率的同時，以專業直覺把關畫面的極致美感。',
    params: [
      { key: '科幻概念宣傳片', value: '利用 Stable Diffusion 進行科幻場景的材質擴增與動態修補，大幅縮短前期三維渲染時間。' },
      { key: '音樂錄影帶 MV', value: '採用 AI 影片轉譯技術將實拍人像風格化，並在 Flame 中進行動態去噪與色彩一致性校正。' }
    ]
  }
];

export default function Manifesto() {
  const [activeTab, setActiveTab] = useState('01');
  const activeCategory = lawCategories.find(cat => cat.id === activeTab) || lawCategories[0];

  return (
    <section id="about" className="max-w-6xl mx-auto px-8 py-36 relative border-t border-zinc-900">
      {/* 網格裝飾背景 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="relative z-10">
        {/* 頂部：標題區 */}
        <div className="text-center mb-20 relative z-10">
          <div className="mono text-[7px] text-aurora-blue mb-6 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue animate-pulse" />
            01 // The Narrative & Laws
          </div>
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title text-white">
            The <span className="text-aurora-blue">Manifesto</span>
          </h2>
          <p className="text-zinc-350 font-light max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            在商業廣告的極速步調中，憑藉心手合一的極速直覺，讓每個創意精準且高速交付。
          </p>
        </div>

        {/* 內容區：左右對齊 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* 左側：品牌文字宣言 */}
          <div className="md:col-span-6 space-y-8 text-zinc-350 text-base md:text-lg leading-relaxed font-light">
            <p>
              作為台灣俗稱的 D1 技師，我接手廣告製作的最後一步。從前期創意發想、實際拍攝、Offline 剪接再到調光，最後檔案來到我手中，使用 Autodesk Flame 進行 Online 。依需求進行人物膚質精修、場景穿幫、綠幕去背、3D物件合成、商品合成與字幕效果。在反覆經由導演、代理商確認並與客戶實際交片後，最後製作SC播帶，完成這次專案。
            </p>
            <p>
              即使進入交片終點線，只要客戶對細節有所追求，我都會在第一時間提出最佳解法。無論是調整剪接節奏、校正色彩，或是重新置換合成場景，能在分秒必爭的現場快速回應並解決客戶需求，就是我的成就感所在。
            </p>
            <p>
              面對 AI 浪潮，我不斷學習並掌握 AI 技能，將智慧輔助技術融入傳統合成流程。藉由更高的效率與敏銳的視覺直覺，探索影音創作的全新視野。
            </p>
            <p className="border-l-2 border-aurora-blue pl-6 py-2 text-zinc-200">
              「細心雕琢每一格畫面，在極限的時程裡，成為替導演與客戶解決問題的人。」
            </p>
          </div>

          {/* 右側：整合的 Laws 系統 HUD 面板 */}
          <div className="md:col-span-6 flex flex-col">
            {/* 微型 Tabs 切換 */}
            <div className="flex gap-2.5 mb-5">
              {lawCategories.map((cat) => {
                const labelMap = {
                  '01': { eng: '01 / CHROMA KEY', zht: '綠幕去背合成' },
                  '02': { eng: '02 / BEAUTY WORK', zht: '人物美體精修' },
                  '03': { eng: '03 / AI VIDEO', zht: 'AI 影片生成' }
                };
                const label = labelMap[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-4 py-2.5 flex flex-col items-center justify-center text-center transition-all duration-300 border rounded-none min-w-[100px] leading-none ${activeTab === cat.id
                      ? 'border-aurora-blue text-black bg-aurora-blue shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      : 'border-zinc-880 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950/20'
                      }`}
                  >
                    <span className={`text-[6px] mono tracking-widest uppercase mb-1 ${activeTab === cat.id ? 'text-black/80' : 'text-zinc-500'
                      }`}>{label.eng}</span>
                    <span className="text-xs font-normal tracking-wider">{label.zht}</span>
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
                <RefractionCard className="bg-zinc-955/20 backdrop-blur-md border border-zinc-800/80 rounded-none p-6 md:p-8 flex flex-col justify-between min-h-[380px] shadow-2xl relative overflow-hidden">
                  <div>
                    {/* 大字箴言 */}
                    <div className="text-zinc-100 font-bold text-base md:text-lg tracking-tight mb-4 text-left border-l-2 border-aurora-blue pl-4 py-0.5">
                      {activeCategory.quote}
                    </div>

                    {/* 描述 */}
                    <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed mb-6">
                      {activeCategory.desc}
                    </p>

                    {/* 大師實踐解密 (Mastery In Action) - 調整為純乾淨頂邊線分隔 */}
                    <div className="space-y-4 pt-6 border-t border-zinc-900/60 mt-6">
                      {activeCategory.params.map((param) => (
                        <div key={param.key} className="space-y-1 pb-3.5 border-b border-zinc-900 last:border-b-0 last:pb-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-aurora-blue">
                            <Binary size={10} className="text-aurora-blue" />
                            {param.key}
                          </div>
                          <p className="text-xs text-zinc-450 font-light leading-relaxed pl-4">
                            {param.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 底部 HUD 裝飾 */}
                  <div className="border-t border-zinc-900 pt-5 mt-8 flex justify-between items-center mono text-[6px] text-zinc-500">
                    <span>SYS_TEMP: 37.4°C // VOLT: 1.15V</span>
                    <span className="flex items-center gap-1">
                      <Terminal size={8} className="text-aurora-blue animate-pulse" />
                      SHELL: ZSH // LAWS: COMPILING
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
