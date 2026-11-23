import React, { useRef } from 'react';
import { Play, ArrowUpRight } from 'lucide-react';
import RefractionCard from './RefractionCard';
import ScrubText from './common/ScrubText';
import { openSafeExternalUrl } from '../utils/url';
import { useOffscreenPause } from '../hooks/useOffscreenPause';

const lawCategories = [
  {
    id: '01',
    engLabel: 'AI VIDEO SYNTHESIS',
    subtitle: 'AI 智慧影像生成',
    accentLine: 'linear-gradient(90deg, #EB4A2E 0%, #FF8A6C 60%, transparent 100%)',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(235, 74, 46, 0.16) 0%, transparent 62%)',
    stickyTop: 'md:top-24',
    quote: '「AI 負責拓寬創意的邊界，而我負責將其無縫封裝落地。」',
    desc: 'AI 生成看似帶來無限想像，實則伴隨著物理邏輯崩壞、畫面閃爍與無規律的細節錯誤。我專注於從這些隨機不可控的片段中，精準篩選並萃取可用元素，將零散的 AI 生成素材，無痕合成為符合大片質感的高階商業畫面。',
    params: [
      {
        key: 'Foxtron Caviar',
        value: '將實拍的車輛行駛影片，完美結合 AI 輔助生成的淡江大橋背景，在 Flame 中重塑極致的物理光影與動態透視。',
        videoId: 'pCBQA1vEDig',
      },
      {
        key: '活沛多',
        value: '利用 AI 生成模型將實拍人物轉譯為微縮比例小人，並無縫融入與其他虛擬 AI 角色之間的跨次元互動。',
        videoId: 'Y4CG2QNa5hs',
      },
    ],
  },
  {
    id: '02',
    engLabel: 'OPTICAL CHROMA KEYING',
    subtitle: '綠幕去背合成',
    accentLine: 'linear-gradient(90deg, #D0346C 0%, #EB4A2E 60%, transparent 100%)',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(208, 52, 108, 0.16) 0%, transparent 62%)',
    stickyTop: 'md:top-32',
    quote: '「乾淨的去背不是把背景切掉，而是把環境光找回來。」',
    desc: '綠幕去背不是單純的去色過濾，它牽涉到極致複雜的髮絲透明度、邊緣溢色消除，以及實拍人物與背景間的光線交融。我專注於雕琢最棘手的邊緣細節，重塑完美且絕對自然的物理邊界。',
    params: [
      {
        key: 'UCC',
        value: '免去出外景的大量時程，於棚內進行綠幕拍攝，後期精準合成海景與山景，依然呈現如同實地外景拍攝般的高質感天光。',
        videoId: 'AuuxyMIutf8',
      },
      {
        key: '磊山保經',
        value: '克服無綠幕環境的限制，以細緻的手工逐格去背抽離人物，並在多重圖層間嵌入動態閃爍色塊，創造出節奏感強烈且層次豐富的視覺張力。',
        videoId: 'Rwrn87N2PUc',
      },
    ],
  },
  {
    id: '03',
    engLabel: 'ORGANIC BEAUTY WORK',
    subtitle: '人物美體膚質精修',
    accentLine: 'linear-gradient(90deg, #1276B8 0%, #3898EC 60%, transparent 100%)',
    ambientGlow: 'radial-gradient(circle at 88% 12%, rgba(18, 118, 184, 0.18) 0%, transparent 62%)',
    stickyTop: 'md:top-40',
    quote: '「最頂級的人像修飾，是保留皮膚真實毛孔的自然質感。」',
    desc: '極致的人像修飾，是讓主角展現無瑕面容與完美體態，卻不失真實溫度。我藉由精確的動態轉描與肌理微調，在避免塑膠感的同時，精修出最符合黃金比例的自然物理動態。',
    params: [
      {
        key: 'TKLAB',
        value: '精細打磨代言人小S的肌膚與立體輪廓，打造出不失真的凍齡無瑕容顏，並乾淨抹去手部與雙腿的刺青細節。',
        videoId: '1495921932163292',
        isFacebook: true,
        aspect: 'square',
        url: 'https://www.facebook.com/TKLAB.tw/videos/1495921932163292',
      },
      {
        key: 'LUX 髮的補給',
        value: '不只雕琢面部無瑕膚質的自然光澤，更針對秀髮的動態細節進行優化，呈現流暢且具空氣感的長髮飄逸視覺。',
        videoId: '822528356385191',
        isFacebook: true,
        url: 'https://www.facebook.com/watch/?v=822528356385191',
      },
    ],
  },
];

/**
 * 第三幕 Manifesto：左側 Sticky 釘選核心宣言 × 右側三層滾動堆疊光譜分鏡卡 (Sticky-Stack)
 * - 無須手動點小按鈕，隨滾動由朱紅 -> 洋紅 -> 光學青藍層層向上覆蓋堆疊
 */
export default function Manifesto({ onPlayVideo }) {
  const sectionRef = useRef(null);
  useOffscreenPause(sectionRef);

  const openFlameSchematic = () => {
    window.dispatchEvent(
      new CustomEvent('open-image-modal', {
        detail: {
          imageUrl: `${import.meta.env.BASE_URL}f1.webp`,
          title: 'Autodesk Flame Batch Schematic',
          description: '實際專案 Batch 節點介面',
        },
      })
    );
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full relative py-28 md:py-40 px-5 md:px-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto">
        {/* 非對稱編輯標頭 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <span className="mono text-xs uppercase tracking-[0.26em] text-spectral-cyan block mb-4">
              02 / VISUAL LOGIC
            </span>
            <h2 className="font-display text-[clamp(2.6rem,7.5vw,6.2rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-title-white">
              THE MANIFESTO
            </h2>
          </div>
          <p className="text-zinc-300 font-light max-w-md text-sm md:text-base leading-relaxed md:text-right">
            在商業廣告的極速步調中，憑藉心手合一的極速直覺，讓每個創意精準且高速交付。
          </p>
        </div>

        {/* 左欄 Sticky 釘選宣言 × 右欄 Sticky-Stack 三層光譜大卡 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* 左側：Sticky 宣言主文 */}
          <div className="md:col-span-5 md:sticky md:top-28 space-y-8 text-zinc-300 text-sm md:text-[16px] leading-[1.9] font-light">
            <p>
              作為台灣俗稱的 <span className="text-white font-normal">D1 技師 (VFX Artist)</span>，我接手廣告製作的最後一步。一支廣告片從前期創意發想、實際拍攝、Offline 剪接再到調光，最後檔案來到我手中，使用{' '}
              <span
                role="button"
                tabIndex={0}
                aria-label="檢視 Autodesk Flame 實際專案 Batch 節點介面"
                onClick={openFlameSchematic}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openFlameSchematic();
                  }
                }}
                className="relative inline-flex items-center gap-1 group/flame cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
              >
                <span className="text-white group-hover/flame:text-dawn-gold font-medium transition-colors duration-300">
                  Autodesk Flame
                </span>
                <ArrowUpRight size={13} className="text-spectral-crimson transition-transform duration-300 group-hover/flame:translate-x-0.5 group-hover/flame:-translate-y-0.5" />
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] spectral-underline" />

                {/* 桌面版懸浮 Batch 節點圖磨砂玻璃預覽面板 */}
                <span className="absolute bottom-full left-0 mb-4 w-[320px] pointer-events-none opacity-0 translate-y-2 group-hover/flame:opacity-100 group-hover/flame:translate-y-0 transition-all duration-300 ease-out z-[99] hidden md:block">
                  <span className="block optical-surface p-3">
                    <span className="block relative aspect-video overflow-hidden border border-white/10 mb-2.5">
                      <img
                        src={`${import.meta.env.BASE_URL}f1.webp`}
                        alt="Autodesk Flame Batch Schematic"
                        width="1920"
                        height="902"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span className="flex items-center justify-between mono text-[10px] text-zinc-300 tracking-wider uppercase">
                      <span>實際專案 Batch 節點介面</span>
                      <span className="text-spectral-crimson">[ EXPAND ]</span>
                    </span>
                  </span>
                </span>
              </span>{' '}
              進行 Online。依需求進行人物膚質精修、場景穿幫、綠幕去背、3D物件合成、商品合成與字幕效果。在反覆經由導演、代理商確認並與客戶實際交片後，最後製作 <span className="text-white font-normal">SC 播帶</span>，完成這次專案。
            </p>

            <ScrubText text="即使進入交片終點線，只要客戶對細節有所追求，我都會在第一時間提出最佳解法。無論是調整剪接節奏、校正色彩，或是重新置換合成場景，能在分秒必爭的現場快速回應並解決客戶需求，就是我的成就感所在。" />
            <ScrubText text="面對 AI 浪潮，我不斷學習並掌握 AI 技能，將智慧輔助技術融入傳統合成流程。藉由更高的效率與敏銳的視覺直覺，探索影音創作的全新視野。" />
            <ScrubText className="border-l-2 border-spectral-crimson py-2 text-title-white text-sm sm:text-base leading-relaxed pl-5 font-normal">
              「細心雕琢每一格畫面，在極限的時程裡，成為替導演與客戶解決問題的人。」
            </ScrubText>
          </div>

          {/* 右側：三層滾動堆疊磨砂毛玻璃分鏡面板 (Sticky-Stack) */}
          <div className="md:col-span-7 flex flex-col gap-10 md:gap-14">
            {lawCategories.map((cat) => (
              <RefractionCard
                key={cat.id}
                className={`w-full p-7 sm:p-10 md:sticky ${cat.stickyTop}`}
              >
                {/* 內層裁切裝飾容器（保留外層 3D 立體玻璃厚邊不被 overflow-hidden 裁掉） */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-[2px] spectral-flow-line" />
                  <div className="absolute inset-0" style={{ background: cat.ambientGlow }} />
                  <span className="font-display text-7xl sm:text-8xl font-bold text-white/[0.04] absolute top-4 right-6 leading-none select-none">
                    {cat.id}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="mono text-xs text-spectral-crimson font-semibold tracking-[0.22em]">
                      {cat.id}
                    </span>
                    <span className="w-5 h-[1px] bg-white/20" />
                    <span className="mono text-[11px] text-zinc-400 tracking-[0.2em] uppercase">
                      {cat.engLabel}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-title-white tracking-tight mb-5">
                    {cat.subtitle}
                  </h3>

                  <blockquote
                    className="text-zinc-100 font-normal text-base sm:text-lg leading-relaxed border-l-2 border-white/30 py-0.5 mb-5"
                    style={{ textIndent: '-1em', paddingLeft: 'calc(1rem + 1em)' }}
                  >
                    {cat.quote}
                  </blockquote>

                  <p className="text-sm sm:text-[15px] text-zinc-300 font-light leading-[1.85] mb-8">
                    {cat.desc}
                  </p>

                  {/* 實戰案例工業播放條 */}
                  <div className="border-t border-white/10 divide-y divide-white/[0.08]">
                    {cat.params.map((param) => {
                      const hasVideo = Boolean(param.videoId);
                      const triggerVideo = () => {
                        if (!hasVideo) return;
                        if (param.isFacebook && param.url) {
                          openSafeExternalUrl(param.url);
                        } else if (onPlayVideo) {
                          onPlayVideo(param.videoId, param.isFacebook, param.aspect, param.url);
                        }
                      };

                      return (
                        <div key={param.key} className="py-4 first:pt-5 last:pb-0">
                          <button
                            type="button"
                            onClick={triggerVideo}
                            className="group/play w-full flex items-center justify-between text-left mb-2 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                          >
                            <span className="inline-flex items-center gap-2.5 text-sm sm:text-[15px] font-medium text-title-white group-hover/play:text-dawn-gold transition-colors">
                              <Play
                                size={11}
                                fill="currentColor"
                                className="text-spectral-crimson transition-transform duration-200 group-hover/play:scale-125"
                              />
                              <span>{param.key}</span>
                            </span>
                            <span className="mono text-[10px] tracking-[0.2em] uppercase text-zinc-500 group-hover/play:text-white transition-colors">
                              [ WATCH CASE ]
                            </span>
                          </button>
                          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed pl-5">
                            {param.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </RefractionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
