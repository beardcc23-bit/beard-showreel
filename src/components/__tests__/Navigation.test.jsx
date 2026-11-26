import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from '../Navigation';
import { HERO_FINAL_FRAME_PROGRESS } from '../../constants/heroScroll';

describe('Navigation 元件行動端對齊與互動測試', () => {
  it('開啟行動端窄版選單後，母子頁面字級應完全統一，展開作品案例時個人介紹橘線應自動暗掉，點擊子項目應連體同步關閉', async () => {
    const introEl = document.createElement('section');
    introEl.id = 'introduction';
    document.body.appendChild(introEl);

    const vfxTabs = document.createElement('div');
    vfxTabs.id = 'vfx-tabs';
    vfxTabs.getBoundingClientRect = () => ({
      top: 1200,
      height: 80,
      bottom: 1280,
      left: 0,
      right: 390,
      width: 390,
    });
    document.body.appendChild(vfxTabs);

    const originalIO = window.IntersectionObserver;
    let observerCb = null;
    class SpyIO {
      constructor(cb) {
        observerCb = cb;
      }
      observe() {}
      disconnect() {}
    }
    window.IntersectionObserver = SpyIO;
    global.IntersectionObserver = SpyIO;

    const selectCategorySpy = vi.fn();
    window.addEventListener('select-portfolio-category', selectCategorySpy);

    try {
      render(<Navigation />);

      // 模擬目前滾動停留在「個人介紹」區塊
      act(() => {
        observerCb?.([{ target: introEl, isIntersecting: true }]);
      });

      // 點擊漢堡按鈕開啟行動端側邊選單
      const toggleBtn = screen.getByLabelText('Toggle Navigation Menu');
      fireEvent.click(toggleBtn);

      const drawer = screen.getByLabelText('行動版導覽選單');
      expect(drawer).toHaveClass('overflow-y-auto');
      expect(drawer).not.toHaveClass('h-screen');

      // 初始時「個人介紹」亮起橘色線（border-spectral-crimson）
      const profileLinks = screen.getAllByText('個人介紹');
      const mobileProfileLink = profileLinks[profileLinks.length - 1].closest('a');
      expect(mobileProfileLink).toHaveClass('border-spectral-crimson', 'min-[390px]:text-[18px]');

      const contactBtns = screen.getAllByText('建立聯繫');
      const mobileContactSpan = contactBtns[contactBtns.length - 1];
      const mobileContactBtn = mobileContactSpan.closest('a');
      expect(mobileContactSpan).toHaveClass('min-[390px]:text-[18px]');
      expect(mobileContactBtn).toHaveClass('py-3.5', 'w-fit');
      expect(mobileContactBtn.parentElement).toBe(mobileProfileLink.parentElement);

      // 驗證「作品案例」右側箭頭常駐為橘色
      expect(screen.getByTestId('portfolio-submenu-arrow')).toHaveClass('text-spectral-crimson');

      // 點擊「作品案例」展開右側 6 大分類子面板：此時「個人介紹」橘色線應立刻暗掉（border-white/10），僅「作品案例」亮橘色線
      const portfolioBtns = screen.getAllByText('作品案例');
      const mobilePortfolioBtn = portfolioBtns[portfolioBtns.length - 1].closest('button');
      fireEvent.click(mobilePortfolioBtn);
      expect(mobilePortfolioBtn).toHaveClass('border-spectral-crimson');
      expect(mobileProfileLink).toHaveClass('border-white/10');
      expect(mobileProfileLink).not.toHaveClass('border-spectral-crimson');

      const subpanel = screen.getByTestId('mobile-portfolio-subpanel');
      expect(subpanel).toBeInTheDocument();
      // 驗證子面板與母面板處於同一個連體滑動舞台內（關閉時一體同步退場）
      expect(drawer.parentElement).toContainElement(subpanel);

      const categoryButtons = subpanel.querySelectorAll('button');
      expect(categoryButtons).toHaveLength(6);
      // 驗證子頁面按鈕字級與母頁面完全一致
      expect(categoryButtons[0]).toHaveClass('min-[390px]:text-[18px]', 'font-medium', 'tracking-[0.06em]');

      // 點擊子面板中的「交通工具」，應派發分類切換事件並讓母子舞台一起關閉消失
      fireEvent.click(screen.getByRole('button', { name: '交通工具' }));
      expect(selectCategorySpy).toHaveBeenCalledTimes(1);
      expect(selectCategorySpy.mock.calls[0][0].detail).toEqual({ categoryId: 'vehicle' });
    } finally {
      window.removeEventListener('select-portfolio-category', selectCategorySpy);
      window.IntersectionObserver = originalIO;
      global.IntersectionObserver = originalIO;
      introEl.remove();
      vfxTabs.remove();
    }
  });

  it('Scroll Spy 應在區塊進入視窗時標記 aria-current="location"，滑回頂部時清除', () => {
    const originalIO = window.IntersectionObserver;
    let observerCb = null;

    class SpyIO {
      constructor(cb) {
        observerCb = cb;
      }
      observe() {}
      disconnect() {}
    }
    window.IntersectionObserver = SpyIO;
    global.IntersectionObserver = SpyIO;

    const aboutEl = document.createElement('section');
    aboutEl.id = 'about';
    document.body.appendChild(aboutEl);

    const heroEl = document.createElement('section');
    heroEl.id = 'hero';
    heroEl.getBoundingClientRect = () => ({
      top: 0,
      height: 2520,
      bottom: 2520,
      left: 0,
      right: 1440,
      width: 1440,
    });
    document.body.appendChild(heroEl);

    const introEl = document.createElement('section');
    introEl.id = 'introduction';
    document.body.appendChild(introEl);

    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });

    try {
      render(<Navigation />);
      const introLink = screen.getByText('個人介紹').closest('a');
      const aboutLink = screen.getByText('視覺思考').closest('a');
      expect(aboutLink).not.toHaveAttribute('aria-current');

      // 模擬往下滑至 IO 觸發點（scrollY = 2520 - 900 * 0.65 = 1935），scroll 事件不得將剛點亮的「個人介紹」洗掉
      Object.defineProperty(window, 'scrollY', { value: 1940, configurable: true });
      act(() => {
        observerCb([{ target: introEl, isIntersecting: true }]);
        window.dispatchEvent(new Event('scroll'));
      });
      expect(introLink).toHaveAttribute('aria-current', 'location');

      act(() => {
        observerCb([{ target: aboutEl, isIntersecting: true }]);
      });
      expect(aboutLink).toHaveAttribute('aria-current', 'location');

      Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });
      expect(aboutLink).not.toHaveAttribute('aria-current');
    } finally {
      heroEl.remove();
      introEl.remove();
      aboutEl.remove();
      Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true });
      window.IntersectionObserver = originalIO;
      global.IntersectionObserver = originalIO;
    }
  });

  it('點擊左上角 Beard Showreel 按鈕應捲動至 Hero 最後一張定版位置而非第一張', () => {
    const heroEl = document.createElement('section');
    heroEl.id = 'hero';
    heroEl.getBoundingClientRect = () => ({
      top: -2000,
      height: 2520,
      bottom: 520,
      left: 0,
      right: 1440,
      width: 1440,
    });
    document.body.appendChild(heroEl);

    const originalInnerHeight = window.innerHeight;
    const originalScrollY = window.scrollY;
    const originalLenis = window.lenis;
    const mockScrollTo = vi.fn();

    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 2000 });
    window.lenis = { start: vi.fn(), scrollTo: mockScrollTo };

    try {
      render(<Navigation />);
      const brandBtn = screen.getByLabelText('Beard Showreel - 回到首頁主視覺定版');
      fireEvent.click(brandBtn);

      const expectedY = Math.round((2520 - 900) * HERO_FINAL_FRAME_PROGRESS);
      expect(mockScrollTo).toHaveBeenCalledTimes(1);
      expect(mockScrollTo.mock.calls[0][0]).toBe(expectedY);
      expect(expectedY).toBeGreaterThan(0);
    } finally {
      heroEl.remove();
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
      Object.defineProperty(window, 'scrollY', { configurable: true, value: originalScrollY });
      window.lenis = originalLenis;
    }
  });

  it('行動端選單支援 ArrowRight 展開聚焦子面板，以及 ArrowLeft / 兩段式 Escape 先收合子面板再關閉選單', () => {
    render(<Navigation />);

    fireEvent.click(screen.getByLabelText('Toggle Navigation Menu'));
    const portfolioBtns = screen.getAllByText('作品案例');
    const mobilePortfolioBtn = portfolioBtns[portfolioBtns.length - 1].closest('button');

    // 按下 ArrowRight 展開右側子面板
    fireEvent.keyDown(mobilePortfolioBtn, { key: 'ArrowRight' });
    const subpanel = screen.getByTestId('mobile-portfolio-subpanel');
    expect(subpanel).toBeInTheDocument();

    // 第 1 次在舞台內按 Escape：僅收合右側子面板，母選單維持開啟且焦點歸還「作品案例」按鈕
    fireEvent.keyDown(subpanel, { key: 'Escape' });
    expect(screen.queryByTestId('mobile-portfolio-subpanel')).not.toBeInTheDocument();
    expect(screen.getByLabelText('行動版導覽選單')).toBeInTheDocument();
    expect(document.activeElement).toBe(mobilePortfolioBtn);

    // 再次展開子面板並聚焦子按鈕，按下 ArrowLeft 應收合子面板並將焦點歸還母按鈕
    fireEvent.keyDown(mobilePortfolioBtn, { key: 'ArrowRight' });
    const firstCatBtn = screen.getByTestId('mobile-portfolio-subpanel').querySelector('button');
    firstCatBtn.focus();
    fireEvent.keyDown(firstCatBtn, { key: 'ArrowLeft' });
    expect(screen.queryByTestId('mobile-portfolio-subpanel')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(mobilePortfolioBtn);
  });
});
