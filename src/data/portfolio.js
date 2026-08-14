const BASE_URL = import.meta.env.BASE_URL || '/';

export function normalizeItem(item) {
  if (!item) return null;
  const bgImage = item.bgImage
    ? (item.bgImage.startsWith('/') ? `${BASE_URL}${item.bgImage.slice(1)}` : item.bgImage)
    : null;
  const hasVideo = !!item.videoId || !!item.url;
  return { ...item, bgImage, hasVideo };
}

export const categories = [
  {
    "id": "food",
    "name": "食品與飲料",
    "items": [
      {
        "name": "Extra",
        "bgImage": "/vfx/A/A-001.webp",
        "url": "https://www.youtube.com/shorts/n3c3DDBMUnA",
        "videoId": "n3c3DDBMUnA",
        "aspect": "portrait"
      },
      {
        "name": "Johnnie Walker",
        "bgImage": "/vfx/A/A-002.webp"
      },
      {
        "name": "TOBLERONE 三角巧克力",
        "bgImage": "/vfx/A/A-003.webp",
        "url": "https://www.youtube.com/watch?v=exDc-2Xnb4E&t=1s",
        "videoId": "exDc-2Xnb4E"
      },
      {
        "name": "UCC",
        "bgImage": "/vfx/A/A-004.webp",
        "url": "https://www.youtube.com/watch?v=AuuxyMIutf8",
        "videoId": "AuuxyMIutf8"
      },
      {
        "name": "好侍咖哩",
        "bgImage": "/vfx/A/A-006.webp",
        "url": "https://www.youtube.com/watch?v=jScTOFsO97U",
        "videoId": "jScTOFsO97U"
      },
      {
        "name": "伯朗EX雙倍濃烈咖啡",
        "bgImage": "/vfx/A/A-007.webp",
        "url": "https://www.youtube.com/watch?v=UmoyLNbcevQ",
        "videoId": "UmoyLNbcevQ"
      },
      {
        "name": "每朝双纖綠茶",
        "bgImage": "/vfx/A/A-008.webp",
        "url": "https://www.youtube.com/watch?v=w1EUT4JnHck",
        "videoId": "w1EUT4JnHck"
      },
      {
        "name": "每朝健康",
        "bgImage": "/vfx/A/A-009.webp",
        "url": "https://www.youtube.com/watch?v=_xC48BnWOAQ",
        "videoId": "_xC48BnWOAQ"
      },
      {
        "name": "噶瑪蘭威士忌",
        "bgImage": "/vfx/A/A-010.webp"
      },
      {
        "name": "柏克金啤酒",
        "bgImage": "/vfx/A/A-011.webp",
        "url": "https://www.youtube.com/watch?v=aKYv6_VMPFI",
        "videoId": "aKYv6_VMPFI"
      },
      {
        "name": "金門高粱千日醇",
        "bgImage": "/vfx/A/A-012.webp",
        "url": "https://www.youtube.com/watch?v=8rl7u3SPQpY",
        "videoId": "8rl7u3SPQpY"
      },
      {
        "name": "旨醞 鐵板料理",
        "bgImage": "/vfx/A/A-013.webp",
        "url": "https://www.facebook.com/reel/2203781970428596?locale=zh_TW",
        "videoId": "2203781970428596",
        "isFacebook": true,
        "aspect": "portrait"
      },
      {
        "name": "桂格喝的燕麥",
        "bgImage": "/vfx/A/A-016.webp",
        "url": "https://www.instagram.com/p/DN7VHH2DbeC/"
      },
      {
        "name": "桂格奇亞籽麥片",
        "bgImage": "/vfx/A/A-017.webp",
        "url": "https://www.facebook.com/quaker.tw/videos/1095555185815161/",
        "videoId": "1095555185815161",
        "isFacebook": true
      },
      {
        "name": "桂格 企業形象影片",
        "bgImage": "/vfx/A/A-018.webp",
        "url": "https://www.youtube.com/watch?v=lxRJO_qPcWQ",
        "videoId": "lxRJO_qPcWQ"
      },
      {
        "name": "泰山八寶粥",
        "bgImage": "/vfx/A/A-019.webp",
        "url": "https://www.youtube.com/watch?v=ry5k_i-XhVE",
        "videoId": "ry5k_i-XhVE"
      },
      {
        "name": "健酪乳酸飲料",
        "bgImage": "/vfx/A/A-020.webp",
        "url": "https://www.youtube.com/watch?v=qJqmBWZxbdo",
        "videoId": "qJqmBWZxbdo"
      },
      {
        "name": "黑松茶花",
        "bgImage": "/vfx/A/A-022.webp",
        "url": "https://www.youtube.com/watch?v=cKbH-CxdjxY",
        "videoId": "cKbH-CxdjxY"
      },
      {
        "name": "瑞穗鮮乳",
        "bgImage": "/vfx/A/A-023.webp",
        "url": "https://www.youtube.com/watch?v=owT3Sj_So60",
        "videoId": "owT3Sj_So60"
      },
      {
        "name": "義美生機",
        "bgImage": "/vfx/A/A-024.webp",
        "url": "https://www.youtube.com/watch?v=kakD_HQkIQU",
        "videoId": "kakD_HQkIQU"
      },
      {
        "name": "裸雀威士忌",
        "bgImage": "/vfx/A/A-025.webp"
      },
      {
        "name": "維他露P+",
        "bgImage": "/vfx/A/A-026.webp",
        "url": "https://www.youtube.com/watch?v=AyQQZ37OPfU",
        "videoId": "AyQQZ37OPfU"
      },
      {
        "name": "德克士炸雞",
        "bgImage": "/vfx/A/A-027.webp",
        "url": "https://www.facebook.com/reel/1958394558203679",
        "videoId": "1958394558203679",
        "isFacebook": true,
        "aspect": "portrait"
      }
    ]
  },
  {
    "id": "tech",
    "name": "3C與家電",
    "items": [
      {
        "name": "Panasonic 溫水洗淨便座",
        "bgImage": "/vfx/B/B-01.webp",
        "url": "https://www.youtube.com/watch?v=SMCldr-5kbg",
        "videoId": "SMCldr-5kbg"
      },
      {
        "name": "Panasonic Viera 電視",
        "bgImage": "/vfx/B/B-02.webp",
        "url": "https://www.youtube.com/watch?v=J8IkANYZD3s",
        "videoId": "J8IkANYZD3s"
      },
      {
        "name": "Panasonic 蒸氣電熨斗",
        "bgImage": "/vfx/B/B-03.webp",
        "url": "https://www.facebook.com/watch/?v=844958797010401",
        "videoId": "844958797010401",
        "isFacebook": true
      },
      {
        "name": "Panasonic W音波電動牙刷",
        "bgImage": "/vfx/B/B-04.webp",
        "url": "https://www.facebook.com/PanasonicBeautyTaiwan/videos/1352504146494183/",
        "videoId": "1352504146494183",
        "isFacebook": true
      },
      {
        "name": "Panasonic 吸頂燈",
        "bgImage": "/vfx/B/B-05.webp",
        "url": "https://www.facebook.com/PanasonicTaiwan/videos/634112755292450/",
        "videoId": "634112755292450",
        "isFacebook": true
      },
      {
        "name": "Panasonic 冷萃咖啡機",
        "bgImage": "/vfx/B/B-05_coffee.webp",
        "url": "https://www.facebook.com/PanasonicCooking/videos/1251224095275421/?locale=ms_MY",
        "videoId": "1251224095275421",
        "isFacebook": true
      },
      {
        "name": "Samsung Galaxy S22",
        "bgImage": "/vfx/B/B-06.webp",
        "url": "https://www.youtube.com/watch?v=UkSewV5ScR0",
        "videoId": "UkSewV5ScR0"
      },
      {
        "name": "Samsung Z Fold2 / Z Flip2",
        "bgImage": "/vfx/B/B-07.webp",
        "url": "https://www.facebook.com/watch/?v=1046986065709266",
        "videoId": "1046986065709266",
        "isFacebook": true
      },
      {
        "name": "Samsung Z Fold3 / Z Flip3",
        "bgImage": "/vfx/B/B-08.webp",
        "url": "https://www.facebook.com/watch/?v=558217842125093",
        "videoId": "558217842125093",
        "isFacebook": true
      },
      {
        "name": "Samsung Z Fold4 / Z Flip4",
        "bgImage": "/vfx/B/B-09.webp"
      },
      {
        "name": "Samsung Galaxy Tab S11 Ultra",
        "bgImage": "/vfx/B/B-10.webp",
        "url": "https://www.facebook.com/reel/1338163857656555",
        "videoId": "1338163857656555",
        "isFacebook": true,
        "aspect": "portrait"
      },
      {
        "name": "Sony Xperia",
        "bgImage": "/vfx/B/B-11.webp"
      },
      {
        "name": "Tokuyo 按摩椅",
        "bgImage": "/vfx/B/B-12.webp",
        "url": "https://www.youtube.com/watch?v=_SENfBsNjgE",
        "videoId": "_SENfBsNjgE"
      },
      {
        "name": "三菱重工空調",
        "bgImage": "/vfx/B/B-13.webp",
        "url": "https://www.youtube.com/watch?v=fanfOOV80ok",
        "videoId": "fanfOOV80ok"
      },
      {
        "name": "三菱電機",
        "bgImage": "/vfx/B/B-14.webp",
        "url": "https://www.facebook.com/watch/?v=824057254764949",
        "videoId": "824057254764949",
        "isFacebook": true
      },
      {
        "name": "中華電信 企業形象影片",
        "bgImage": "/vfx/B/B-15.webp"
      }
    ]
  },
  {
    "id": "vehicle",
    "name": "交通工具",
    "items": [
      {
        "name": "Audi",
        "bgImage": "/vfx/C/C-01.webp",
        "url": "https://www.youtube.com/watch?v=vgf14stUB0w",
        "videoId": "vgf14stUB0w"
      },
      {
        "name": "Foxtron Caviar",
        "bgImage": "/vfx/C/C-02.webp",
        "url": "https://youtu.be/pCBQA1vEDig?si=lbbvGmTm90P5Vx4P",
        "videoId": "pCBQA1vEDig"
      },
      {
        "name": "Gogoro EZZY",
        "bgImage": "/vfx/C/C-03.webp",
        "url": "https://www.youtube.com/watch?v=4apkzFFsV4E",
        "videoId": "4apkzFFsV4E"
      },
      {
        "name": "Gogoro Pulse",
        "bgImage": "/vfx/C/C-04.webp",
        "url": "https://www.youtube.com/watch?v=Wyijlye4kMg",
        "videoId": "Wyijlye4kMg"
      },
      {
        "name": "Gogoro JEGO",
        "bgImage": "/vfx/C/C-05.webp",
        "url": "https://www.youtube.com/watch?v=54Yr36d251s",
        "videoId": "54Yr36d251s"
      },
      {
        "name": "Škoda Kodiaq",
        "bgImage": "/vfx/C/C-06.webp",
        "url": "https://www.youtube.com/watch?v=I8jdO9GQVkM",
        "videoId": "I8jdO9GQVkM"
      },
      {
        "name": "Mazda",
        "bgImage": "/vfx/C/C-07.webp",
        "url": "https://www.youtube.com/watch?v=V7t6AvjDl80",
        "videoId": "V7t6AvjDl80"
      },
      {
        "name": "Momentum Bicycles",
        "bgImage": "/vfx/C/C-08.webp",
        "url": "https://www.youtube.com/watch?v=iIdgx-eoAT0",
        "videoId": "iIdgx-eoAT0"
      },
      {
        "name": "中華航空",
        "bgImage": "/vfx/C/C-09.webp",
        "url": "https://www.youtube.com/watch?v=8YC6qYvByU8",
        "videoId": "8YC6qYvByU8"
      },
      {
        "name": "長榮航空",
        "bgImage": "/vfx/C/C-10.webp",
        "url": "https://www.youtube.com/watch?v=bQZxUBpimgY",
        "videoId": "bQZxUBpimgY"
      },
      {
        "name": "長榮航空 Bizfam",
        "bgImage": "/vfx/C/C-11.webp",
        "url": "https://www.facebook.com/evaairwayscorp.tw/videos/668508182730128/",
        "videoId": "668508182730128",
        "isFacebook": true
      },
      {
        "name": "長榮航太",
        "bgImage": "/vfx/C/C-12.webp",
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
        "bgImage": "/vfx/D/D-01.webp"
      },
      {
        "name": "Foodpanda",
        "bgImage": "/vfx/D/D-02.webp"
      },
      {
        "name": "HOLA",
        "bgImage": "/vfx/D/D-03.webp",
        "url": "https://www.youtube.com/watch?v=Q9LzOnPCeNY",
        "videoId": "Q9LzOnPCeNY"
      },
      {
        "name": "HOLA",
        "bgImage": "/vfx/D/D-04.webp",
        "url": "https://www.youtube.com/watch?v=j8XBx4yFsN8",
        "videoId": "j8XBx4yFsN8"
      },
      {
        "name": "LaLaport 南港",
        "bgImage": "/vfx/D/D-05.webp",
        "url": "https://www.youtube.com/watch?v=tDANOqHSnTE",
        "videoId": "tDANOqHSnTE"
      },
      {
        "name": "UberEats",
        "bgImage": "/vfx/D/D-06.webp"
      },
      {
        "name": "五月花極上系列",
        "bgImage": "/vfx/D/D-07.webp",
        "url": "https://www.youtube.com/watch?v=Dr7e8rl7spg",
        "videoId": "Dr7e8rl7spg"
      },
      {
        "name": "舒潔 喀什米爾衛生紙",
        "bgImage": "/vfx/D/D-08.webp",
        "url": "https://www.youtube.com/watch?v=nFl6OMheFho",
        "videoId": "nFl6OMheFho"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-09.webp",
        "url": "https://www.youtube.com/watch?v=rYPjfcAH-rc",
        "videoId": "rYPjfcAH-rc"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-10.webp",
        "url": "https://www.youtube.com/watch?v=F7SOWrCCJyM",
        "videoId": "F7SOWrCCJyM"
      },
      {
        "name": "東和鋼鐵",
        "bgImage": "/vfx/D/D-11.webp",
        "url": "https://www.youtube.com/watch?v=UFPNdAaG0_M",
        "videoId": "UFPNdAaG0_M"
      },
      {
        "name": "犀牛盾",
        "bgImage": "/vfx/D/D-12.webp",
        "url": "https://www.youtube.com/watch?v=yjl03-QCzbM",
        "videoId": "yjl03-QCzbM"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-13.webp",
        "url": "https://www.youtube.com/watch?v=xS3VLzTJxs0",
        "videoId": "xS3VLzTJxs0"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-14.webp",
        "url": "https://www.youtube.com/watch?v=7bpKC3naivA",
        "videoId": "7bpKC3naivA"
      },
      {
        "name": "新光三越",
        "bgImage": "/vfx/D/D-15.webp",
        "url": "https://www.youtube.com/watch?v=QC2Adq-3lOc",
        "videoId": "QC2Adq-3lOc"
      },
      {
        "name": "錦鋐氣密窗",
        "bgImage": "/vfx/D/D-16.webp",
        "url": "https://www.youtube.com/watch?v=BOj8-iDaB0s",
        "videoId": "BOj8-iDaB0s"
      },
      {
        "name": "魔術靈",
        "bgImage": "/vfx/D/D-17.webp"
      }
    ]
  },
  {
    "id": "beauty",
    "name": "美妝與健康",
    "items": [
      {
        "name": "1028 睫毛膏",
        "bgImage": "/vfx/E/E-01.webp",
        "url": "https://www.youtube.com/watch?v=pHGEKlXxdgY",
        "videoId": "pHGEKlXxdgY"
      },
      {
        "name": "Acuu-Chek 羅氏血糖機",
        "bgImage": "/vfx/E/E-02.webp",
        "url": "https://www.youtube.com/watch?v=HUaASbBDOSM",
        "videoId": "HUaASbBDOSM"
      },
      {
        "name": "Bifesta 碧菲絲特",
        "bgImage": "/vfx/E/E-03.webp",
        "url": "https://www.youtube.com/shorts/jPH0atsz3UY",
        "videoId": "jPH0atsz3UY"
      },
      {
        "name": "Calm Night Day 淨日夜沐浴露",
        "bgImage": "/vfx/E/E-04.webp",
        "url": "https://www.youtube.com/watch?v=_ociCDswXUI",
        "videoId": "_ociCDswXUI"
      },
      {
        "name": "EMSCULPT 肌動減脂",
        "bgImage": "/vfx/E/E-05.webp",
        "url": "https://www.youtube.com/watch?v=SJqwyPXT1CI",
        "videoId": "SJqwyPXT1CI"
      },
      {
        "name": "LUX 髮的補給",
        "bgImage": "/vfx/E/E-06.webp",
        "url": "https://www.facebook.com/watch/?v=822528356385191",
        "videoId": "822528356385191",
        "isFacebook": true
      },
      {
        "name": "MAMA 永恆光燦系列",
        "bgImage": "/vfx/E/E-07.webp"
      },
      {
        "name": "TKLAB",
        "bgImage": "/vfx/E/E-08.webp",
        "url": "https://www.facebook.com/TKLAB.tw/videos/1495921932163292",
        "videoId": "1495921932163292",
        "isFacebook": true,
        "aspect": "square"
      },
      {
        "name": "活沛多",
        "bgImage": "/vfx/A/A-014.webp",
        "url": "https://www.youtube.com/watch?v=Y4CG2QNa5hs",
        "videoId": "Y4CG2QNa5hs"
      },
      {
        "name": "大本山 益生菌",
        "bgImage": "/vfx/E/E-16_dabenshan.webp",
        "url": "https://www.youtube.com/watch?v=llWjKbg46OM",
        "videoId": "llWjKbg46OM"
      },
      {
        "name": "三得利 蜂王乳+芝麻明E",
        "bgImage": "/vfx/E/E-09.webp"
      },
      {
        "name": "三得利 蜜露珂娜",
        "bgImage": "/vfx/E/E-10.webp"
      },
      {
        "name": "三得利 密得絲",
        "bgImage": "/vfx/E/E-11.webp"
      },
      {
        "name": "舒潔 女性濕式衛生紙",
        "bgImage": "/vfx/E/E-12.webp",
        "url": "https://www.youtube.com/watch?v=YG70M6HajCU",
        "videoId": "YG70M6HajCU"
      },
      {
        "name": "蕾妮亞",
        "bgImage": "/vfx/E/E-13.webp",
        "url": "https://www.instagram.com/reels/DLjzvwEyK6A/"
      },
      {
        "name": "義美生醫 鈣D加",
        "bgImage": "/vfx/E/E-14_imei.webp",
        "url": "https://www.youtube.com/watch?v=bbl9tJP92IY",
        "videoId": "bbl9tJP92IY"
      },
      {
        "name": "台灣武田合利他命 A25",
        "bgImage": "/vfx/E/E-15_alinamin.webp"
      }
    ]
  },
  {
    "id": "finance",
    "name": "金融與保險",
    "items": [
      {
        "name": "中國信託 點燃生命之火",
        "bgImage": "/vfx/F/F-01.webp",
        "url": "https://www.youtube.com/watch?v=u1uWyX51Prc&list=PLfRfUZjsbf4RuYO75RLGDmhQ3hhbX0Ul5&index=37",
        "videoId": "u1uWyX51Prc"
      },
      {
        "name": "台灣Pay",
        "bgImage": "/vfx/F/F-02.webp",
        "url": "https://www.youtube.com/watch?v=gsQScjFurQs",
        "videoId": "gsQScjFurQs"
      },
      {
        "name": "台灣Pay",
        "bgImage": "/vfx/F/F-03.webp",
        "url": "https://www.youtube.com/watch?v=ckgbItI0kaw",
        "videoId": "ckgbItI0kaw"
      },
      {
        "name": "安聯人壽",
        "bgImage": "/vfx/F/F-04.webp",
        "url": "https://www.facebook.com/AllianzTaiwanLife/videos/1014825593450292/",
        "videoId": "1014825593450292",
        "isFacebook": true
      },
      {
        "name": "復華投信",
        "bgImage": "/vfx/F/F-05.webp",
        "url": "https://www.youtube.com/watch?v=8OiOhQbAvHg",
        "videoId": "8OiOhQbAvHg"
      },
      {
        "name": "富達投信",
        "bgImage": "/vfx/F/F-06.webp",
        "url": "https://www.youtube.com/watch?v=QILBfZPs-Fo",
        "videoId": "QILBfZPs-Fo"
      },
      {
        "name": "遠雄人壽",
        "bgImage": "/vfx/F/F-07.webp",
        "url": "https://www.youtube.com/watch?v=0OEmLKIjAtk",
        "videoId": "0OEmLKIjAtk"
      },
      {
        "name": "渣打銀行",
        "bgImage": "/vfx/F/F-08.webp",
        "url": "https://www.youtube.com/watch?v=OBTrK1ukstc",
        "videoId": "OBTrK1ukstc"
      },
      {
        "name": "磊山保經",
        "bgImage": "/vfx/F/F-09.webp",
        "url": "https://www.youtube.com/watch?v=Rwrn87N2PUc",
        "videoId": "Rwrn87N2PUc"
      },
      {
        "name": "國泰世華 財富管理",
        "bgImage": "/vfx/F/F-09_cathay.webp"
      },
      {
        "name": "臺灣證券交易所",
        "bgImage": "/vfx/F/F-10_twse.webp"
      }
    ]
  }
];
