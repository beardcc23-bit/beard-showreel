import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Hero from '../Hero';

describe('Hero 首幕 Sticky 舞台容器測試', () => {
  it('應包含供搜尋引擎與螢幕閱讀器讀取的唯一 h1，並依減少動態設定切換容器高度', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    try {
      const { container, unmount } = render(<Hero isModalOpen={false} onLoaded={vi.fn()} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent(/Beard Chou 周威全/i);
      expect(h1).toHaveClass('sr-only');

      const section = container.querySelector('#hero');
      expect(section).toHaveClass('h-[195dvh]', 'md:h-[280vh]');
      unmount();

      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      const { container: reducedContainer } = render(
        <Hero isModalOpen={false} onLoaded={vi.fn()} />
      );
      expect(reducedContainer.querySelector('#hero')).toHaveClass('h-[100dvh]');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
