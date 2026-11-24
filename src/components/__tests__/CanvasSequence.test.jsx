import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CanvasSequence from '../CanvasSequence';
import {
  HERO_SCRUB_END_PROGRESS,
  HERO_IDLE_AUTO_SCROLL_MS,
  HERO_AUTO_SCROLL_DURATION_MS,
} from '../../constants/heroScroll';

describe('CanvasSequence（Hero 滾動驅動逐幀時間軸播放器）', () => {
  const OriginalImage = global.Image;
  const originalInnerHeight = window.innerHeight;
  const originalInnerWidth = window.innerWidth;
  let requestedSrcs = [];

  beforeEach(() => {
    vi.useFakeTimers();
    requestedSrcs = [];

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });

    class MockImage {
      constructor() {
        this.naturalWidth = 1920;
        this.naturalHeight = 1080;
      }
      set src(val) {
        this._src = val;
        requestedSrcs.push(val);
        // 透過微任務觸發 onload 模擬真實非同步載入
        Promise.resolve().then(() => {
          if (typeof this.onload === 'function') this.onload();
        });
      }
      get src() {
        return this._src;
      }
    }
    global.Image = MockImage;
    window.Image = MockImage;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    global.Image = OriginalImage;
    window.Image = OriginalImage;
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  });

  const makeContainerRef = (topValue = 0, height = 2520) => {
    let currentTop = topValue;
    const el = {
      getBoundingClientRect: () => ({
        top: currentTop,
        height,
        bottom: currentTop + height,
        left: 0,
        right: 1440,
        width: 1440,
      }),
    };
    return {
      ref: { current: el },
      setTop: (nextTop) => {
        currentTop = nextTop;
      },
    };
  };

  it('應渲染純 Canvas 銀幕（無自動播放 <video>、無影格數字）、右側垂直滑桿與向下滑動提示', async () => {
    const { ref } = makeContainerRef(0);
    const onLoaded = vi.fn();
    const { container } = render(
      <CanvasSequence containerRef={ref} isModalOpen={false} onLoaded={onLoaded} />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.dataset.frame).toBe('1');
    expect(container.querySelector('video')).toBeNull();
    expect(screen.getByTestId('hero-vertical-progress')).toBeInTheDocument();
    expect(screen.getByTestId('hero-progress-fill').style.transform).toBe('scaleY(0.0000)');
    expect(screen.queryByTestId('hero-frame-counter')).toBeNull();
    expect(screen.getByTestId('hero-scroll-hint')).toHaveTextContent('向下滑動推進');

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onLoaded).toHaveBeenCalledTimes(1);
  });

  it('桌機與手機應自動抽幀減重（桌機 73 格、手機 49 格）且不一次載入全部 145 格', async () => {
    const { ref } = makeContainerRef(0);
    render(<CanvasSequence containerRef={ref} isModalOpen={false} />);

    await act(async () => {
      for (let i = 0; i < 30; i += 1) {
        await Promise.resolve();
      }
    });
    expect(requestedSrcs.length).toBe(73);
    expect(requestedSrcs[0]).toContain('png-0_00000000.webp');
    expect(requestedSrcs[1]).toContain('png-0_00000144.webp');

    // 切換手機寬度驗證抽樣為 49 格且使用 png-0-mobile
    requestedSrcs = [];
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
    await act(async () => {
      for (let i = 0; i < 20; i += 1) {
        await Promise.resolve();
      }
    });
    expect(requestedSrcs.length).toBe(49);
    expect(requestedSrcs[0]).toContain('png-0-mobile/png-0_00000000.webp');
  });

  it('往下滑應前進影格且中段維持提示，快到底才淡出並於尾段 85%→100% 觸發微縮轉場，往上滑應倒轉', async () => {
    const { ref, setTop } = makeContainerRef(0, 2520); // scrollable = 2520 - 900 = 1620
    const { container } = render(
      <CanvasSequence containerRef={ref} isModalOpen={false} />
    );

    const canvas = container.querySelector('canvas');
    const hint = screen.getByTestId('hero-scroll-hint');
    const fill = screen.getByTestId('hero-progress-fill');
    const thumb = screen.getByTestId('hero-progress-thumb');
    const stage = container.firstElementChild;

    // 往下滑至 50% 行程（-810px）：影格前進、右側垂直軌道向下延伸且提示文字維持顯示
    setTop(-810);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1200);
    });
    expect(Number(canvas.dataset.frame)).toBeGreaterThan(60);
    expect(fill.style.transform).toContain('scaleY(');
    expect(thumb.style.transform).toContain('translate3d(0,');
    expect(Number(hint.style.opacity)).toBe(1);

    // 滑至 100% 行程（-1620px）：應定版在第 145 格、垂直進度滿格、提示文字淡出且銀幕微縮淡出
    setTop(-1620);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    expect(canvas.dataset.frame).toBe('145');
    expect(fill.style.transform).toBe('scaleY(1.0000)');
    expect(thumb.style.transform).toBe('translate3d(0, 100.000%, 0)');
    expect(Number(hint.style.opacity)).toBe(0);
    expect(stage.style.transform).toContain('scale(');
    expect(Number(stage.style.opacity)).toBeLessThan(0.5);

    // 往回滑至頂部（0px）：應倒轉回第 1 格並恢復完整顯示
    setTop(0);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    expect(canvas.dataset.frame).toBe('1');
    expect(Number(stage.style.opacity)).toBe(1);
    expect(Number(hint.style.opacity)).toBe(1);
  });

  it('銀幕應保持純粹無懸停按鈕連結遮擋，且 Canvas 應保護資產不被 dump', async () => {
    const { ref } = makeContainerRef(0);
    const { container } = render(
      <CanvasSequence containerRef={ref} isModalOpen={false} />
    );

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.queryByTestId('hero-hotspot')).toBeNull();
    expect(screen.queryByText(/watch full showreel/i)).toBeNull();

    const canvas = container.querySelector('canvas');
    expect(canvas.toDataURL()).toContain('data:image/gif');
    expect(canvas.toBlob()).toBeNull();
  });

  it('首次進站載完首幀後閒置 3.5 秒應自動溫柔推進至個人介紹，且任一互動應立即取消不搶捲軸', async () => {
    const introEl = document.createElement('section');
    introEl.id = 'introduction';
    introEl.getBoundingClientRect = () => ({
      top: 2520,
      height: 1200,
      bottom: 3720,
      left: 0,
      right: 1440,
      width: 1440,
    });
    document.body.appendChild(introEl);

    const originalScrollY = window.scrollY;
    const originalLenis = window.lenis;
    const mockScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    window.lenis = { start: vi.fn(), scrollTo: mockScrollTo };

    try {
      // 情境 1：完全無操作，載入完成滿 3.5 秒應觸發自動平滑捲動至 #introduction（含導覽列緩衝 -76px）
      const { ref } = makeContainerRef(0);
      const { unmount } = render(<CanvasSequence containerRef={ref} isModalOpen={false} />);

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      act(() => {
        vi.advanceTimersByTime(HERO_IDLE_AUTO_SCROLL_MS - 100);
      });
      expect(mockScrollTo).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(mockScrollTo).toHaveBeenCalledTimes(1);
      expect(mockScrollTo.mock.calls[0][0]).toBe(2520 - 76);
      expect(mockScrollTo.mock.calls[0][1].duration).toBe(HERO_AUTO_SCROLL_DURATION_MS / 1000);
      unmount();

      // 情境 2：3.5 秒內使用者已觸發滾輪互動，倒數應立即取消、絕不搶捲軸
      mockScrollTo.mockClear();
      render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
        window.dispatchEvent(new Event('wheel'));
        vi.advanceTimersByTime(HERO_IDLE_AUTO_SCROLL_MS + 1000);
      });
      expect(mockScrollTo).not.toHaveBeenCalled();

      // 情境 3：行動漢堡選單開啟（body.modal-open）期間不應偷捲
      mockScrollTo.mockClear();
      document.body.classList.add('modal-open');
      render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        vi.advanceTimersByTime(HERO_IDLE_AUTO_SCROLL_MS + 1000);
      });
      expect(mockScrollTo).not.toHaveBeenCalled();
    } finally {
      document.body.classList.remove('modal-open');
      introEl.remove();
      Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
      window.lenis = originalLenis;
    }
  });

  it('點擊或拖曳右側 3D 玻璃滑桿應直接精準捲動至對應影格位置（Direct Scrubbing）', () => {
    const { ref } = makeContainerRef(0, 2520); // scrollable = 1620
    const originalScrollY = window.scrollY;
    const originalLenis = window.lenis;
    const mockScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    window.lenis = { start: vi.fn(), scrollTo: mockScrollTo };

    try {
      render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
      const slider = screen.getByTestId('hero-vertical-progress');
      const glassRail = slider.querySelector('.hero-glass-rail');
      glassRail.getBoundingClientRect = () => ({
        top: 100,
        bottom: 600,
        height: 500,
        left: 1000,
        right: 1010,
        width: 10,
      });

      // 點擊滑桿正中央（clientY = 350 => 50%），應 0ms 即時同步進度條與捲動座標
      fireEvent.pointerDown(slider, { clientY: 350, pointerId: 1 });
      const expectedMidY = Math.round(1620 * (0.5 * HERO_SCRUB_END_PROGRESS));
      expect(mockScrollTo).toHaveBeenCalledWith(expectedMidY, { immediate: true });
      expect(screen.getByTestId('hero-progress-fill').style.transform).toBe('scaleY(0.5000)');

      // 按住拖曳至滑桿最底端（clientY = 600 => 100%）
      fireEvent.pointerMove(slider, { clientY: 600, pointerId: 1 });
      const expectedEndY = Math.round(1620 * HERO_SCRUB_END_PROGRESS);
      expect(mockScrollTo).toHaveBeenLastCalledWith(expectedEndY, { immediate: true });
      expect(screen.getByTestId('hero-progress-fill').style.transform).toBe('scaleY(1.0000)');

      // 放開後再移動滑鼠不應再觸發刷幀
      mockScrollTo.mockClear();
      fireEvent.pointerUp(slider, { pointerId: 1 });
      fireEvent.pointerMove(slider, { clientY: 200, pointerId: 1 });
      expect(mockScrollTo).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
      window.lenis = originalLenis;
    }
  });

  it('自動推進途中點擊右側 3D 滑桿應先於 capture 階段煞停自動捲動，不被冒泡覆蓋回原點', async () => {
    const introEl = document.createElement('section');
    introEl.id = 'introduction';
    introEl.getBoundingClientRect = () => ({
      top: 2520,
      height: 1200,
      bottom: 3720,
      left: 0,
      right: 1440,
      width: 1440,
    });
    document.body.appendChild(introEl);

    const { ref, setTop } = makeContainerRef(0, 2520);
    const originalScrollY = window.scrollY;
    const originalLenis = window.lenis;
    const mockScrollTo = vi.fn();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    window.lenis = { start: vi.fn(), scrollTo: mockScrollTo };

    try {
      render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      // 觸發 3.5 秒自動推進進入進行中狀態
      act(() => {
        vi.advanceTimersByTime(HERO_IDLE_AUTO_SCROLL_MS + 50);
      });
      expect(mockScrollTo).toHaveBeenCalledTimes(1);

      // 模擬自動推進已捲至 200px 後（Hero rect.top = -200），使用者點擊滑桿中段（50%）
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 200 });
      setTop(-200);
      const slider = screen.getByTestId('hero-vertical-progress');
      const glassRail = slider.querySelector('.hero-glass-rail');
      glassRail.getBoundingClientRect = () => ({
        top: 100,
        bottom: 600,
        height: 500,
        left: 1000,
        right: 1005,
        width: 5,
      });

      fireEvent.pointerDown(slider, { clientY: 350, pointerId: 1 });
      const expectedMidY = Math.round(1620 * (0.5 * HERO_SCRUB_END_PROGRESS));
      // 最後一次 scrollTo 必須是滑桿的新目標座標（而非被冒泡拉回 200）
      expect(mockScrollTo).toHaveBeenLastCalledWith(expectedMidY, { immediate: true });
    } finally {
      introEl.remove();
      Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
      window.lenis = originalLenis;
    }
  });
});
