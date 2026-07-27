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

  it('點擊 SHOWREEL 按鈕時應該觸發 onPlayVideo 並帶入影片 ID', () => {
    const handlePlayVideo = vi.fn();
    render(<Introduction onPlayVideo={handlePlayVideo} />);

    const showreelBtn = screen.getByRole('button', { name: /SHOWREEL/i });
    fireEvent.click(showreelBtn);

    // 驗證是否傳遞預設的 YouTube ID 's6s2p87fPdA'
    expect(handlePlayVideo).toHaveBeenCalledWith('s6s2p87fPdA');
  });
});
