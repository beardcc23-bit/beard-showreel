import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from '../App';
import { APP_EVENTS } from '../constants/siteConfig';

describe('App 全站根應用五幕整合與燈箱事件串接測試', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('應完整渲染導覽列、五幕主內容與頁尾，並支援點擊播放影片與安全圖片燈箱事件', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Beard Chou/i);
    expect(screen.getByText(/© 2026 Beard Chou/i)).toBeInTheDocument();

    // 1. 派發非法外部圖片路徑給 OPEN_IMAGE_MODAL 應被靜默攔截不開燈箱
    act(() => {
      window.dispatchEvent(
        new CustomEvent(APP_EVENTS.OPEN_IMAGE_MODAL, {
          detail: {
            imageUrl: 'https://evil.example.com/x.webp',
            title: 'Untrusted',
            description: 'Blocked',
          },
        })
      );
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // 2. 派發合法站內節點圖（含快取版本號）應成功懶載入並呈現圖片燈箱
    act(() => {
      window.dispatchEvent(
        new CustomEvent(APP_EVENTS.OPEN_IMAGE_MODAL, {
          detail: {
            imageUrl: '/f1.webp?v=2',
            title: 'Autodesk Flame Batch Schematic',
            description: '實際專案 Batch 節點介面',
          },
        })
      );
    });

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByAltText('Autodesk Flame Batch Schematic')).toHaveAttribute(
      'src',
      '/f1.webp?v=2'
    );

    // 關閉燈箱
    fireEvent.click(screen.getByLabelText('Close modal'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
