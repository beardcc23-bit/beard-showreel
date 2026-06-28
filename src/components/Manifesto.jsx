import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Binary, Cpu } from 'lucide-react';
import RefractionCard from './RefractionCard';

const lawCategories = [
  {
    id: '01',
    title: 'LIGHT & REFRACTION',
    subtitle: '光影與折射定律',
    meta: 'SYSTEM.REFRACT: LENS_FLARE // FRESNEL: ACTIVE',
    quote: '「光影是物理的，但靈魂是主觀的。」',
    desc: '完美的合成是對物理光學的絕對敬畏。金屬的反射不能只是乾淨，它必須帶有微小的噪點與折射偏差；在像素的維度上，我只做一件事：用最嚴謹的物理邏輯，重建每幀畫面應有的自然折射與光斑深度。',
    params: [
      { key: 'UCC 咖啡廣告', value: '重塑杯身玻璃在強光下的 Fresnel 反射，讓虛擬 3D 咖啡液體呈現出 100% 具食慾感的真實透鏡折射。' },
      { key: '噶瑪蘭威士忌廣告', value: '還原厚重水晶杯底部的物理光線焦散（Caustics）與二次折射，重現威士忌的尊貴琥珀光影。' }
    ]
  },
  {
    id: '02',
    title: 'ILLUSION & PERCEPTION',
    subtitle: '虛實調和與視覺感知',
    meta: 'SYSTEM.PERCEPTION: COGNITIVE_VIS // RHYTHM: ACTIVE',
    quote: '「看不見的特效，才是最完美的特效。」',
    desc: '將幾百個無形元素融於日常生活場景中，而觀眾毫無察覺。這需要對大腦視覺心理學的精準拿捏——我們如何感知景深、如何被色彩的飽和度引導視線。最好的技術是完全隱形，只為創意的靈魂服務。',
    params: [
      { key: '長榮航空形象片', value: '陰天實拍下重建大氣光流，無痕擦除雜物並植入多維度陽光折射與高空雲景，重塑史詩級天光。' },
      { key: 'Samsung 旗艦機廣告', value: '動態模擬鏡頭邊緣的變形暗角與微弱色散像差（RGB Split），讓 CG 手機完美融入實拍底片顆粒。' }
    ]
  },
  {
    id: '03',
    title: 'COGNITIVE INTEGRATION',
    subtitle: '未來管線與人機協作',
    meta: 'SYSTEM.PIPELINE: AI_COGNITIVE // FLAME_LINK: ACTIVE',
    quote: '「AI 是催化劑，而我們是終點線前的藝術封裝者。」',
    desc: 'AI 可以生成無限的圖像碎片，但它缺乏對畫面真實分量的理解。合成師的職責，是將 AI 的無限可能，精準過濾、解構並封裝進嚴謹的電影與商業管線中。科技在於加速想像力落地，而人的審美直覺才是決定作品溫度的最終刻度。',
    params: [
      { key: '旨醞鐵板燒廣告', value: '運用 AI 輔助進行高難度煙霧去背與修補，縮短 40% 後期時間，實現現場光影與煙霧的無縫交融。' },
      { key: 'Panasonic 電視廣告', value: '全程採用 ACEScg 工業級高動態色域管線合成，確保從大銀幕到家用電視的色彩無偏差呈現。' }
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
              作為台灣俗稱的 D1 技師，我接手廣告製作的最後一步。從前期創意發想、實際拍攝、Offline 剪接再到調光，最後檔案來到我手上開始 Online。依需求進行人物膚質精修、場景穿幫、綠幕去背、商品合成與字幕效果。在反覆經由導演、代理商確認並與客戶實際交片後，最後製作SC播帶，完成這次製作。
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
                  '01': { eng: '01 / LIGHT', zht: '光影物理律' },
                  '02': { eng: '02 / ILLUSION', zht: '視覺感知' },
                  '03': { eng: '03 / PIPELINE', zht: '未來管線' }
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
                  {/* 面板頂部資訊 */}
                  <div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-5 mb-6">
                      <div>
                        <span className="mono text-[6px] text-aurora-blue uppercase tracking-widest block mb-1">
                          {activeCategory.meta}
                        </span>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-baseline gap-2 flex-wrap">
                          <span>{activeCategory.title}</span>
                          <span className="text-[9px] text-zinc-550 font-normal normal-case tracking-wide">// {activeCategory.subtitle}</span>
                        </h3>
                      </div>
                      <div className="mono text-[6px] text-zinc-500 px-2.5 py-1 border border-zinc-800 bg-zinc-950 rounded-none flex items-center gap-1.5">
                        <Cpu size={10} className="text-aurora-blue" />
                        OPTIMAL
                      </div>
                    </div>

                    {/* 大字箴言 */}
                    <div className="text-zinc-100 font-bold text-base md:text-lg tracking-tight mb-4 text-left border-l-2 border-aurora-blue pl-4 py-0.5">
                      {activeCategory.quote}
                    </div>

                    {/* 描述 */}
                    <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed mb-6">
                      {activeCategory.desc}
                    </p>

                    {/* 大師實踐解密 (Mastery In Action) */}
                    <div className="space-y-4 pt-2">
                      <div className="mono text-[6px] text-zinc-500 uppercase tracking-[0.25em] mb-3 flex items-center gap-1.5">// Mastery In Action // 實踐解密</div>
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
