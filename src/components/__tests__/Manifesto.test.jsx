import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Manifesto from '../Manifesto';

describe('Manifesto 元件懸浮預覽與互動測試', () => {
  it('滑鼠懸停 Autodesk Flame 時應於 Portal 以獨立 fixed 容器顯示預覽圖（不被 optical-surface relative 覆蓋）', () => {
    render(<Manifesto onPlayVideo={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /Autodesk Flame/i });
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });

    const previewWrapper = screen.getByTestId('flame-hover-preview');
    expect(previewWrapper).toBeInTheDocument();
    expect(previewWrapper.style.position).toBe('fixed');
    expect(previewWrapper.className).not.toContain('optical-surface');
    expect(previewWrapper.querySelector('.optical-surface')).not.toBeNull();

    fireEvent.pointerLeave(trigger);
  });

  it('01 / 02 / 03 三層分鏡卡在手機與桌機皆應以獨立 sticky 容器依序疊壓且不被 optical-surface 覆蓋', () => {
    render(<Manifesto onPlayVideo={vi.fn()} />);

    const s1 = screen.getByTestId('manifesto-stack-01');
    const s2 = screen.getByTestId('manifesto-stack-02');
    const s3 = screen.getByTestId('manifesto-stack-03');

    [s1, s2, s3].forEach((wrapper) => {
      expect(wrapper).toHaveClass('sticky');
      expect(wrapper.className).not.toContain('optical-surface');
      expect(wrapper.querySelector('.optical-surface')).not.toBeNull();
    });

    expect(Number(s2.style.zIndex)).toBeGreaterThan(Number(s1.style.zIndex));
    expect(Number(s3.style.zIndex)).toBeGreaterThan(Number(s2.style.zIndex));
  });
});
