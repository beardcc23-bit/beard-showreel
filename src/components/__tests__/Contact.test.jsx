import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from '../Contact';

describe('Contact 元件 TDD 單元測試', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('應該正確渲染 Contact 區塊標題與 Email 地址', () => {
    render(<Contact />);

    // 檢查標題與 Email 資訊，且 Email 與 Leave a Note 應統一字體大小與字重
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Let's Connect/i);
    const emailEl = screen.getByText('beard.cc23@gmail.com');
    const noteEl = screen.getByText('Leave a Note');
    expect(emailEl).toBeInTheDocument();
    expect(emailEl).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold');
    expect(noteEl).toHaveClass('text-lg', 'sm:text-xl', 'md:text-2xl', 'font-bold');
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

  it('回饋表單送出若超過 12 秒連線逾時，應解除 submitting 並顯示逾時錯誤提示（不卡死）', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(
      (_url, opts) =>
        new Promise((_resolve, reject) => {
          opts?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        })
    );

    try {
      render(<Contact />);
      fireEvent.click(screen.getByRole('button', { name: /開啟回饋表單/i }));
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/您的稱呼/i), { target: { value: 'Beard' } });
      fireEvent.change(screen.getByLabelText(/回饋內容/i), { target: { value: '測試逾時防卡死' } });
      expect(screen.getByText('7 / 500')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /送出回饋/i }));
      expect(screen.getByText('傳送中...')).toBeInTheDocument();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(12500);
      });
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/連線逾時/);
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
