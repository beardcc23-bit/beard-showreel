import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from '../Navigation';
import { HERO_FINAL_FRAME_PROGRESS } from '../../constants/heroScroll';

describe('Navigation 元件行動端對齊與互動測試', () => {
  it('開啟行動端選單後，選單文字與按鈕文字均具有 px-6 對齊樣式', () => {
    render(<Navigation />);

    // 點擊漢堡按鈕開啟行動端側邊選單
    const toggleBtn = screen.getByLabelText('Toggle Navigation Menu');
    fireEvent.click(toggleBtn);

    // 驗證行動端選單項目的類別包含 px-6 (取行動版選單內的元素)
    const profileLinks = screen.getAllByText('個人介紹');
    const mobileProfileLink = profileLinks[profileLinks.length - 1].closest('a');
    expect(mobileProfileLink).toHaveClass('px-6');

    // 驗證下方建立聯繫按鈕亦包含 px-6，文字起點一致，且抽屜使用 inset-y-0 避免手機 100vh 裁切底部按鈕
    const contactBtns = screen.getAllByText('建立聯繫');
    const mobileContactBtn = contactBtns[contactBtns.length - 1].closest('a');
    expect(mobileContactBtn).toHaveClass('px-6');
    expect(mobileContactBtn).toHaveAttribute('href', '#contact');

    const drawer = screen.getByLabelText('行動版導覽選單');
    expect(drawer).toHaveClass('inset-y-0');
    expect(drawer).toHaveClass('overflow-y-auto');
    expect(drawer).not.toHaveClass('h-screen');
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

    try {
      render(<Navigation />);
      const aboutLink = screen.getByText('視覺思考').closest('a');
      expect(aboutLink).not.toHaveAttribute('aria-current');

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
      aboutEl.remove();
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
});
