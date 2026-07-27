import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from '../Contact';

describe('Contact 元件 TDD 單元測試', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('應該正確渲染 Contact 區塊標題與 Email 地址', () => {
    render(<Contact />);

    // 檢查標題與 Email 資訊
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Let's Connect/i);
    expect(screen.getByText('beard.cc23@gmail.com')).toBeInTheDocument();
  });

  it('點擊 Email 按鈕時應該觸發複製剪貼簿並顯示成功訊息', async () => {
    const spyWriteText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    render(<Contact />);

    const copyBtn = screen.getByRole('button', { name: /複製 Email 地址/i });
    fireEvent.click(copyBtn);

    // 檢查是否呼叫 writeText 寫入特定 Email
    expect(spyWriteText).toHaveBeenCalledWith('beard.cc23@gmail.com');

    // 檢查 HUD Toast 提示是否呈現
    await waitFor(() => {
      expect(screen.getByText(/COPIED TO CLIPBOARD/i)).toBeInTheDocument();
    });
  });

  it('點擊「留下回饋」按鈕時應該開啟 FeedbackModal 彈窗', async () => {
    render(<Contact />);

    const feedbackBtn = screen.getByRole('button', { name: /開啟回饋表單/i });
    fireEvent.click(feedbackBtn);

    // 回饋彈窗開啟後應該能找到 dialog 元素
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
