import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { extractYoutubeId, normalizeItem, categories } from '../portfolio';
import { getSafeExternalUrl } from '../../utils/url';

describe('portfolio.js 最佳化邏輯測試', () => {
  describe('extractYoutubeId', () => {
    it('能正確解析標準 watch 格式網址（含查詢參數前置與 youtube-nocookie）', () => {
      expect(extractYoutubeId('https://www.youtube.com/watch?v=wZhogI5TPB8')).toBe('wZhogI5TPB8');
      expect(extractYoutubeId('https://youtube.com/watch?v=yjl03-QCzbM&feature=share')).toBe('yjl03-QCzbM');
      expect(extractYoutubeId('https://www.youtube.com/watch?feature=share&v=AuuxyMIutf8')).toBe('AuuxyMIutf8');
      expect(extractYoutubeId('https://www.youtube-nocookie.com/embed/s6s2p87fPdA')).toBe('s6s2p87fPdA');
    });

    it('能正確解析 shorts 格式網址', () => {
      expect(extractYoutubeId('https://www.youtube.com/shorts/n3c3DDBMUnA')).toBe('n3c3DDBMUnA');
    });

    it('能正確解析 youtu.be 短網址', () => {
      expect(extractYoutubeId('https://youtu.be/wZhogI5TPB8')).toBe('wZhogI5TPB8');
    });

    it('能正確解析 embed 網址', () => {
      expect(extractYoutubeId('https://www.youtube.com/embed/wZhogI5TPB8')).toBe('wZhogI5TPB8');
    });

    it('傳入無效或空網址回傳 null', () => {
      expect(extractYoutubeId('')).toBeNull();
      expect(extractYoutubeId(null)).toBeNull();
      expect(extractYoutubeId('https://example.com')).toBeNull();
    });
  });

  describe('normalizeItem', () => {
    it('當只有 url 時能自動推導 videoId 與 hasVideo', () => {
      const raw = {
        name: '測試影片',
        url: 'https://www.youtube.com/watch?v=wZhogI5TPB8',
        bgImage: '/vfx/D/D-13.webp'
      };
      const result = normalizeItem(raw);
      expect(result.videoId).toBe('wZhogI5TPB8');
      expect(result.hasVideo).toBe(true);
      expect(result.bgImage).toContain('/vfx/D/D-13.webp');
    });

    it('保留既有自訂 videoId (如 Facebook 等特別格式)', () => {
      const raw = {
        name: 'FB 測試',
        url: 'https://www.facebook.com/reel/123456789',
        videoId: 'custom_fb_id',
        isFacebook: true
      };
      const result = normalizeItem(raw);
      expect(result.videoId).toBe('custom_fb_id');
      expect(result.hasVideo).toBe(true);
    });

    it('無影片或背景圖項目正確處理', () => {
      const raw = { name: '無影片項目' };
      const result = normalizeItem(raw);
      expect(result.hasVideo).toBe(false);
      expect(result.bgImage).toBeNull();
      expect(result.videoId).toBeNull();
    });
  });

  describe('六大分類優先排序與完整性驗證', () => {
    it('各分類前排優先作品排序正確，且同品牌其餘支數置於後段', () => {
      const getNames = (id, count) =>
        categories.find((c) => c.id === id).items.slice(0, count).map((i) => i.name);

      expect(getNames('food', 7)).toEqual([
        'UCC',
        'Extra',
        '德克士炸雞',
        '桂格 企業形象影片',
        '柏克金啤酒',
        '黑松茶花',
        '維他露P+',
      ]);
      expect(getNames('tech', 5)).toEqual([
        'Samsung Galaxy Tab S11 Ultra',
        'Tokuyo 按摩椅',
        'Panasonic Viera 電視',
        'Samsung Galaxy S22',
        'Samsung Z Fold2 / Z Flip2',
      ]);
      expect(getNames('vehicle', 5)).toEqual([
        'Foxtron Caviar',
        'Mazda',
        'Gogoro Pulse',
        'Gogoro EZZY',
        '長榮航空',
      ]);
      expect(getNames('lifestyle', 5)).toEqual([
        '新光三越',
        'LaLaport 南港',
        '錦鋐氣密窗',
        'HOLA',
        '東和鋼鐵',
      ]);
      // 確認生活百貨首位新光三越、HOLA、東和鋼鐵皆為原排序首支版本
      const lifestyleItems = categories.find((c) => c.id === 'lifestyle').items;
      expect(lifestyleItems[0].bgImage).toBe('/vfx/D/D-13.webp');
      expect(lifestyleItems[3].bgImage).toBe('/vfx/D/D-03.webp');
      expect(lifestyleItems[4].bgImage).toBe('/vfx/D/D-09.webp');

      expect(getNames('beauty', 5)).toEqual([
        '活沛多',
        'Calm Night Day 淨日夜沐浴露',
        'TKLAB',
        'LUX 髮的補給',
        'EMSCULPT 肌動減脂',
      ]);
      expect(getNames('finance', 5)).toEqual([
        '磊山保經',
        '台灣Pay',
        '渣打銀行',
        '安聯人壽',
        '台灣Pay',
      ]);

      // 驗證全站 97 筆作品無遺漏、無重複 bgImage
      const allImages = categories.flatMap((c) => c.items.map((i) => i.bgImage));
      expect(allImages).toHaveLength(97);
      expect(new Set(allImages).size).toBe(97);
    });

    it('6 大分類皆各有且僅有唯一 1 筆 featured: true 主推作品，且全部 97 張劇照實體檔案皆存在於 public 目錄', () => {
      const publicDir = path.resolve(process.cwd(), 'public');

      for (const cat of categories) {
        const featuredItems = cat.items.filter((item) => item.featured === true);
        expect(featuredItems, `分類 ${cat.id} 必須恰有 1 筆 featured 主推作品`).toHaveLength(1);
      }

      const missingFiles = [];
      for (const cat of categories) {
        for (const item of cat.items) {
          const relPath = String(item.bgImage || '').replace(/^\//, '');
          const absPath = path.join(publicDir, relPath);
          if (!relPath || !fs.existsSync(absPath) || fs.statSync(absPath).size === 0) {
            missingFiles.push(`${cat.id}:${item.name} -> ${item.bgImage}`);
          }
        }
      }
      expect(missingFiles).toEqual([]);
    });

    it('全部具連結之作品其 YouTube url 與顯式 videoId 必須 100% 一致，且所有外部網址皆通過白名單校驗', () => {
      const idMismatches = [];
      const unsafeUrls = [];

      for (const cat of categories) {
        for (const item of cat.items) {
          if (item.url) {
            if (!getSafeExternalUrl(item.url)) {
              unsafeUrls.push(`${cat.id}:${item.name} -> ${item.url}`);
            }
            if (/youtu\.?be/i.test(item.url)) {
              const extracted = extractYoutubeId(item.url);
              if (!extracted || (item.videoId && extracted !== item.videoId)) {
                idMismatches.push(
                  `${cat.id}:${item.name} -> url(${extracted}) !== videoId(${item.videoId})`
                );
              }
            }
          }
        }
      }

      expect(idMismatches).toEqual([]);
      expect(unsafeUrls).toEqual([]);

      const chtItem = categories
        .find((c) => c.id === 'tech')
        .items.find((i) => i.name === '中華電信 企業形象影片');
      expect(chtItem?.url).toBe('https://www.instagram.com/reels/Cs-SBDQs9cN/');
      expect(normalizeItem(chtItem).hasVideo).toBe(true);
    });
  });
});
