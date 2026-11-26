import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Introduction from '../Introduction';

describe('Introduction 元件 TDD 單元測試', () => {
  it('應該正確渲染 Beard Chou 大標題與成就數據區塊', () => {
    render(<Introduction onPlayVideo={() => {}} />);

    // 驗證大標題
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Beard Chou/i);

    // 驗證三個戰績標籤
    expect(screen.getByText('後期資歷')).toBeInTheDocument();
    expect(screen.getByText('廣告專案')).toBeInTheDocument();
    expect(screen.getByText('播放版本')).toBeInTheDocument();
  });

  it('點擊 2026 SHOWREEL 與 2025 SHOWREEL 雙按鈕時應分別觸發對應影片 ID 與燈箱標題', () => {
    const handlePlayVideo = vi.fn();
    render(<Introduction onPlayVideo={handlePlayVideo} />);

    const btn2026 = screen.getByRole('button', { name: /2026 SHOWREEL/i });
    const btn2025 = screen.getByRole('button', { name: /2025 SHOWREEL/i });
    expect(btn2026).toHaveClass('spectral-cta');
    expect(btn2025).toHaveClass('spectral-cta-secondary');

    fireEvent.click(btn2026);
    expect(handlePlayVideo).toHaveBeenLastCalledWith(
      'n4qMRlAlqjg',
      false,
      'video',
      null,
      '2026 SHOWREEL'
    );

    fireEvent.click(btn2025);
    expect(handlePlayVideo).toHaveBeenLastCalledWith(
      's6s2p87fPdA',
      false,
      'video',
      null,
      '2025 SHOWREEL'
    );
  });
});
