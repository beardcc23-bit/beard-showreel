import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const categories = [
  {
    id: 'food',
    name: '食品與飲料',
    items: [
      { name: 'KIRIN', domain: 'kirin.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Kirin_Holdings_logo.svg', videoId: 's6s2p87fPdA' },
      { name: 'TOBLERONE 三角巧克力', domain: 'toblerone.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Toblerone_logo.svg' },
      { name: 'UCC', domain: 'ucc.co.jp', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/UCC_Holding_logo.svg' },
      { name: '三得利 蜂王乳+芝麻明E', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '三得利 蜜露珂娜', domain: 'suntory.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Suntory_logo.svg' },
      { name: '可口可樂', domain: 'cocacola.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg' },
      { name: '多力多滋', domain: 'doritos.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Doritos_logo.svg' },
      { name: '好侍咖哩', domain: 'housefoods-group.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/House_Foods_Holdings_logo.svg' },
      { name: '伯朗咖啡', domain: 'mrbrown.com.tw', logo: 'https://www.kingcar.com.tw/Uploads/Images/202005/0c1737e5-1ab2-4b26-80de-bd1ec2c86e0c.png' },
      { name: '每朝綠茶', domain: 'vitalon.com.tw', logo: 'https://www.vitalon.com.tw/Uploads/Images/202005/3e3cb897-402a-464a-9ef8-e04f114c2742.png' },
      { name: '金車噶瑪蘭威士忌', domain: 'kavalanwhisky.com', logo: 'https://www.kingcar.com.tw/Uploads/Images/202005/0c1737e5-1ab2-4b26-80de-bd1ec2c86e0c.png' },
      { name: '柏克金啤酒', domain: 'buckskin.com.tw', logo: 'https://www.kingcar.com.tw/Uploads/Images/202005/0c1737e5-1ab2-4b26-80de-bd1ec2c86e0c.png' },
      { name: '金門高粱', domain: 'kkl.com.tw', logo: 'https://www.kkl.com.tw/Uploads/Images/202005/85bdc329-873b-41ca-ab0c-66f8fa176df9.png' },
      { name: '旨醞鐵板燒', domain: 'feastogether.com.tw', logo: 'https://www.feastogether.com.tw/images/logo.png' },
      { name: '活沛多', domain: 'watsons.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Watsons_Logo.svg' },
      { name: '格蘭利威', domain: 'theglenlivet.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/da/The_Glenlivet_logo.svg', videoId: 's6s2p87fPdA' },
      { name: '桂格喝的燕麥', domain: 'quaker.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Quaker_Oats_company_logo.svg' },
      { name: '桂格形象片', domain: 'quaker.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Quaker_Oats_company_logo.svg', videoId: 's6s2p87fPdA' },
      { name: '桂格雙效健康奶粉', domain: 'quaker.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Quaker_Oats_company_logo.svg' },
      { name: '泰山八寶粥', domain: 'taisungroup.com.tw', logo: 'https://www.taisun.com.tw/wp-content/themes/taisun/images/logo.png' },
      { name: '健酪乳酸飲料', domain: 'kingcar.com.tw', logo: 'https://www.kingcar.com.tw/Uploads/Images/202005/3e3cb897-402a-464a-9ef8-e04f114c2742.png' },
      { name: '黑松茶花', domain: 'heysong.com.tw', logo: 'https://www.heysong.com.tw/wp-content/themes/heysong/images/logo.png' },
      { name: '瑞穗鮮乳', domain: 'uni-president.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Uni-President_Enterprises_Corporation_logo.svg' },
      { name: '義美', domain: 'imeifoods.com.tw', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/I-MEI_Foods_logo.svg' },
      { name: '義美生機', domain: 'imeieco.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/I-MEI_Foods_logo.svg' },
      { name: '裸雀威士忌', domain: 'nakedmalt.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/The_Famous_Grouse_logo.svg' },
      { name: '維他露P', domain: 'vitalon.com.tw', logo: 'https://www.vitalon.com.tw/Uploads/Images/202005/3e3cb897-402a-464a-9ef8-e04f114c2742.png' },
      { name: '樂事', domain: 'lays.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Lay%27s_Logo.svg' },
      { name: '灣仔碼頭水餃', domain: 'generalmills.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/General_Mills_logo.svg' }
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
  const [imgError, setImgError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const hasVideo = !!item.videoId;

  const logoUrl = item.logo || (item.domain ? `https://logo.clearbit.com/${item.domain}` : '');
  const googleFaviconUrl = item.domain ? `https://www.google.com/s2/favicons?sz=128&domain=${item.domain}` : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={() => hasVideo && onPlayVideo(item.videoId)}
      className={`p-3.5 border rounded-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden group min-h-[95px] ${
        hasVideo
          ? 'border-zinc-700/60 bg-zinc-900/50 hover:border-aurora-blue cursor-pointer hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] hover:-translate-y-1'
          : 'border-zinc-800/80 bg-zinc-900/20'
      }`}
    >
      {/* 淡淡的金色漸層 hover 底色 (僅限有影片) */}
      {hasVideo && (
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div>
        {/* Logo 顯示區 */}
        {logoUrl && !imgError ? (
          <img
            src={logoUrl}
            alt={`${item.name} logo`}
            onError={() => setImgError(true)}
            className={`h-[22px] w-auto max-w-[70px] object-contain mb-2.5 transition-all duration-300 ${
              hasVideo 
                ? 'grayscale group-hover:grayscale-0 opacity-95 group-hover:opacity-100' 
                : 'grayscale opacity-50 group-hover:opacity-85'
            }`}
          />
        ) : googleFaviconUrl && !fallbackError ? (
          <img
            src={googleFaviconUrl}
            alt={`${item.name} logo`}
            onError={() => setFallbackError(true)}
            className={`h-5 w-5 object-contain mb-2.5 rounded-sm transition-all duration-300 ${
              hasVideo ? 'opacity-90 group-hover:opacity-100' : 'opacity-50 grayscale'
            }`}
          />
        ) : (
          <div className="h-[22px] flex items-center mb-2.5">
            <span className={`mono text-[6px] px-1.5 py-0.5 border rounded-sm transition-colors duration-300 ${
              hasVideo 
                ? 'text-zinc-400 bg-zinc-900/50 border-zinc-800' 
                : 'text-zinc-500 bg-zinc-950/20 border-zinc-900/60'
            }`}>
              // BRAND
            </span>
          </div>
        )}

        <div className={`text-xs tracking-wide transition-colors duration-300 leading-snug ${
          hasVideo
            ? 'text-zinc-100 group-hover:text-white font-normal'
            : 'text-zinc-300 font-normal'
        }`}>
          {item.name}
        </div>
      </div>

      {hasVideo ? (
        <div className="mt-2.5 flex items-center gap-1 text-[9px] text-aurora-blue font-black tracking-widest uppercase opacity-85 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
          <Play size={8} fill="currentColor" /> Play Reel
        </div>
      ) : (
        <div className="mt-2.5 text-[6px] text-zinc-500 mono tracking-widest uppercase">
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
        <p className="text-zinc-500 font-light max-w-2xl mx-auto text-lg leading-relaxed">
          13 年頂尖 Flame 特效合成大師，雕琢百部一線商業廣告，以極致的光影邏輯、物理細節與視覺合成美感，將想像力完美呈現於螢幕之上。
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
