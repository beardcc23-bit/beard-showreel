import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CanvasSequence from '../CanvasSequence';

describe('CanvasSequence（Hero 循環影片）', () => {
  let playSpy;
  let pauseSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom 未實作 HTMLMediaElement 播放 API，以 spy 取代
    playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue();
    pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
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

  it('應渲染 <video> 並提供 AV1 webm 優先、H.264 mp4 備援來源', () => {
    const { container } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('loop');

    const sources = video.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0].getAttribute('src')).toMatch(/hero(-mobile)?\.webm$/);
    expect(sources[0].getAttribute('type')).toContain('av01');
    expect(sources[1].getAttribute('src')).toMatch(/hero(-mobile)?\.mp4$/);
    // 不再使用 canvas 序列
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('poster 解鎖後應呼叫 onLoaded 並開始靜音播放', () => {
    const onLoaded = vi.fn();
    const { container } = render(
      <CanvasSequence onPlayVideo={() => {}} isModalOpen={false} onLoaded={onLoaded} />
    );
    expect(screen.getByText('INITIALIZING VISUAL MATRIX')).toBeInTheDocument();

    unlock();

    expect(onLoaded).toHaveBeenCalledTimes(1);
    expect(playSpy).toHaveBeenCalled();
    expect(container.querySelector('video').muted).toBe(true);
  });

  it('Modal 開啟時應暫停影片', () => {
    const { rerender } = render(<CanvasSequence onPlayVideo={() => {}} isModalOpen={false} />);
    unlock();
    pauseSpy.mockClear();

    rerender(<CanvasSequence onPlayVideo={() => {}} isModalOpen={true} />);
    expect(pauseSpy).toHaveBeenCalled();
  });

  it('hover 中央感應區應暫停，點擊應開啟完整 Reel', () => {
    const onPlayVideo = vi.fn();
    const { container } = render(<CanvasSequence onPlayVideo={onPlayVideo} isModalOpen={false} />);
    unlock();
    pauseSpy.mockClear();

    const hotspot = container.querySelector('.cursor-pointer');
    fireEvent.mouseEnter(hotspot);
    expect(pauseSpy).toHaveBeenCalled();

    fireEvent.click(hotspot);
    expect(onPlayVideo).toHaveBeenCalledWith('s6s2p87fPdA');
  });
});
