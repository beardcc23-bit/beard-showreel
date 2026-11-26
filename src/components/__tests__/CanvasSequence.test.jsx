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
    const heroScreen = screen.getByTestId('hero-screen');
    expect(heroScreen).toHaveClass('h-[calc(100dvh-4.75rem)]');
    expect(heroScreen).toHaveClass('md:aspect-video');
    expect(container.querySelector('video')).toBeNull();
    const slider = screen.getByTestId('hero-vertical-progress');
    expect(slider).toBeInTheDocument();
    // 手機版隱藏右側直條滑桿，僅桌機（md:flex）顯示
    expect(slider).toHaveClass('hidden');
    expect(slider).toHaveClass('md:flex');
    expect(screen.getByTestId('hero-progress-fill').style.transform).toBe('scaleY(0.0000)');
    expect(screen.queryByTestId('hero-frame-counter')).toBeNull();
    expect(screen.getByTestId('hero-scroll-hint')).toHaveTextContent('向下滑動推進');

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onLoaded).toHaveBeenCalledTimes(1);
  });

  it('桌機應載入完整 117 格原生幀確保滾動零跳格，手機應自動抽幀減重為 59 格', async () => {
    const { ref } = makeContainerRef(0);
    render(<CanvasSequence containerRef={ref} isModalOpen={false} />);

    await act(async () => {
      for (let i = 0; i < 40; i += 1) {
        await Promise.resolve();
      }
    });
    expect(requestedSrcs.length).toBe(117);
    expect(requestedSrcs[0]).toContain('png-0_00000000.webp');
    expect(requestedSrcs[1]).toContain('png-0_00000116.webp');

    // 切換手機寬度驗證抽樣為 59 格且使用 png-0-mobile
    requestedSrcs = [];
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    render(<CanvasSequence containerRef={ref} isModalOpen={false} />);
    await act(async () => {
      for (let i = 0; i < 30; i += 1) {
        await Promise.resolve();
      }
    });
    expect(requestedSrcs.length).toBe(59);
    expect(requestedSrcs[0]).toContain('png-0-mobile/png-0_00000000.webp');
  });

  it('往下滑應以單一等速線性推進影格，於變透明與離場上滑區（86%→126%）緊貼滑動速度走完第 117 格，往上滑應倒轉', async () => {
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
    expect(Number(canvas.dataset.frame)).toBeGreaterThan(40);
    expect(fill.style.transform).toContain('scaleY(');
    expect(thumb.style.transform).toContain('translate3d(0,');
    expect(Number(hint.style.opacity)).toBe(1);

    // 滑至 86% 主觀賞區終點（-1393.2px）：滑桿走滿 100%、停在清晰不透明定版格（第 80 格）
    setTop(-1393.2);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    const mainHoldFrame = Number(canvas.dataset.frame);
    expect(mainHoldFrame).toBe(80);
    expect(fill.style.transform).toBe('scaleY(1.0000)');
    expect(thumb.style.transform).toBe('translate3d(0, 100.000%, 0)');
    expect(Number(stage.style.opacity)).toBe(1);

    // 滑至 100% Sticky 終點（-1620px）：銀幕進入微縮半透明，且影格以相同斜率等速推進
    setTop(-1620);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    const stickyEndFrame = Number(canvas.dataset.frame);
    expect(stickyEndFrame).toBeGreaterThan(mainHoldFrame);
    expect(stickyEndFrame).toBeLessThan(117);
    expect(Number(hint.style.opacity)).toBe(0);
    expect(stage.style.transform).toContain('scale(');
    expect(Number(stage.style.opacity)).toBeLessThan(0.5);

    // 繼續往下滑至離場上滑終點（126% 行程 = -2041.2px）：變透明上滑途中等速推進完第 117 格
    setTop(-2041.2);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    expect(canvas.dataset.frame).toBe('117');

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

  it('手機版往上滑推進至尾段與離場區（87%→126%）應維持滿寬 1:1 原尺寸不縮小', async () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const { ref, setTop } = makeContainerRef(0, 2520); // scrollable = 1620
    const { container } = render(
      <CanvasSequence containerRef={ref} isModalOpen={false} />
    );

    const canvas = container.querySelector('canvas');
    const stage = container.firstElementChild;

    // 滑至 100% Sticky 終點（-1620px）：手機版 transform 應維持空字串（不套用 scale 縮小）
    setTop(-1620);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    expect(stage.style.transform).toBe('');
    expect(stage.style.transform).not.toContain('scale(');
    expect(Number(stage.style.opacity)).toBeLessThan(0.5);

    // 繼續滑至 126% 離場終點（-2041.2px）：走完第 117 格且全程不縮小
    setTop(-2041.2);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(1500);
    });
    expect(canvas.dataset.frame).toBe('117');
    expect(stage.style.transform).toBe('');
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
      const { unmount: unmountModalCase } = render(
        <CanvasSequence containerRef={ref} isModalOpen={false} />
      );
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      act(() => {
        vi.advanceTimersByTime(HERO_IDLE_AUTO_SCROLL_MS + 1000);
      });
      expect(mockScrollTo).not.toHaveBeenCalled();
      unmountModalCase();
      document.body.classList.remove('modal-open');

      // 情境 4：手機版（innerWidth < 768）不應觸發 3.5 秒自動往下捲動
      mockScrollTo.mockClear();
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
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

  it('點擊或拖曳右側 3D 玻璃滑桿應直接精準捲動至對應影格位置（Direct Scrubbing）', async () => {
    const { ref } = makeContainerRef(0, 2520); // scrollable = 1620
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
      mockScrollTo.mockClear();
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

  it('使用者開啟 prefers-reduced-motion 時應直接載入第 80 格清晰定版幀（00000079），而非模糊首幀', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    try {
      const { ref } = makeContainerRef(0);
      const { container } = render(<CanvasSequence containerRef={ref} isModalOpen={false} />);

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(requestedSrcs).toHaveLength(1);
      expect(requestedSrcs[0]).toContain('png-0_00000079.webp');
      const canvas = container.querySelector('canvas');
      expect(canvas.dataset.frame).toBe('80');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
