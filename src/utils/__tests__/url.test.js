import { describe, it, expect } from 'vitest';
import { getSafeExternalUrl, isSafeLocalImageUrl } from '../url';

describe('url 安全工具函式測試', () => {
  it('getSafeExternalUrl 應僅放行白名單 HTTPS 網址，並攔截非 HTTPS、惡意協定與偽造網域', () => {
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeExternalUrl('http://www.youtube.com/watch?v=123')).toBeNull();
    expect(getSafeExternalUrl('https://evil.example.com/phish')).toBeNull();
    expect(getSafeExternalUrl('https://www.youtube.com.evil.com/x')).toBeNull();
    expect(getSafeExternalUrl('')).toBeNull();
    expect(getSafeExternalUrl('https://www.facebook.com/reel/1338163857656555')).toBe(
      'https://www.facebook.com/reel/1338163857656555'
    );
  });

  it('isSafeLocalImageUrl 應僅放行合法同源圖片並阻擋路徑遍歷與外部網址', () => {
    expect(isSafeLocalImageUrl('/f1.webp')).toBe(true);
    expect(isSafeLocalImageUrl('/beard-showreel/f1.webp')).toBe(true);
    expect(isSafeLocalImageUrl('//evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/\\evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/../secret.webp')).toBe(false);
    expect(isSafeLocalImageUrl('https://evil.com/a.webp')).toBe(false);
    expect(isSafeLocalImageUrl('/index.html')).toBe(false);
  });
});
