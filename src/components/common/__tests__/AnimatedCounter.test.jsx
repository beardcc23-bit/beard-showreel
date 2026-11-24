import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnimatedCounter from '../AnimatedCounter';

describe('AnimatedCounter 通用元件測試', () => {
  it('未觸發 trigger 時動畫顯示為 0，但外層 aria-label 仍提供真實目標數值供 SEO 與無障礙讀取', () => {
    render(<AnimatedCounter value={300} trigger={false} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByLabelText('300')).toBeInTheDocument();
  });

  it('觸發 trigger 時應正確渲染狀態，且 prefers-reduced-motion 下直接呈現終值', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((q) => ({
      matches: q.includes('prefers-reduced-motion'),
      media: q,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    try {
      render(<AnimatedCounter value={14} trigger={false} duration={0.1} />);
      expect(screen.getByText('14')).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
