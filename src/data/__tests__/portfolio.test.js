import { describe, it, expect } from 'vitest';
import { extractYoutubeId, normalizeItem, categories } from '../portfolio';

describe('portfolio.js 最佳化邏輯測試', () => {
  describe('extractYoutubeId', () => {
    it('能正確解析標準 watch 格式網址', () => {
      expect(extractYoutubeId('https://www.youtube.com/watch?v=wZhogI5TPB8')).toBe('wZhogI5TPB8');
      expect(extractYoutubeId('https://youtube.com/watch?v=yjl03-QCzbM&feature=share')).toBe('yjl03-QCzbM');
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

  describe('生活百貨分類排序驗證', () => {
    it('生活百貨類別中，新光三越首部作品排在犀牛盾之後', () => {
      const lifestyle = categories.find(c => c.id === 'lifestyle');
      expect(lifestyle).toBeDefined();

      const rhinoIndex = lifestyle.items.findIndex(i => i.name === '犀牛盾');
      const skmItems = lifestyle.items
        .map((item, idx) => ({ ...item, originalIndex: idx }))
        .filter(item => item.name === '新光三越');

      expect(rhinoIndex).toBeGreaterThan(-1);
      expect(skmItems.length).toBeGreaterThan(0);

      // 第一個新光三越必須緊接在犀牛盾之後
      const firstSkm = skmItems[0];
      expect(firstSkm.originalIndex).toBe(rhinoIndex + 1);
      expect(firstSkm.videoId).toBe('wZhogI5TPB8');
      expect(firstSkm.bgImage).toBe('/vfx/D/D-13.webp');
    });
  });
});
