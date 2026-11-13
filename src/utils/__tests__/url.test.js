import { describe, it, expect, vi, afterEach } from 'vitest';
import { openSafeExternalUrl } from '../url';

describe('openSafeExternalUrl 工具函式測試', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('應攔截非 HTTPS 或惡意協定（如 javascript:、http:）', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(openSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(openSafeExternalUrl('http://example.com')).toBe(false);
    expect(openSafeExternalUrl('')).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('合法 HTTPS 網址應帶入 noopener,noreferrer 並清空 opener', () => {
    const fakeWin = { opener: window };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(fakeWin);

    expect(openSafeExternalUrl('https://www.facebook.com/watch/?v=123')).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(
      'https://www.facebook.com/watch/?v=123',
      '_blank',
      'noopener,noreferrer'
    );
    expect(fakeWin.opener).toBeNull();
  });
});
