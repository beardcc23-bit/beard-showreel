import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Modal from '../Modal';

describe('Modal 影音與圖片燈箱單元測試', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('開啟 YouTube 影片時應以無沙盒阻擋、100% 可見狀態嵌入 www.youtube.com 確保繼承自動播放權限，且頂欄左側呈現品牌標題', () => {
    const onClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={onClose}
        type="video"
        data={{ videoId: 'pCBQA1vEDig', title: 'Foxtron Caviar', isFacebook: false }}
      />
    );

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Foxtron Caviar');
    expect(screen.getByText('Foxtron Caviar')).toBeInTheDocument();

    const iframe = screen.getByTitle('YouTube Video Player');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/pCBQA1vEDig?autoplay=1&enablejsapi=1&rel=0&playsinline=1'
    );
    expect(iframe).not.toHaveAttribute('sandbox');
    expect(iframe.className).not.toContain('opacity-0');
    const extLink = screen.getByLabelText('於新分頁開啟原影片');
    expect(extLink).toHaveAttribute('href', 'https://www.youtube.com/watch?v=pCBQA1vEDig');
    expect(extLink).toHaveAttribute('target', '_blank');
    expect(extLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('LOADING STREAM')).toBeInTheDocument();

    // 觸發 iframe onLoad 後應隱藏 LOADING STREAM 遮罩
    fireEvent.load(iframe);
    expect(screen.queryByText('LOADING STREAM')).not.toBeInTheDocument();
  });

  it('關閉彈窗瞬間（isOpen 轉 false 同幀、退場動畫尚未結束時）應穿透 AnimatePresence 快照立即從 DOM 卸載 iframe 切斷聲音', () => {
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="video"
        data={{ videoId: 'n4qMRlAlqjg', title: '2026 SHOWREEL', isFacebook: false }}
      />
    );

    expect(screen.getByTitle('YouTube Video Player')).toBeInTheDocument();
    expect(document.querySelectorAll('iframe')).toHaveLength(1);

    // 模擬點擊關閉（此時 AnimatePresence 仍在跑退場動畫，外層 dialog 尚未卸載）
    rerender(
      <Modal
        isOpen={false}
        onClose={vi.fn()}
        type={null}
        data={null}
      />
    );

    // 0ms 同幀斷言：不需等待退場動畫結束，iframe 必須已徹底從 DOM 移除且外層改為 pointer-events-none
    expect(screen.queryByTitle('YouTube Video Player')).not.toBeInTheDocument();
    expect(document.querySelectorAll('iframe')).toHaveLength(0);
    const exitingDialog = screen.queryByRole('dialog');
    if (exitingDialog) {
      expect(exitingDialog.className).toContain('pointer-events-none');
    }

    // 退場動畫尚未結束時立刻開啟下一支影片（2025 SHOWREEL），舊退場層絕不可復燃，全頁僅能存在唯一 1 顆新 iframe
    rerender(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="video"
        data={{ videoId: 's6s2p87fPdA', title: '2025 SHOWREEL', isFacebook: false }}
      />
    );
    const activeIframes = document.querySelectorAll('iframe');
    expect(activeIframes).toHaveLength(1);
    expect(activeIframes[0]).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/s6s2p87fPdA?autoplay=1&enablejsapi=1&rel=0&playsinline=1'
    );
  });

  it('8 秒載入看門狗應在外部嵌入未觸發 onLoad 時自動揭開 LOADING STREAM 遮罩防永久卡死', () => {
    vi.useFakeTimers();
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="video"
        data={{ videoId: 'AuuxyMIutf8', title: 'UCC' }}
      />
    );

    expect(screen.getByText('LOADING STREAM')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(screen.queryByText('LOADING STREAM')).not.toBeInTheDocument();
  });

  it('傳入非法字元 videoId 或非白名單外部網址時應安全降級為 about:blank 且不卡在載入遮罩', () => {
    render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="video"
        data={{
          videoId: 'bad"><script>',
          videoUrl: 'https://evil.example.com/video',
          isFacebook: true,
          title: 'Untrusted Source',
        }}
      />
    );

    const iframe = screen.getByTitle('Facebook Video Player');
    expect(iframe).toHaveAttribute('src', 'about:blank');
    expect(screen.queryByText('LOADING STREAM')).not.toBeInTheDocument();
  });

  it('圖片燈箱模式僅允許安全本地路徑並拒絕外部協定網址', () => {
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="image"
        data={{
          imageUrl: '/f1.webp',
          title: 'Autodesk Flame Batch Schematic',
          description: '實際專案 Batch 節點介面',
        }}
      />
    );

    const img = screen.getByAltText('Autodesk Flame Batch Schematic');
    expect(img).toHaveAttribute('src', '/f1.webp');
    expect(screen.getByText('實際專案 Batch 節點介面')).toBeInTheDocument();

    rerender(
      <Modal
        isOpen={true}
        onClose={vi.fn()}
        type="image"
        data={{
          imageUrl: 'https://evil.example.com/inject.webp',
          title: 'Blocked External Image',
          description: '不應渲染外部圖片',
        }}
      />
    );
    expect(screen.queryByAltText('Blocked External Image')).not.toBeInTheDocument();
  });
});
