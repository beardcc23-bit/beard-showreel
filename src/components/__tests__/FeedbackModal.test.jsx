import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeedbackModal from '../FeedbackModal';

describe('FeedbackModal 右側滑出式回饋抽屜與資安防護測試', () => {
  let baseNow = 1_800_000_000_000;

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    // 每次測試推進模擬系統時間 60 秒，避開跨測試間模組級 20 秒防刷記憶體鎖互相干擾
    baseNow += 60_000;
    vi.spyOn(Date, 'now').mockImplementation(() => baseNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('應將半形、全形與跨行試算表公式前綴轉義為純文字，並在送出成功後清除 sessionStorage 草稿', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true });
    const onClose = vi.fn();

    render(
      <FeedbackModal
        isOpen={true}
        onClose={onClose}
        scriptUrl="https://script.google.com/macros/s/mock/exec"
      />
    );

    const nameInput = screen.getByLabelText(/您的稱呼/i);
    const emailInput = screen.getByLabelText(/信箱 \/ LINE/i);
    const msgInput = screen.getByLabelText(/回饋內容/i);

    expect(emailInput).toHaveAttribute('spellcheck', 'false');
    expect(emailInput).toHaveAttribute('autocapitalize', 'none');

    fireEvent.change(nameInput, { target: { name: 'name', value: '＝SUM(A1:A5)' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: '+886912345678' } });
    fireEvent.change(msgInput, {
      target: { name: 'message', value: '=IMPORTXML("https://x")\n@HYPERLINK("https://y")' },
    });

    // 草稿應即時寫入 sessionStorage
    expect(sessionStorage.getItem('fb_draft_v1')).toContain('IMPORTXML');

    // 支援 Cmd/Ctrl + Enter 快捷送出
    fireEvent.keyDown(msgInput, { key: 'Enter', metaKey: true });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    const bodyParams = new URLSearchParams(fetchSpy.mock.calls[0][1].body);
    expect(bodyParams.get('name')).toBe("'＝SUM(A1:A5)");
    expect(bodyParams.get('email')).toBe("'+886912345678");
    expect(bodyParams.get('message')).toBe('\'=IMPORTXML("https://x")\n\'@HYPERLINK("https://y")');

    await waitFor(() => {
      expect(screen.getByText('感謝你的回饋')).toBeInTheDocument();
    });
    expect(sessionStorage.getItem('fb_draft_v1')).toBeNull();
  });

  it('submitting 傳送期間應鎖定背景遮罩、取消按鈕與 Escape，防止誤觸中斷請求', async () => {
    let resolveFetch;
    vi.spyOn(global, 'fetch').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const onClose = vi.fn();

    render(
      <FeedbackModal
        isOpen={true}
        onClose={onClose}
        scriptUrl="https://script.google.com/macros/s/mock/exec"
      />
    );

    fireEvent.change(screen.getByLabelText(/您的稱呼/i), {
      target: { name: 'name', value: '王導演' },
    });
    fireEvent.change(screen.getByLabelText(/回饋內容/i), {
      target: { name: 'message', value: '詢問檔期與 Flame 合成合作' },
    });

    fireEvent.click(screen.getByRole('button', { name: /送出回饋/i }));
    expect(screen.getByText('傳送中...')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: '取消' });
    const closeIconBtn = screen.getByLabelText('關閉回饋表單');
    expect(cancelBtn).toBeDisabled();
    expect(closeIconBtn).toBeDisabled();

    // 傳送中按 Escape 或點取消不應觸發 onClose
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(cancelBtn);
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => {
      resolveFetch({ ok: true });
    });
  });

  it('蜜罐欄位被機器人填寫時應靜默假成功攔截且不呼叫後端 API，20 秒內重複送出應觸發冷卻保護', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true });

    const { unmount } = render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
        scriptUrl="https://script.google.com/macros/s/mock/exec"
      />
    );

    fireEvent.change(screen.getByLabelText(/您的稱呼/i), {
      target: { name: 'name', value: 'SpamBot' },
    });
    fireEvent.change(screen.getByLabelText(/回饋內容/i), {
      target: { name: 'message', value: 'Buy cheap SEO' },
    });
    const honeypot = document.querySelector('input[name="corporate_organization"]');
    fireEvent.change(honeypot, { target: { value: 'BotCorp' } });

    fireEvent.click(screen.getByRole('button', { name: /送出回饋/i }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.getByText('感謝你的回饋')).toBeInTheDocument();
    unmount();

    // 模擬剛成功送出過（設定 fb_last_ts 為現在），驗證 20 秒防刷冷卻攔截
    sessionStorage.setItem('fb_last_ts', String(Date.now()));
    render(
      <FeedbackModal
        isOpen={true}
        onClose={vi.fn()}
        scriptUrl="https://script.google.com/macros/s/mock/exec"
      />
    );
    fireEvent.change(screen.getByLabelText(/您的稱呼/i), {
      target: { name: 'name', value: 'Beard' },
    });
    fireEvent.change(screen.getByLabelText(/回饋內容/i), {
      target: { name: 'message', value: '連續點擊測試' },
    });
    fireEvent.click(screen.getByRole('button', { name: /送出回饋/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/送出過於頻繁/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
