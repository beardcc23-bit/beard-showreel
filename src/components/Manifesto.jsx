import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Play } from 'lucide-react';
import RefractionCard from './RefractionCard';

const lawCategories = [
  {
    id: '01',
    title: 'AI GENERATION',
    subtitle: 'AI 智慧影像生成',
    meta: 'SYSTEM.AI: VIDEO_SYNTHESIS // DIFFUSION: COMPILING',
    quote: '「AI 負責拓寬創意的邊界，而我負責將其無縫封裝落地。」',
    desc: 'AI 生成看似帶來無限想像，實則伴隨著物理邏輯崩壞、畫面閃爍與無規律的細節錯誤。我專注於從這些隨機不可控的片段中，精準篩選並萃取可用元素，將零散的 AI 生成素材，無痕合成為符合大片質感的高階商業畫面。',
    params: [
      {
        key: 'Foxtron Caviar',
        value: '將實拍的車輛行駛影片，完美結合 AI 輔助生成的淡江大橋背景，在 Flame 中重塑極致的物理光影與動態透視。',
        videoId: 'pCBQA1vEDig'
      },
      {
        key: '黑松茶花',
        value: '前期透過 AI 生成水豚君角色的各種動態，作為現場實拍演員的動作對位與表演參照。',
        videoId: 'TRqUVCCZwRU'
      }
    ]
  },
  {
    id: '02',
    title: 'CHROMA KEYING',
    subtitle: '綠幕去背合成',
    meta: 'SYSTEM.CHROMA: KEY_EXTRACTION // MATTE: ACTIVE',
    quote: '「真正的無痕合成，是讓去背邊緣與環境光影產生自然呼吸感。」',
    desc: '綠幕去背不是單純的去色過濾，它牽涉到極致複雜的髮絲透明度、邊緣溢色消除，以及實拍人物與背景間的光線交融。我專注於雕琢最棘手的邊緣細節，重塑完美且絕對自然的物理邊界。',
    params: [
      {
        key: 'UCC',
        value: '免去出外景的大量時程，於棚內進行綠幕拍攝，後期精準合成海景與山景，依然呈現如同實地外景拍攝般的高質感天光。',
        videoId: 'AuuxyMIutf8'
      },
      {
        key: '磊山保經',
        value: '克服無綠幕環境的限制，以細緻的手工逐格去背抽離人物，並在多重圖層間嵌入動態閃爍色塊，創造出節奏感強烈且層次豐富的視覺張力。',
        videoId: 'Ofl89MtikqE'
      }
    ]
  },
  {
    id: '03',
    title: 'BEAUTY RETOUCHING',
    subtitle: '人物美體膚質精修',
    meta: 'SYSTEM.RETOUCH: FACE_TRACKING // SKIN: OPTIMAL',
    quote: '「最頂級的人像修飾，是保留皮膚真實毛孔的自然質感。」',
    desc: '極致的人像修飾，是讓主角展現無瑕面容與完美體態，卻不失真實溫度。我藉由精確的動態轉描與肌理微調，在避免塑膠感的同時，精修出最符合黃金比例的自然物理動態。',
    params: [
      {
        key: 'TKLAB',
        value: '精細打磨代言人小S的肌膚與立體輪廓，打造出不失真的凍齡無瑕容顏，並乾淨抹去手部與雙腿的刺青細節。',
        videoId: '1495921932163292',
        isFacebook: true,
        aspect: 'square',
        url: 'https://www.facebook.com/TKLAB.tw/videos/1495921932163292'
      },
      {
        key: 'LUX 髮的補給',
        value: '不只雕琢面部無瑕膚質的自然光澤，更針對秀髮的動態細節進行優化，呈現流暢且具空氣感的長髮飄逸視覺。',
        videoId: '822528356385191',
        isFacebook: true
      }
    ]
  }
];

export default function Manifesto({ onPlayVideo }) {
  const [activeTab, setActiveTab] = useState('01');
  const activeCategory = lawCategories.find(cat => cat.id === activeTab) || lawCategories[0];

  return (
    <section id="about" className="max-w-6xl mx-auto px-8 py-36 relative">
      {/* 網格裝飾背景 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="relative z-10">
        {/* 頂部：標題區 */}
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title text-white">
            The <span className="text-aurora-blue">Manifesto</span>
          </h2>
          <p className="text-zinc-350 font-light max-w-2xl mx-auto text-sm md:text-lg leading-relaxed">
            在商業廣告的極速步調中，憑藉心手合一的極速直覺，讓每個創意精準且高速交付。
          </p>
        </div>

        {/* 內容區：左右對齊 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          {/* 左側：品牌文字宣言 */}
          <div className="md:col-span-6 flex flex-col text-zinc-350 text-base md:text-lg leading-relaxed font-light">
            {/* 隱形占位區，高度與右側按鈕及間距呼應，以達成左右文字齊頭 */}
            <div className="hidden md:block h-[51px] mb-5" />
            <div className="space-y-8">
              <p>
                作為台灣俗稱的 D1 技師，我接手廣告製作的最後一步。一支廣告片從前期創意發想、實際拍攝、Offline 剪接再到調光，最後檔案來到我手中，使用 Autodesk Flame 進行 Online 。依需求進行人物膚質精修、場景穿幫、綠幕去背、3D物件合成、商品合成與字幕效果。在反覆經由導演、代理商確認並與客戶實際交片後，最後製作 SC 播帶，完成這次專案。
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
          </div>

          {/* 右側：整合的 Laws 系統 HUD 面板 */}
          <div className="md:col-span-6 flex flex-col">
            {/* 微型 Tabs 切換 */}
            <div className="flex gap-1.5 sm:gap-2.5 mb-5 w-full">
              {lawCategories.map((cat) => {
                const labelMap = {
                  '01': { eng: '01 / AI VIDEO', zht: 'AI 影片生成' },
                  '02': { eng: '02 / CHROMA KEY', zht: '綠幕去背合成' },
                  '03': { eng: '03 / BEAUTY WORK', zht: '人物美體精修' }
                };
                const label = labelMap[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`hud-btn px-1.5 sm:px-4 py-2.5 flex flex-col items-center justify-center text-center min-w-0 sm:min-w-[100px] flex-1 sm:flex-initial leading-none ${activeTab === cat.id ? 'is-active' : ''}`}
                  >
                    <span className={`hud-eng text-[5px] sm:text-[6px] mono tracking-widest uppercase mb-1 whitespace-nowrap ${activeTab === cat.id ? '' : 'text-zinc-500'
                      }`}>[ {label.eng} ]</span>
                    <span className="hud-zht text-[11px] sm:text-xs font-normal tracking-wider whitespace-nowrap">{label.zht}</span>
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
                <RefractionCard 
                  className="backdrop-blur-2xl border border-white/[0.05] rounded-none p-6 md:p-8 shadow-2xl relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.005) 50%, rgba(0, 0, 0, 0.5) 100%)',
                    backgroundColor: 'rgba(6, 6, 6, 0.5)'
                  }}
                >
                  {/* 高級科技微網格背景 (Micro Dot Grid Matrix) */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                       style={{
                         backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)',
                         backgroundSize: '20px 20px'
                       }}
                  />

                  {/* 隨滑鼠游標移動的動態高光折射 (Interactive Specular Reflection) */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"
                    style={{
                      background: 'radial-gradient(circle 250px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255, 255, 255, 0.035), transparent 80%)'
                    }}
                  />

                  {/* 玻璃內部的雙色折射光源 (Refraction Ambient Glows) */}
                  <div className="absolute -top-32 -left-32 w-64 h-64 bg-aurora-blue/12 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-yellow-500/6 rounded-full blur-[80px] pointer-events-none" />

                  {/* 四角金色科技切角 (HUD Corner Brackets) */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: 'rgba(255, 224, 130, 0.5)' }} />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: 'rgba(255, 224, 130, 0.5)' }} />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: 'rgba(255, 224, 130, 0.5)' }} />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: 'rgba(255, 224, 130, 0.5)' }} />

                  <div className="space-y-6 relative z-10">
                    {/* 大字箴言 */}
                    <div className="text-zinc-100 font-semibold text-lg md:text-xl tracking-wide text-left border-l-2 border-aurora-blue pl-4 py-0.5 leading-relaxed">
                      {activeCategory.quote}
                    </div>

                    {/* 描述 */}
                    <p className="text-sm md:text-[15px] text-zinc-400 font-light leading-relaxed md:leading-loose">
                      {activeCategory.desc}
                    </p>

                    {/* 大師實踐解密 (Mastery In Action) - 調整為純乾淨頂邊線分隔 */}
                    <div className="space-y-4 pt-6 border-t border-zinc-900/60 mt-6">
                      {activeCategory.params.map((param) => {
                        const hasVideo = !!param.videoId;
                        return (
                          <div key={param.key} className="space-y-1.5 pb-3.5 border-b border-zinc-900 last:border-b-0 last:pb-0">
                            <div
                              onClick={() => {
                                if (hasVideo) {
                                  if (param.isFacebook && param.url) {
                                    if (window.innerWidth < 768) {
                                      window.location.href = param.url;
                                    } else {
                                      window.open(param.url, '_blank');
                                    }
                                  } else if (onPlayVideo) {
                                    onPlayVideo(param.videoId, false, param.aspect);
                                  }
                                }
                              }}
                              className={`flex items-center gap-2 text-sm md:text-[15px] font-semibold transition-all duration-200 ${hasVideo
                                ? 'text-aurora-blue hover:text-white cursor-pointer select-none group/title'
                                : 'text-aurora-blue'
                                }`}
                            >
                              <Play size={10} fill="currentColor" className="text-aurora-blue group-hover/title:scale-110 transition-transform duration-200" />
                              <span className={hasVideo ? 'group-hover/title:underline' : ''}>
                                {param.key}
                              </span>
                              {hasVideo && (
                                <span className="text-[9px] text-zinc-600 font-light tracking-wider opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 ml-1">
                                  // 點擊播放影片
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-[13px] text-zinc-450 font-light leading-relaxed md:leading-loose pl-5">
                              {param.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
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
