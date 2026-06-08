import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const categories = [
  {
    id: 'food',
    name: '食品與飲料',
    items: [
      { name: 'Extra', domain: 'wrigley.com' },
      { name: 'TOBLERONE 三角巧克力', domain: 'toblerone.com', videoId: 'exDc-2Xnb4E', bgImage: '/toblerone_bg.png' },
      { name: 'UCC', domain: 'ucc.co.jp', videoId: 'AuuxyMIutf8', bgImage: '/ucc_bg.png' },
      { name: '可口可樂', domain: 'cocacola.com', videoId: '1286974884802497', isFacebook: true },
      { name: '好侍咖哩', domain: 'housefoods-group.com', videoId: 'jScTOFsO97U' },
      { name: '伯朗EX雙倍濃烈咖啡', domain: 'mrbrown.com.tw', videoId: 'UmoyLNbcevQ' },
      { name: '每朝双纖綠茶', domain: 'vitalon.com.tw', videoId: 'w1EUT4JnHck' },
      { name: '每朝健康', domain: 'vitalon.com.tw', videoId: '_xC48BnWOAQ' },
      { name: '噶瑪蘭威士忌', domain: 'kavalanwhisky.com' },
      { name: '柏克金啤酒', domain: 'buckskin.com.tw', videoId: 'aKYv6_VMPFI' },
      { name: '金門高粱千日醇', domain: 'kkl.com.tw', videoId: '8rl7u3SPQpY' },
      { name: '旨醞鐵板燒', domain: 'feastogether.com.tw', videoId: '2203781970428596', isFacebook: true },
      { name: '活沛多', domain: 'watsons.com.tw', videoId: 'Y4CG2QNa5hs' },
      { name: '格蘭利威', domain: 'theglenlivet.com' },
      { name: '桂格喝的燕麥', domain: 'quaker.com.tw' },
      { name: '桂格', domain: 'quaker.com.tw', videoId: 'lxRJO_qPcWQ' },
      { name: '泰山八寶粥', domain: 'taisungroup.com.tw', videoId: 'ry5k_i-XhVE' },
      { name: '健酪乳酸飲料', domain: 'kingcar.com.tw', videoId: 'qJqmBWZxbdo' },
      { name: '黑松茶花', domain: 'heysong.com.tw', videoId: 'TRqUVCCZwRU', bgImage: '/heysong_bg.png' },
      { name: '黑松茶花', domain: 'heysong.com.tw', videoId: 'cKbH-CxdjxY' },
      { name: '瑞穗鮮乳', domain: 'uni-president.com.tw', videoId: 'owT3Sj_So60', bgImage: '/ruisui_bg.png' },
      { name: '義美生機', domain: 'imeieco.com', videoId: 'kakD_HQkIQU', bgImage: '/imeieco_bg.png' },
      { name: '裸雀威士忌', domain: 'nakedmalt.com' },
      { name: '維他露P+', domain: 'vitalon.com.tw', videoId: 'AyQQZ37OPfU', bgImage: '/vitalon_p_bg.png' },
      { name: '樂事', domain: 'lays.com', videoId: 'zQfi9U_023I', bgImage: '/lays_bg.png' },
      { name: '灣仔碼頭水餃', domain: 'generalmills.com' }
    ]
  },
  {
    id: 'tech',
    name: '科技電信與家電',
    items: [
      { name: 'Panasonic 蒸汽電熨斗', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Panasonic VIERA', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Panasonic 便座', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Panasonic 冷萃咖啡機', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Panasonic 吸頂燈', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Panasonic W音波電動牙刷', domain: 'panasonic.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Panasonic_logo.svg' },
      { name: 'Samsung S20', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Samsung S21', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Samsung S22', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'Samsung Z Fold2', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Samsung Z Fold3', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Samsung Z Fold4', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'Samsung 平板', domain: 'samsung.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
      { name: 'Sharp', domain: 'sharpcorp.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/SHARP_logo.svg' },
      { name: 'Sony Xperia', domain: 'sony.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
      { name: 'TOKUYO', domain: 'tokuyo.com.tw', logo: 'https://www.tokuyo.com.tw/Uploads/Images/2021/logo.png' },
      { name: '三菱重工空調', domain: 'mhi-mth.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Mitsubishi_Electric_logo.svg' },
      { name: '三菱電機', domain: 'mitsubishielectric.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Mitsubishi_Electric_logo.svg' },
      { name: '中華電信', domain: 'cht.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chunghwa_Telecom.svg' }
    ]
  },
  {
    id: 'vehicle',
    name: '汽車與交通',
    items: [
      { name: 'Momentum', domain: 'momentum-biking.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Momentum_Bicycles_logo.svg' },
      { name: 'AUDI', domain: 'audi.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg', videoId: 's6s2p87fPdA' },
      { name: 'GOGORO', domain: 'gogoro.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Gogoro_logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'Honda', domain: 'honda.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_Logo.svg' },
      { name: 'MAZDA', domain: 'mazda.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Mazda_logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'Skoda', domain: 'skoda-auto.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Skoda_Auto_logo_%282023%29.svg' },
      { name: '中華航空', domain: 'china-airlines.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/China_Airlines_logo.svg' },
      { name: '長榮航太', domain: 'egat.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/EVA_Air_logo.svg' },
      { name: '長榮航空', domain: 'evaair.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/91/EVA_Air_logo.svg' }
    ]
  },
  {
    id: 'lifestyle',
    name: '生活與百貨零售',
    items: [
      { name: 'Ariel 抗菌洗衣精', domain: 'ariel.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Ariel_%28brand%29_logo.svg' },
      { name: 'Foodpanda', domain: 'foodpanda.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Foodpanda_logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'HOLA', domain: 'hola.com.tw', logo: 'https://www.hola.com.tw/v2/official/SalePageCategory/images/logo.svg' },
      { name: 'LaLaport 南港', domain: 'mitsui-fudosan.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Mitsui_Fudosan_logo.svg' },
      { name: 'UberEats', domain: 'ubereats.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Uber_Eats_2018_logo.svg', videoId: 's6s2p87fPdA' },
      { name: '東和鋼鐵', domain: 'tunghasteel.com.tw', logo: 'https://www.tunghasteel.com.tw/images/logo.png' },
      { name: '犀牛盾', domain: 'rhinoshield.tw', logo: 'https://logo.clearbit.com/rhinoshield.tw' },
      { name: '新光三越', domain: 'skm.com.tw', logo: 'https://www.skm.com.tw/img/logo.png' },
      { name: '楓康一滴淨', domain: 'funcom.com.tw', logo: 'https://www.funcom.com.tw/images/logo.png' },
      { name: '錦鋐氣密窗', domain: 'chinhong.com.tw', logo: 'https://www.chinhong.com.tw/img/header_logo.png' },
      { name: '魔術靈', domain: 'kao.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Kao_Logo.svg' }
    ]
  },
  {
    id: 'health',
    name: '生醫與醫藥保健',
    items: [
      { name: 'Accu-Chek 羅氏血糖機', domain: 'accu-chek.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Roche_Logo.svg' },
      { name: '大本山益生菌', domain: 'yohome.com.tw', logo: 'https://www.yohome.com.tw/wp-content/uploads/2019/12/logo-1.png' },
      { name: '加倍優', domain: 'yohome.com.tw', logo: 'https://www.yohome.com.tw/wp-content/uploads/2019/12/logo-1.png' },
      { name: '台灣武田合利他命', domain: 'takeda.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Takeda_logo.svg', videoId: 's6s2p87fPdA' },
      { name: '克潰精顆粒a', domain: 'kowa.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Kowa_Logo.svg' }
    ]
  },
  {
    id: 'beauty',
    name: '美妝與個人護理',
    items: [
      { name: '1028 睫毛膏', domain: '1028.com.tw', logo: 'https://logo.clearbit.com/1028.com.tw', videoId: 's6s2p87fPdA' },
      { name: 'Bifesta 碧菲絲特', domain: 'bifesta.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Kao_Logo.svg' },
      { name: 'Calm Night Day 淨日夜', domain: 'yolu.jp', logo: 'https://logo.clearbit.com/yolu.jp' },
      { name: 'LUX 髮的補給', domain: 'lux.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/LUX_logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'MAMA 永恆光燦系列', domain: 'kao.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Kao_Logo.svg' },
      { name: 'TKLAB', domain: 'tklab.com.tw', logo: 'https://logo.clearbit.com/tklab.com.tw' },
      { name: '三得利 比菲德氏菌', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '三得利 蜂王乳+芝麻明E', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '三得利 蜜露珂娜', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '三得利 密得絲', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '五月花極上系列', domain: 'yfycp.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/YFY_logo.svg' },
      { name: '舒潔', domain: 'kleenex.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Kleenex_logo.svg' },
      { name: '蕾妮亞', domain: 'laurier.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Kao_Logo.svg' }
    ]
  },
  {
    id: 'finance',
    name: '金融與保險',
    items: [
      { name: '中國信託 點燃生命之火', domain: 'ctbcbank.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/CTBC-Bank-Logo.svg', videoId: 's6s2p87fPdA' },
      { name: '台灣 Pay', domain: 'taiwanpay.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Taiwan_Pay_logo.svg' },
      { name: '安聯人壽', domain: 'allianz.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Allianz.svg' },
      { name: '復華投信', domain: 'fhtrust.com.tw', logo: 'https://www.fhtrust.com.tw/images/logo.png' },
      { name: '遠雄人壽', domain: 'fglife.com.tw', logo: 'https://www.fglife.com.tw/images/logo.png' },
      { name: '渣打銀行', domain: 'sc.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Standard_Chartered_Logo.svg' },
      { name: '磊山保經', domain: 'leishan.com.tw', logo: 'https://www.leishan.com.tw/images/logo.png' }
    ]
  }
];

function BrandCard({ item, onPlayVideo }) {
  const hasVideo = !!item.videoId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => hasVideo && onPlayVideo(item.videoId, !!item.isFacebook)}
      className={`p-3.5 border rounded-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[95px] ${
        hasVideo
          ? 'border-zinc-700/60 bg-zinc-900/50 hover:border-aurora-blue cursor-pointer hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] hover:-translate-y-1'
          : 'border-zinc-800/80 bg-zinc-900/20'
      }`}
    >
      {/* 項目背景底圖 (僅限有 bgImage 的卡片) */}
      {item.bgImage && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-sm">
          <img
            src={item.bgImage}
            alt={`${item.name} background`}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      )}

      {/* 淡淡的金色漸層 hover 底色 (僅限有影片且無 bgImage) */}
      {hasVideo && !item.bgImage && (
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className={`text-xs tracking-wide transition-colors duration-300 leading-snug ${
          hasVideo
            ? 'text-zinc-100 group-hover:text-white font-normal'
            : 'text-zinc-300 font-normal'
        }`}>
          {item.name}
        </div>
      </div>

      {hasVideo ? (
        <div className="relative z-10 mt-2.5 flex items-center gap-1 text-[9px] text-aurora-blue font-black tracking-widest uppercase opacity-85 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <Play size={8} fill="currentColor" /> Play Reel
        </div>
      ) : (
        <div className="relative z-10 mt-2.5 text-[6px] text-zinc-500 mono tracking-widest uppercase">
          // ARCHIVE
        </div>
      )}
    </motion.div>
  );
}

export default function VisualSynthesis({ onPlayVideo }) {
  const [activeTab, setActiveTab] = useState('food');

  const currentCategory = categories.find((c) => c.id === activeTab) || categories[0];

  return (
    <section id="vfx" className="max-w-6xl mx-auto px-8 py-24 relative">
      {/* 背景點綴網格 */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* 區段標頭 */}
      <div className="text-center mb-16 relative z-10">
        <div className="mono text-[6px] text-aurora-blue mb-6 uppercase tracking-[0.3em]">
          02 // Visual Synthesis
        </div>
        <h2 className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-8 glow-title text-white">
          The <span className="text-aurora-blue">Synthesis</span>
        </h2>
        <p className="text-zinc-300 font-light max-w-2xl mx-auto text-lg leading-relaxed">
          精選近期參與之一線品牌與商業廣告作品。融合極致的光影邏輯與嚴謹的物理細節，以頂尖合成美學淬鍊每幀畫面的視覺張力。
        </p>
      </div>

      {/* 分類切換 Tab */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-12 relative z-10">
        {categories.map((tab) => {
          const engMap = {
            food: 'FOOD & BEV',
            tech: 'TECH & TELECOM',
            vehicle: 'AUTO & TRAVEL',
            lifestyle: 'LIFESTYLE',
            health: 'HEALTH & MEDICAL',
            beauty: 'BEAUTY & CARE',
            finance: 'FINANCE & INS'
          };
          const engName = engMap[tab.id] || tab.id.toUpperCase();
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 flex flex-col items-center justify-center text-center transition-all duration-300 border rounded-sm leading-none ${
                activeTab === tab.id
                  ? 'border-aurora-blue text-black bg-aurora-blue shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                  : 'border-zinc-850 text-zinc-400 bg-zinc-950/20 hover:text-white hover:border-zinc-700'
              }`}
            >
              <span className={`text-[6px] mono tracking-widest uppercase mb-0.5 ${
                activeTab === tab.id ? 'text-black/70' : 'text-zinc-500'
              }`}>{engName}</span>
              <span className="text-xs font-normal tracking-wider">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 品牌卡片 Grid */}
      <motion.div
        layout
        className="grid grid-cols-3 md:grid-cols-5 gap-3 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {currentCategory.items.map((item) => (
            <BrandCard key={item.name} item={item} onPlayVideo={onPlayVideo} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
