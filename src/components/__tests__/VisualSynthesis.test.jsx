import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { act } from 'react';
import VisualSynthesis from '../VisualSynthesis';
import { categories } from '../../data/portfolio';

describe('VisualSynthesis Component', () => {
  it('renders ADVERTISING title and promotes the designated featured item to the lead 2x2 slot', () => {
    const handlePlayVideo = vi.fn();
    render(<VisualSynthesis onPlayVideo={handlePlayVideo} />);

    expect(screen.getByRole('heading', { level: 2, name: /advertising/i })).toBeInTheDocument();

    // Extra 是 portrait Shorts 不應被選為主推，UCC 為食品與飲料分類指定的唯一 col-span-2（手機滿版、桌機 2x2）主推大圖
    const portraitBtn = screen.getByRole('button', { name: /播放影片：Extra/i });
    const featuredBtn = screen.getByRole('button', { name: /播放影片：UCC/i });
    expect(portraitBtn.className).not.toContain('col-span-2');
    expect(featuredBtn.className).toContain('col-span-2');
    expect(featuredBtn.className).toContain('lg:row-span-2');
    // 驗證手機版採 2 欄網格（首張滿版、其餘縮小一半兩欄並排）
    expect(featuredBtn.parentElement.className).toContain('grid-cols-2');

    // 切換至「3C與家電」分類，驗證 Samsung Galaxy Tab S11 Ultra 為指定主推大圖並以原生 <a target="_blank" rel="noopener noreferrer"> 另開分頁
    fireEvent.click(screen.getByRole('tab', { name: '3C與家電' }));
    const samsungTabLink = screen.getByRole('link', { name: /開啟外部影片：Samsung Galaxy Tab S11 Ultra/i });
    const tokuyoBtn = screen.getByRole('button', { name: /播放影片：Tokuyo 按摩椅/i });
    expect(samsungTabLink.className).toContain('col-span-2');
    expect(samsungTabLink.className).toContain('lg:row-span-2');
    const samsungImg = samsungTabLink.querySelector('img');
    const shutterViewport = samsungTabLink.querySelector('[data-testid="card-shutter-viewport"]');
    expect(shutterViewport).toBeInTheDocument();
    expect(shutterViewport.className).toContain('lg:absolute');
    expect(samsungImg.className).toContain('lg:absolute');
    expect(samsungImg.className).toContain('lg:inset-0');
    expect(samsungTabLink).toHaveAttribute('target', '_blank');
    expect(samsungTabLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(samsungTabLink).toHaveAttribute('href', 'https://www.facebook.com/reel/1338163857656555');
    expect(tokuyoBtn.className).not.toContain('col-span-2');
  });

  it('routes inline YouTube video clicks and keeps linkless cards non-interactive without icons', () => {
    const handlePlayVideo = vi.fn();
    const imageModalListener = vi.fn();
    window.addEventListener('open-image-modal', imageModalListener);

    render(<VisualSynthesis onPlayVideo={handlePlayVideo} />);

    // 點擊主推站內 YouTube 卡片（UCC），應帶入品牌名稱供 Modal 頂欄呈現
    fireEvent.click(screen.getByRole('button', { name: /播放影片：UCC/i }));
    expect(handlePlayVideo).toHaveBeenCalledWith('AuuxyMIutf8', false, undefined, null, 'UCC');

    // 無影片大牌劇照（Johnnie Walker）應為靜態展示（非 button），手機版隱藏（hidden md:flex）以節省版面，點擊不觸發燈箱
    const staticLabel = screen.getByText('Johnnie Walker');
    expect(staticLabel.closest('button')).toBeNull();
    const staticCard = staticLabel.closest('.brand-card-spring');
    expect(staticCard).toHaveClass('hidden');
    expect(staticCard).toHaveClass('md:flex');

    const interactiveCard = screen.getByRole('button', { name: /播放影片：UCC/i });
    expect(interactiveCard).toHaveClass('flex');
    expect(interactiveCard).not.toHaveClass('hidden');

    fireEvent.click(staticLabel);
    expect(imageModalListener).not.toHaveBeenCalled();

    window.removeEventListener('open-image-modal', imageModalListener);
  });

  it('行動端底部應呈現右側單一「下一分類」按鈕，點擊後以暗場瞬切（0ms 無倒拉回頂）並原地顯影下一分類（含末項循環）', () => {
    vi.useFakeTimers();
    const originalScrollY = window.scrollY;
    const originalScrollTo = window.scrollTo;
    const scrollToSpy = vi.fn();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 2400 });
    window.scrollTo = scrollToSpy;

    try {
      render(<VisualSynthesis onPlayVideo={vi.fn()} />);

      const bottomNav = screen.getByTestId('mobile-vfx-bottom-nav');
      expect(bottomNav).toHaveClass('lg:hidden');
      expect(screen.queryByTestId('mobile-back-to-tabs-btn')).toBeNull();

      const tablist = screen.getByRole('tablist', { name: '作品專案分類' });
      tablist.getBoundingClientRect = () => ({
        top: -1200,
        height: 96,
        bottom: -1104,
        left: 0,
        right: 390,
        width: 390,
      });

      const nextBtn = screen.getByTestId('mobile-next-category-btn');
      expect(nextBtn).toHaveClass('optical-surface');
      expect(nextBtn).toHaveClass('col-start-2');
      expect(nextBtn.textContent).toBe('3C與家電');

      // 1. 點擊「3C與家電」：僅將前景作品區透明淡出（不蓋全黑幕、完整保留背後光影），於 150ms 透明幀以 behavior: 'auto' 0ms 瞬切回頂並原地顯影
      const tabpanel = screen.getByRole('tabpanel');
      fireEvent.click(nextBtn);
      expect(screen.queryByTestId('vfx-dissolve-curtain')).toBeNull();
      expect(tabpanel).toHaveAttribute('data-dissolving', 'true');
      expect(tabpanel).toHaveClass('opacity-0');
      act(() => {
        vi.advanceTimersByTime(160);
      });
      expect(screen.getByRole('tab', { name: '3C與家電' })).toHaveAttribute('aria-selected', 'true');
      expect(scrollToSpy).toHaveBeenLastCalledWith({ top: 1112, behavior: 'auto' });
      expect(nextBtn.textContent).toBe('交通工具');

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(tabpanel).toHaveAttribute('data-dissolving', 'false');
      expect(tabpanel).toHaveClass('opacity-100');

      // 2. 切到最後一類時，按鈕應循環顯示第一類「食品與飲料」並同樣支援暗場瞬切
      const lastCatName = categories[categories.length - 1].name;
      fireEvent.click(screen.getByRole('tab', { name: lastCatName }));
      expect(nextBtn.textContent).toBe('食品與飲料');
      fireEvent.click(nextBtn);
      act(() => {
        vi.advanceTimersByTime(220);
      });
      expect(screen.getByRole('tab', { name: '食品與飲料' })).toHaveAttribute('aria-selected', 'true');
    } finally {
      vi.useRealTimers();
      Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
      window.scrollTo = originalScrollTo;
    }
  });

  it('分類 tablist 應支援 WAI-ARIA 左右方向鍵、Home 與 End 鍵盤導覽及 Roving tabIndex', () => {
    render(<VisualSynthesis onPlayVideo={vi.fn()} />);

    const foodTab = screen.getByRole('tab', { name: '食品與飲料' });
    const techTab = screen.getByRole('tab', { name: '3C與家電' });
    const lastTab = screen.getByRole('tab', { name: categories[categories.length - 1].name });

    expect(foodTab).toHaveAttribute('tabIndex', '0');
    expect(techTab).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(foodTab, { key: 'ArrowRight' });
    expect(techTab).toHaveAttribute('aria-selected', 'true');
    expect(techTab).toHaveAttribute('tabIndex', '0');
    expect(foodTab).toHaveAttribute('tabIndex', '-1');

    fireEvent.keyDown(techTab, { key: 'End' });
    expect(lastTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(lastTab, { key: 'Home' });
    expect(foodTab).toHaveAttribute('aria-selected', 'true');

    // 驗證從行動漢堡選單子面板派發 select-portfolio-category 時同步切換對應分類
    fireEvent(
      window,
      new CustomEvent('select-portfolio-category', { detail: { categoryId: 'vehicle' } })
    );
    expect(screen.getByRole('tab', { name: '交通工具' })).toHaveAttribute('aria-selected', 'true');
    expect(document.documentElement.dataset.portfolioTab).toBe('vehicle');
  });
});
