import { describe, it, expect } from 'vitest';
import { getSafeExternalUrl, getSafeFacebookVideoUrl, isSafeLocalImageUrl } from '../url';

describe('url 安全工具函式測試', () => {
  it('getSafeExternalUrl 應僅放行白名單 HTTPS 網址，並攔截非 HTTPS、帳密偽裝、惡意協定與偽造網域', () => {
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeExternalUrl('http://www.youtube.com/watch?v=123')).toBeNull();
    expect(getSafeExternalUrl('https://evil.example.com/phish')).toBeNull();
    expect(getSafeExternalUrl('https://www.youtube.com.evil.com/x')).toBeNull();
    expect(getSafeExternalUrl('https://user:pass@www.facebook.com/reel/1')).toBeNull();
    expect(getSafeExternalUrl('')).toBeNull();
    expect(getSafeExternalUrl('https://www.facebook.com/reel/1338163857656555')).toBe(
      'https://www.facebook.com/reel/1338163857656555'
    );
  });

  it('getSafeFacebookVideoUrl 應以標準 URL 解析器嚴格驗證 Facebook HTTPS 影片來源', () => {
    expect(getSafeFacebookVideoUrl('https://www.facebook.com/watch/?v=822528356385191')).toBe(
      'https://www.facebook.com/watch/?v=822528356385191'
    );
    expect(getSafeFacebookVideoUrl('https://fb.watch/abc123/')).toBe('https://fb.watch/abc123/');
    expect(getSafeFacebookVideoUrl('https://attacker@www.facebook.com/watch/?v=1')).toBe('');
    expect(getSafeFacebookVideoUrl('https://www.youtube.com/watch?v=1')).toBe('');
    expect(getSafeFacebookVideoUrl('http://www.facebook.com/watch/?v=1')).toBe('');
  });

  it('isSafeLocalImageUrl 應放行合法同源圖片（含 ?v= 快取版本號）並阻擋路徑遍歷、超長字串與外部網址', () => {
    expect(isSafeLocalImageUrl('/f1.webp')).toBe(true);
    expect(isSafeLocalImageUrl('/f1.webp?v=2')).toBe(true);
    expect(isSafeLocalImageUrl('/beard-showreel/f1.webp?v=4')).toBe(true);
    expect(isSafeLocalImageUrl('//evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/\\evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/../secret.webp')).toBe(false);
    expect(isSafeLocalImageUrl('https://evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/index.html')).toBe(false);
    expect(isSafeLocalImageUrl(`/${'a'.repeat(300)}.webp`)).toBe(false);
  });
});
