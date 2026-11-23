import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import VisualSynthesis from '../VisualSynthesis';

describe('VisualSynthesis Component', () => {
  it('renders ADVERTISING title and promotes the designated featured item to the lead 2x2 slot', () => {
    const handlePlayVideo = vi.fn();
    render(<VisualSynthesis onPlayVideo={handlePlayVideo} />);

    expect(screen.getByRole('heading', { level: 2, name: /advertising/i })).toBeInTheDocument();

    // Extra 是 portrait Shorts 不應被選為 2x2 主推，UCC 為食品與飲料分類指定的唯一 lg:col-span-2 主推大圖
    const portraitBtn = screen.getByRole('button', { name: /播放影片：Extra/i });
    const featuredBtn = screen.getByRole('button', { name: /播放影片：UCC/i });
    expect(portraitBtn.className).not.toContain('lg:col-span-2');
    expect(featuredBtn.className).toContain('lg:col-span-2');
  });

  it('routes inline YouTube video clicks and keeps linkless cards non-interactive without icons', () => {
    const handlePlayVideo = vi.fn();
    const imageModalListener = vi.fn();
    window.addEventListener('open-image-modal', imageModalListener);

    render(<VisualSynthesis onPlayVideo={handlePlayVideo} />);

    // 點擊主推站內 YouTube 卡片（UCC）
    fireEvent.click(screen.getByRole('button', { name: /播放影片：UCC/i }));
    expect(handlePlayVideo).toHaveBeenCalledWith('AuuxyMIutf8', false, undefined);

    // 無影片大牌劇照（Johnnie Walker）應為靜態展示（非 button），點擊不觸發燈箱或放大
    const staticLabel = screen.getByText('Johnnie Walker');
    expect(staticLabel.closest('button')).toBeNull();
    fireEvent.click(staticLabel);
    expect(imageModalListener).not.toHaveBeenCalled();

    window.removeEventListener('open-image-modal', imageModalListener);
  });
});
