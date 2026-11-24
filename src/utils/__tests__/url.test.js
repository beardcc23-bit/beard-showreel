import { describe, it, expect, vi, afterEach } from 'vitest';
import { getSafeExternalUrl, openSafeExternalUrl, isSafeLocalImageUrl } from '../url';

describe('url 安全工具函式測試', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getSafeExternalUrl 與 openSafeExternalUrl 應攔截非 HTTPS、惡意協定與非白名單網域', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeExternalUrl('https://evil.example.com/phish')).toBeNull();
    expect(getSafeExternalUrl('https://www.facebook.com/reel/1338163857656555')).toBe(
      'https://www.facebook.com/reel/1338163857656555'
    );
    expect(openSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(openSafeExternalUrl('http://www.youtube.com/watch?v=123')).toBe(false);
    expect(openSafeExternalUrl('https://evil.example.com/phish')).toBe(false);
    expect(openSafeExternalUrl('https://www.youtube.com.evil.com/x')).toBe(false);
    expect(openSafeExternalUrl('')).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('openSafeExternalUrl 帶入 noopener 回傳 null 時不應覆蓋當前原分頁（window.location.assign）', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const assignSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    });

    try {
      expect(openSafeExternalUrl('https://www.facebook.com/watch/?v=123')).toBe(true);
      expect(openSpy).toHaveBeenCalledWith(
        'https://www.facebook.com/watch/?v=123',
        '_blank',
        'noopener,noreferrer'
      );
      expect(assignSpy).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    }
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
