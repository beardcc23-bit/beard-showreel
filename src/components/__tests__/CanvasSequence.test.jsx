import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CanvasSequence from '../CanvasSequence';

describe('CanvasSequence（Hero 循環播放器）', () => {
  let playSpy;
  let pauseSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom 未實作媒體播放：以 spy 模擬，並讓 paused 反映 play()/pause() 狀態
    playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(function () {
      this.__playing = true;
      return Promise.resolve();
    });
    pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(function () {
      this.__playing = false;
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'paused', {
      configurable: true,
      get() {
        return !this.__playing;
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const unlock = () => {
    // jsdom 不會真的載入 poster，靠 3 秒保底計時器解鎖
    act(() => {
      vi.advanceTimersByTime(3000);
    });
  };

  it('應渲染 <video> 並提供 AV1 webm 優先、H.264 mp4 備援來源，且靜音屬性寫入 DOM', () => {
    const { container } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('loop');

    const sources = video.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0].getAttribute('src')).toMatch(/hero(-mobile)?\.webm$/);
    expect(sources[0].getAttribute('type')).toContain('av01');
    expect(sources[1].getAttribute('src')).toMatch(/hero(-mobile)?\.mp4$/);
    // 正常情況不啟用序列備援
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('掛載即開始播放，不必等 poster；poster 解鎖後呼叫 onLoaded', () => {
    const onLoaded = vi.fn();
    render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} onLoaded={onLoaded} />);
    expect(playSpy).toHaveBeenCalled();
    expect(screen.getByText('INITIALIZING VISUAL MATRIX')).toBeInTheDocument();

    unlock();
    expect(onLoaded).toHaveBeenCalledTimes(1);
  });

  it('Modal 開啟時應暫停影片', () => {
    const { rerender } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    unlock();
    pauseSpy.mockClear();

    rerender(<CanvasSequence onPlayVideo={() => {}} isModalOpen={true} />);
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('游標進入中央感應區停格、移開續播，點擊開啟 YouTube Reel', () => {
    const onPlayVideo = vi.fn();
    render(<CanvasSequence onPlayVideo={onPlayVideo} isModalOpen={false} />);
    unlock();
    const hotspot = screen.getByTestId('hero-hotspot');

    pauseSpy.mockClear();
    fireEvent.mouseEnter(hotspot);
    expect(pauseSpy).toHaveBeenCalled();

    playSpy.mockClear();
    fireEvent.mouseLeave(hotspot);
    expect(playSpy).toHaveBeenCalled();

    fireEvent.click(hotspot);
    expect(onPlayVideo).toHaveBeenCalledWith('s6s2p87fPdA');
  });

  it('自動播放被拒絕 (NotAllowedError) 時應退回序列 Canvas 模式', async () => {
    playSpy.mockImplementation(() =>
      Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }))
    );
    const { container } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(container.querySelector('video')).toHaveClass('hidden');
  });

  it('play() 未 reject 但始終未播放（靜默阻擋）時，看門狗應退回序列模式', () => {
    playSpy.mockImplementation(() => Promise.resolve()); // 不改變 paused 狀態
    const { container } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    expect(container.querySelector('canvas')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });
});
