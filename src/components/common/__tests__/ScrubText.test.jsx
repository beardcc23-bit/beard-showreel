import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScrubText from '../ScrubText';

describe('ScrubText 滾動光束顯影段落測試', () => {
  it('應正確渲染傳入的 text 或 children 段落內容', () => {
    const { rerender } = render(<ScrubText text="第一段物理光影描述" className="custom-para" />);
    const para = screen.getByText('第一段物理光影描述').closest('p');
    expect(para).toHaveClass('custom-para');

    rerender(<ScrubText>子節點引言內容</ScrubText>);
    expect(screen.getByText('子節點引言內容')).toBeInTheDocument();
  });

  it('prefers-reduced-motion 開啟時應降級為純靜態 span 渲染', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    try {
      render(<ScrubText text="靜態無障礙模式文字" />);
      expect(screen.getByText('靜態無障礙模式文字')).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
