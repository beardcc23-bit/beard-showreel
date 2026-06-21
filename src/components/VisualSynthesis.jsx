import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';

const categories = [
  {
    "id": "food",
    "name": "食品與飲料",
    "items": [
      {
        "name": "Extra",
        "bgImage": "/vfx/A/A-001.png"
      },
      {
        "name": "Johnnie Walker",
        "bgImage": "/vfx/A/A-002.png"
      },
      {
        "name": "TOBLERONE 三角巧克力",
        "bgImage": "/vfx/A/A-003.png",
        "url": "https://www.youtube.com/watch?v=exDc-2Xnb4E&t=1s",
        "videoId": "exDc-2Xnb4E"
      },
      {
        "name": "UCC",
        "bgImage": "/vfx/A/A-004.png",
        "url": "https://www.youtube.com/watch?v=AuuxyMIutf8",
        "videoId": "AuuxyMIutf8"
      },
      {
        "name": "可口可樂",
        "bgImage": "/vfx/A/A-005.png",
        "url": "https://www.facebook.com/watch/?v=1286974884802497",
        "videoId": "1286974884802497",
        "isFacebook": true
      },
      {
        "name": "好侍咖哩",
        "bgImage": "/vfx/A/A-006.png",
        "url": "https://www.youtube.com/watch?v=jScTOFsO97U",
        "videoId": "jScTOFsO97U"
      },
      {
        "name": "伯朗EX雙倍濃烈咖啡",
        "bgImage": "/vfx/A/A-007.png",
        "url": "https://www.youtube.com/watch?v=UmoyLNbcevQ",
        "videoId": "UmoyLNbcevQ"
      },
      {
        "name": "每朝双纖綠茶",
        "bgImage": "/vfx/A/A-008.png",
        "url": "https://www.youtube.com/watch?v=w1EUT4JnHck",
        "videoId": "w1EUT4JnHck"
      },
      {
        "name": "每朝健康",
        "bgImage": "/vfx/A/A-009.png",
        "url": "https://www.youtube.com/watch?v=_xC48BnWOAQ",
        "videoId": "_xC48BnWOAQ"
      },
      {
        "name": "噶瑪蘭威士忌",
        "bgImage": "/vfx/A/A-010.png"
      },
      {
        "name": "柏克金啤酒",
        "bgImage": "/vfx/A/A-011.png",
        "url": "https://www.youtube.com/watch?v=aKYv6_VMPFI",
        "videoId": "aKYv6_VMPFI"
      },
      {
        "name": "金門高粱千日醇",
        "bgImage": "/vfx/A/A-012.png",
        "url": "https://www.youtube.com/watch?v=8rl7u3SPQpY",
        "videoId": "8rl7u3SPQpY"
      },
      {
        "name": "旨醞鐵板燒",
        "bgImage": "/vfx/A/A-013.png",
        "url": "https://www.facebook.com/reel/2203781970428596?locale=zh_TW",
        "videoId": "2203781970428596",
        "isFacebook": true
      },
      {
        "name": "活沛多",
        "bgImage": "/vfx/A/A-014.png",
        "url": "https://www.youtube.com/watch?v=Y4CG2QNa5hs",
        "videoId": "Y4CG2QNa5hs"
      },
      {
        "name": "格蘭利威",
        "bgImage": "/vfx/A/A-015.png"
      },
      {
        "name": "桂格喝的燕麥",
        "bgImage": "/vfx/A/A-016.png",
        "url": "https://www.instagram.com/p/DN7VHH2DbeC/"
      },
      {
        "name": "桂格奇亞籽麥片",
        "bgImage": "/vfx/A/A-017.png",
        "url": "https://www.facebook.com/quaker.tw/videos/1095555185815161/",
        "videoId": "1095555185815161",
        "isFacebook": true
      },
      {
        "name": "桂格",
        "bgImage": "/vfx/A/A-018.png",
        "url": "https://www.youtube.com/watch?v=lxRJO_qPcWQ",
        "videoId": "lxRJO_qPcWQ"
      },
      {
        "name": "泰山八寶粥",
        "bgImage": "/vfx/A/A-019.png",
        "url": "https://www.youtube.com/watch?v=ry5k_i-XhVE",
        "videoId": "ry5k_i-XhVE"
      },
      {
        "name": "健酪乳酸飲料",
        "bgImage": "/vfx/A/A-020.png",
        "url": "https://www.youtube.com/watch?v=qJqmBWZxbdo",
        "videoId": "qJqmBWZxbdo"
      },
      {
        "name": "黑松茶花",
        "bgImage": "/vfx/A/A-021.png",
        "url": "https://www.youtube.com/watch?v=TRqUVCCZwRU",
        "videoId": "TRqUVCCZwRU"
      },
      {
        "name": "黑松茶花",
        "bgImage": "/vfx/A/A-022.png",
        "url": "https://www.youtube.com/watch?v=cKbH-CxdjxY",
        "videoId": "cKbH-CxdjxY"
      },
      {
        "name": "瑞穗鮮乳",
        "bgImage": "/vfx/A/A-023.png",
        "url": "https://www.youtube.com/watch?v=owT3Sj_So60",
        "videoId": "owT3Sj_So60"
      },
      {
        "name": "義美生機",
        "bgImage": "/vfx/A/A-024.png",
        "url": "https://www.youtube.com/watch?v=kakD_HQkIQU",
        "videoId": "kakD_HQkIQU"
      },
      {
        "name": "裸雀威士忌",
        "bgImage": "/vfx/A/A-025.png"
      },
      {
        "name": "維他露P+",
        "bgImage": "/vfx/A/A-026.png",
        "url": "https://www.youtube.com/watch?v=AyQQZ37OPfU",
        "videoId": "AyQQZ37OPfU"
      },
      {
        "name": "樂事",
        "bgImage": "/vfx/A/A-027.png",
        "url": "https://www.youtube.com/watch?v=zQfi9U_023I",
        "videoId": "zQfi9U_023I"
      },
      {
        "name": "多力多滋",
        "bgImage": "/vfx/A/A-028.png"
      }
    ]
  },
  {
    "id": "tech",
    "name": "3C與家電",
    "items": [
      {
        "name": "panasonic 瞬熱式溫水洗淨便座",
        "bgImage": "/vfx/B/B-01.png",
        "url": "https://www.youtube.com/watch?v=SMCldr-5kbg",
        "videoId": "SMCldr-5kbg"
      },
      {
        "name": "Panasonic 電視",
        "bgImage": "/vfx/B/B-02.png",
        "url": "https://www.youtube.com/watch?v=J8IkANYZD3s",
        "videoId": "J8IkANYZD3s"
      },
      {
        "name": "Panasonic 蒸氣電熨斗",
        "bgImage": "/vfx/B/B-03.png",
        "url": "https://www.facebook.com/watch/?v=844958797010401",
        "videoId": "844958797010401",
        "isFacebook": true
      },
      {
        "name": "Panasonic W音波電動牙刷",
        "bgImage": "/vfx/B/B-04.png",
        "url": "https://www.facebook.com/PanasonicBeautyTaiwan/videos/1352504146494183/",
        "videoId": "1352504146494183",
        "isFacebook": true
      },
      {
        "name": "Panasonic 吸頂燈",
        "bgImage": "/vfx/B/B-05.png",
        "url": "https://www.facebook.com/PanasonicTaiwan/videos/634112755292450/",
        "videoId": "634112755292450",
        "isFacebook": true
      },
      {
        "name": "Samsung S22",
        "bgImage": "/vfx/B/B-06.png",
        "url": "https://www.youtube.com/watch?v=UkSewV5ScR0",
        "videoId": "UkSewV5ScR0"
      },
      {
        "name": "Samsung Z Fold2｜Z Flip2",
        "bgImage": "/vfx/B/B-07.png",
        "url": "https://www.facebook.com/watch/?v=1046986065709266",
        "videoId": "1046986065709266",
        "isFacebook": true
      },
      {
        "name": "Samsung Z Fold3｜Z Flip3",
        "bgImage": "/vfx/B/B-08.png",
        "url": "https://www.facebook.com/watch/?v=558217842125093",
        "videoId": "558217842125093",
        "isFacebook": true
      },
      {
        "name": "Samsung Z Fold4｜Z Flip4",
        "bgImage": "/vfx/B/B-09.png"
      },
      {
        "name": "Samsung Galaxy Tab S11 Ultra",
        "bgImage": "/vfx/B/B-10.png",
        "url": "https://www.facebook.com/reel/1338163857656555",
        "videoId": "1338163857656555",
        "isFacebook": true
      },
      {
        "name": "Sony Xperia",
        "bgImage": "/vfx/B/B-11.png"
      },
      {
        "name": "Tokuyo按摩椅",
        "bgImage": "/vfx/B/B-12.png",
        "url": "https://www.youtube.com/watch?v=_SENfBsNjgE",
        "videoId": "_SENfBsNjgE"
      },
      {
        "name": "三菱重工空調",
        "bgImage": "/vfx/B/B-13.png",
        "url": "https://www.youtube.com/watch?v=fanfOOV80ok",
        "videoId": "fanfOOV80ok"
      },
      {
        "name": "三菱電機",
        "bgImage": "/vfx/B/B-14.png",
        "url": "https://www.facebook.com/watch/?v=824057254764949",
        "videoId": "824057254764949",
        "isFacebook": true
      },
      {
        "name": "中華電信",
        "bgImage": "/vfx/B/B-15.png"
      }
    ]
  },
  {
    "id": "vehicle",
    "name": "交通工具",
    "items": [
      {
        "name": "Audi",
        "bgImage": "/vfx/C/C-01.png",
        "url": "https://www.youtube.com/watch?v=vgf14stUB0w",
        "videoId": "vgf14stUB0w"
      },
      {
        "name": "foxtron caviar",
        "bgImage": null
      },
      {
        "name": "Gogoro EZZY",
        "bgImage": "/vfx/C/C-03.png",
        "url": "https://www.youtube.com/watch?v=4apkzFFsV4E",
        "videoId": "4apkzFFsV4E"
      },
      {
        "name": "Gogoro Pulse",
        "bgImage": "/vfx/C/C-04.png",
        "url": "https://www.youtube.com/watch?v=Wyijlye4kMg",
        "videoId": "Wyijlye4kMg"
      },
      {
        "name": "Gogoro JEGO",
        "bgImage": "/vfx/C/C-05.png",
        "url": "https://www.youtube.com/watch?v=54Yr36d251s",
        "videoId": "54Yr36d251s"
      },
      {
        "name": "Škoda Kodiaq",
        "bgImage": "/vfx/C/C-06.png",
        "url": "https://www.youtube.com/watch?v=I8jdO9GQVkM",
        "videoId": "I8jdO9GQVkM"
      },
      {
        "name": "Mazda",
        "bgImage": "/vfx/C/C-07.png",
        "url": "https://www.youtube.com/watch?v=V7t6AvjDl80",
        "videoId": "V7t6AvjDl80"
      },
      {
        "name": "Momentum Bicycles",
        "bgImage": "/vfx/C/C-08.png",
        "url": "https://www.youtube.com/watch?v=iIdgx-eoAT0",
        "videoId": "iIdgx-eoAT0"
      },
      {
        "name": "中華航空",
        "bgImage": "/vfx/C/C-09.png",
        "url": "https://www.youtube.com/watch?v=8YC6qYvByU8",
        "videoId": "8YC6qYvByU8"
      },
      {
        "name": "長榮航空",
        "bgImage": "/vfx/C/C-10.png",
        "url": "https://www.youtube.com/watch?v=bQZxUBpimgY",
        "videoId": "bQZxUBpimgY"
      },
      {
        "name": "長榮航空 Bizfam",
        "bgImage": "/vfx/C/C-11.png",
        "url": "https://www.facebook.com/evaairwayscorp.tw/videos/668508182730128/",
        "videoId": "668508182730128",
        "isFacebook": true
      },
      {
        "name": "長榮航太",
        "bgImage": "/vfx/C/C-12.png",
        "url": "https://www.youtube.com/watch?v=yuUHorteLAw",
        "videoId": "yuUHorteLAw"
      }
    ]
  },
  {
    "id": "lifestyle",
    "name": "生活與百貨",
    "items": [
      {
        "name": "Ariel 抗菌洗衣精",
        "bgImage": "/vfx/D/D-01.png"
      },
      {
        "name": "Foodpanda",
        "bgImage": "/vfx/D/D-02.png"
      },
      {
        "name": "HOLA",
        "bgImage": "/vfx/D/D-03.png",
        "url": "https://www.youtube.com/watch?v=Q9LzOnPCeNY",
        "videoId": "Q9LzOnPCeNY"
      },
      {
        "name": "HOLA",
        "bgImage": "/vfx/D/D-04.png",
        "url": "https://www.youtube.com/watch?v=j8XBx4yFsN8",
        "videoId": "j8XBx4yFsN8"
      },
      {
        "name": "LaLaport南港",
        "bgImage": "/vfx/D/D-05.png",
        "url": "https://www.youtube.com/watch?v=tDANOqHSnTE",
        "videoId": "tDANOqHSnTE"
      },
      {
        "name": "UberEats",
        "bgImage": "/vfx/D/D-06.png"
      },
      {
        "name": "五月花極上系列",
        "bgImage": "/vfx/D/D-07.png",
        "url": "https://www.youtube.com/watch?v=Dr7e8rl7spg",
        "videoId": "Dr7e8rl7spg"
      },
      {
        "name": "舒潔 喀什米爾",
        "bgImage": "/vfx/D/D-08.png",
        "url": "https://www.youtube.com/watch?v=nFl6OMheFho",
        "videoId": "nFl6OMheFho"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-09.png",
        "url": "https://www.youtube.com/watch?v=rYPjfcAH-rc",
        "videoId": "rYPjfcAH-rc"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-10.png",
        "url": "https://www.youtube.com/watch?v=F7SOWrCCJyM",
        "videoId": "F7SOWrCCJyM"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-11.png",
        "url": "https://www.youtube.com/watch?v=UFPNdAaG0_M",
        "videoId": "UFPNdAaG0_M"
      },
      {
        "name": "犀牛盾",
        "bgImage": "/vfx/D/D-12.png",
        "url": "https://www.youtube.com/watch?v=yjl03-QCzbM",
        "videoId": "yjl03-QCzbM"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-13.png",
        "url": "https://www.youtube.com/watch?v=xS3VLzTJxs0",
        "videoId": "xS3VLzTJxs0"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-14.png",
        "url": "https://www.youtube.com/watch?v=7bpKC3naivA",
        "videoId": "7bpKC3naivA"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-15.png",
        "url": "https://www.youtube.com/watch?v=QC2Adq-3lOc",
        "videoId": "QC2Adq-3lOc"
      },
      {
        "name": "錦鋐氣密窗",
        "bgImage": "/vfx/D/D-16.png",
        "url": "https://www.youtube.com/watch?v=BOj8-iDaB0s",
        "videoId": "BOj8-iDaB0s"
      },
      {
        "name": "魔術靈",
        "bgImage": "/vfx/D/D-17.png"
      }
    ]
  },
  {
    "id": "beauty",
    "name": "美妝與健康",
    "items": [
      {
        "name": "1028睫毛膏",
        "bgImage": "/vfx/E/E-01.png",
        "url": "https://www.youtube.com/watch?v=pHGEKlXxdgY",
        "videoId": "pHGEKlXxdgY"
      },
      {
        "name": "Acuu-Chek羅氏血糖機",
        "bgImage": "/vfx/E/E-02.png",
        "url": "https://www.youtube.com/watch?v=HUaASbBDOSM",
        "videoId": "HUaASbBDOSM"
      },
      {
        "name": "Bifesta 碧菲絲特",
        "bgImage": "/vfx/E/E-03.png",
        "url": "https://www.youtube.com/shorts/jPH0atsz3UY",
        "videoId": "jPH0atsz3UY"
      },
      {
        "name": "Calm Night Day淨日夜",
        "bgImage": "/vfx/E/E-04.png",
        "url": "https://www.youtube.com/watch?v=_ociCDswXUI",
        "videoId": "_ociCDswXUI"
      },
      {
        "name": "EMSCULPT肌動減脂",
        "bgImage": "/vfx/E/E-05.png",
        "url": "https://www.youtube.com/watch?v=SJqwyPXT1CI",
        "videoId": "SJqwyPXT1CI"
      },
      {
        "name": "LUX髮的補給",
        "bgImage": "/vfx/E/E-06.png",
        "url": "https://www.facebook.com/watch/?v=822528356385191",
        "videoId": "822528356385191",
        "isFacebook": true
      },
      {
        "name": "MAMA 永恆光燦系列",
        "bgImage": "/vfx/E/E-07.png"
      },
      {
        "name": "TKLAB",
        "bgImage": "/vfx/E/E-08.png",
        "url": "https://www.facebook.com/TKLAB.tw/videos/1495921932163292",
        "videoId": "1495921932163292",
        "isFacebook": true
      },
      {
        "name": "三得利 蜂王乳+芝麻明E",
        "bgImage": "/vfx/E/E-09.png"
      },
      {
        "name": "三得利 蜜露珂娜",
        "bgImage": "/vfx/E/E-10.png"
      },
      {
        "name": "三得利 密得絲",
        "bgImage": "/vfx/E/E-11.png"
      },
      {
        "name": "舒潔女性濕式衛生紙",
        "bgImage": "/vfx/E/E-12.png",
        "url": "https://www.youtube.com/watch?v=YG70M6HajCU",
        "videoId": "YG70M6HajCU"
      },
      {
        "name": "蕾妮亞",
        "bgImage": "/vfx/E/E-13.png",
        "url": "https://www.instagram.com/reels/DLjzvwEyK6A/"
      }
    ]
  },
  {
    "id": "finance",
    "name": "金融與保險",
    "items": [
      {
        "name": "中國信託 點燃生命之火",
        "bgImage": "/vfx/F/F-01.png",
        "url": "https://www.youtube.com/watch?v=u1uWyX51Prc&list=PLfRfUZjsbf4RuYO75RLGDmhQ3hhbX0Ul5&index=37",
        "videoId": "u1uWyX51Prc"
      },
      {
        "name": "台灣Pay",
        "bgImage": "/vfx/F/F-02.png",
        "url": "https://www.youtube.com/watch?v=gsQScjFurQs",
        "videoId": "gsQScjFurQs"
      },
      {
        "name": "台灣Pay",
        "bgImage": "/vfx/F/F-03.png",
        "url": "https://www.youtube.com/watch?v=ckgbItI0kaw",
        "videoId": "ckgbItI0kaw"
      },
      {
        "name": "安聯人壽",
        "bgImage": "/vfx/F/F-04.png",
        "url": "https://www.facebook.com/AllianzTaiwanLife/videos/1014825593450292/",
        "videoId": "1014825593450292",
        "isFacebook": true
      },
      {
        "name": "復華投信",
        "bgImage": "/vfx/F/F-05.png",
        "url": "https://www.youtube.com/watch?v=8OiOhQbAvHg",
        "videoId": "8OiOhQbAvHg"
      },
      {
        "name": "富達投信",
        "bgImage": "/vfx/F/F-06.png",
        "url": "https://www.youtube.com/watch?v=QILBfZPs-Fo",
        "videoId": "QILBfZPs-Fo"
      },
      {
        "name": "遠雄人壽",
        "bgImage": "/vfx/F/F-07.png",
        "url": "https://www.youtube.com/watch?v=0OEmLKIjAtk",
        "videoId": "0OEmLKIjAtk"
      },
      {
        "name": "渣打銀行",
        "bgImage": "/vfx/F/F-08.png",
        "url": "https://www.youtube.com/watch?v=OBTrK1ukstc",
        "videoId": "OBTrK1ukstc"
      },
      {
        "name": "磊山保經",
        "bgImage": "/vfx/F/F-09.png",
        "url": "https://www.youtube.com/watch?v=Rwrn87N2PUc",
        "videoId": "Rwrn87N2PUc"
      }
    ]
  }
];

const BrandCard = React.forwardRef(({ item, onPlayVideo }, ref) => {
  const hasVideo = !!item.videoId || !!item.url;

  const handleClick = () => {
    if (!hasVideo) return;
    if (item.videoId) {
      onPlayVideo(item.videoId, !!item.isFacebook);
    } else if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onClick={handleClick}
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
          {/* 全區域暗化遮罩，用來壓低高光 */}
          <div className="absolute inset-0 bg-black/25" />
          {/* 強化的漸層遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/25" />
        </div>
      )}

      {/* 淡淡的金色漸層 hover 底色 (僅限有影片且無 bgImage) */}
      {hasVideo && !item.bgImage && (
        <div className="absolute inset-0 bg-gradient-to-tr from-aurora-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      <div className="relative z-10">
        <div 
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.95), 0 0 1px rgba(0,0,0,0.8)' }}
          className={`text-xs tracking-wide transition-colors duration-300 leading-snug ${
            hasVideo
              ? 'text-zinc-100 group-hover:text-white font-semibold'
              : 'text-zinc-200 font-semibold'
          }`}
        >
          {item.name}
        </div>
      </div>

      {hasVideo ? (
        <div 
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
          className="relative z-10 mt-2.5 flex items-center gap-1 text-[9px] text-aurora-blue font-black tracking-widest uppercase opacity-90 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"
        >
          <Play size={8} fill="currentColor" /> Play Reel
        </div>
      ) : (
        <div 
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}
          className="relative z-10 mt-2.5 text-[6px] text-zinc-400 mono tracking-widest uppercase"
        >
          // ARCHIVE
        </div>
      )}
    </motion.div>
  );
});

BrandCard.displayName = 'BrandCard';

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
            beauty: 'BEAUTY & HEALTH',
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
                  : 'border-zinc-855 text-zinc-400 bg-zinc-955/20 hover:text-white hover:border-zinc-700'
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
          {currentCategory.items.map((item, index) => (
            <BrandCard key={`${activeTab}-${item.name}-${index}`} item={item} onPlayVideo={onPlayVideo} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
