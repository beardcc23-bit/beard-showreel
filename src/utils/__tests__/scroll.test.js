import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  LENIS_EASE_OUT_EXPO,
  SCROLL_TRIGGER_KEYS,
  isEditableElement,
  smoothScrollTo,
  instantScrollTo,
} from '../scroll';

describe('scroll 全站捲動工具函式測試', () => {
  const originalLenis = window.lenis;
  const originalScrollTo = window.scrollTo;

  afterEach(() => {
    window.lenis = originalLenis;
    window.scrollTo = originalScrollTo;
  });

  it('LENIS_EASE_OUT_EXPO 與 isEditableElement 應回傳正確邊界判斷', () => {
    expect(LENIS_EASE_OUT_EXPO(0)).toBeCloseTo(0.001, 3);
    expect(LENIS_EASE_OUT_EXPO(1)).toBe(1);
    expect(SCROLL_TRIGGER_KEYS.has('PageDown')).toBe(true);

    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const div = document.createElement('div');
    expect(isEditableElement(input)).toBe(true);
    expect(isEditableElement(textarea)).toBe(true);
    expect(isEditableElement(div)).toBe(false);
    expect(isEditableElement(null)).toBe(false);
  });

  it('smoothScrollTo 與 instantScrollTo 應優先驅動 window.lenis，無 Lenis 時降級至原生 window.scrollTo', () => {
    const lenisScrollTo = vi.fn();
    window.lenis = { start: vi.fn(), scrollTo: lenisScrollTo };

    smoothScrollTo(1200, { offset: -76 });
    expect(window.lenis.start).toHaveBeenCalledTimes(1);
    expect(lenisScrollTo).toHaveBeenCalledWith(1200, expect.objectContaining({ offset: -76 }));

    instantScrollTo(800, { offset: -88 });
    expect(lenisScrollTo).toHaveBeenLastCalledWith(800, { immediate: true, offset: -88 });

    // 無 Lenis 降級情境
    window.lenis = null;
    const nativeSpy = vi.fn();
    window.scrollTo = nativeSpy;

    smoothScrollTo(500, { offset: -50 });
    expect(nativeSpy).toHaveBeenCalledWith({ top: 450, behavior: 'smooth' });

    instantScrollTo(300, { offset: -20 });
    expect(nativeSpy).toHaveBeenLastCalledWith({ top: 280, behavior: 'auto' });
  });
});
