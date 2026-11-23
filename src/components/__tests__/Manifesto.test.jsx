import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Manifesto from '../Manifesto';

describe('Manifesto 元件懸浮預覽與互動測試', () => {
  it('滑鼠懸停 Autodesk Flame 時應於 Portal 以獨立 fixed 容器顯示預覽圖（不被 optical-surface relative 覆蓋）', () => {
    render(<Manifesto onPlayVideo={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: /Autodesk Flame/i });
    fireEvent.mouseEnter(trigger);

    const previewWrapper = screen.getByTestId('flame-hover-preview');
    expect(previewWrapper).toBeInTheDocument();
    expect(previewWrapper.style.position).toBe('fixed');
    expect(previewWrapper.className).not.toContain('optical-surface');
    expect(previewWrapper.querySelector('.optical-surface')).not.toBeNull();

    fireEvent.mouseLeave(trigger);
  });
});
