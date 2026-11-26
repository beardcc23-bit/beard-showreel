import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useLenisScroll } from '../useLenisScroll';

function LenisHost() {
  useLenisScroll();
  return <div data-testid="lenis-host" />;
}

describe('useLenisScroll 平滑滾動與休眠控制測試', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    window.lenis = null;
  });

  it('桌機環境應掛載全域 window.lenis 並於元件卸載時徹底銷毀釋放', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(pointer: fine)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { unmount } = render(<LenisHost />);
    expect(window.lenis).toBeTruthy();
    expect(typeof window.lenis.scrollTo).toBe('function');

    unmount();
    expect(window.lenis).toBeNull();
  });

  it('prefers-reduced-motion 開啟時應直接跳過 Lenis 初始化以尊重無障礙偏好', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)' || query === '(pointer: fine)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const { unmount } = render(<LenisHost />);
    expect(window.lenis).toBeFalsy();
    unmount();
  });
});
