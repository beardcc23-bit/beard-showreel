import React, { useRef } from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOffscreenPause } from '../useOffscreenPause';

describe('useOffscreenPause 離屏動畫休眠 Hook 測試', () => {
  let originalIO;
  let instances;

  beforeEach(() => {
    originalIO = window.IntersectionObserver;
    instances = [];

    class TrackingIntersectionObserver {
      constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = new Set();
        this.disconnect = vi.fn(() => {
          this.observed.clear();
        });
        instances.push(this);
      }
      observe(el) {
        this.observed.add(el);
      }
      unobserve(el) {
        this.observed.delete(el);
      }
    }

    window.IntersectionObserver = TrackingIntersectionObserver;
    global.IntersectionObserver = TrackingIntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    window.IntersectionObserver = originalIO;
    global.IntersectionObserver = originalIO;
  });

  it('多個區塊應共用單一 IntersectionObserver，並在進出視窗時零 Re-render 切換 section-offscreen', () => {
    let renderCount = 0;

    function TestSection({ id }) {
      if (id === 'sec-1') renderCount += 1;
      const ref = useRef(null);
      useOffscreenPause(ref);
      return <section ref={ref} data-testid={id} />;
    }

    const { getByTestId, unmount } = render(
      <>
        <TestSection id="sec-1" />
        <TestSection id="sec-2" />
      </>
    );

    expect(instances).toHaveLength(1);
    expect(renderCount).toBe(1);

    const sec1 = getByTestId('sec-1');
    const sec2 = getByTestId('sec-2');
    const observer = instances[0];

    // 模擬 sec-1 離開視窗、sec-2 留在視窗內
    observer.callback([
      { target: sec1, isIntersecting: false },
      { target: sec2, isIntersecting: true },
    ]);

    expect(sec1.classList.contains('section-offscreen')).toBe(true);
    expect(sec2.classList.contains('section-offscreen')).toBe(false);
    // 關鍵驗證：滾動跨越邊界完全不觸發 React 組件重繪
    expect(renderCount).toBe(1);

    // 模擬 sec-1 重新進入視窗
    observer.callback([{ target: sec1, isIntersecting: true }]);
    expect(sec1.classList.contains('section-offscreen')).toBe(false);
    expect(renderCount).toBe(1);

    // 卸載全數組件後應自動 disconnect 共享實例
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
