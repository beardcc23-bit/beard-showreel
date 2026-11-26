import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RefractionCard from '../RefractionCard';

describe('RefractionCard 磨砂厚玻璃光暈追蹤測試', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('桌機游標移動應於 rAF 更新 --mouse-x / --mouse-y，離開時歸位，觸控事件則直接早退零開銷', () => {
    vi.useFakeTimers();
    render(
      <RefractionCard data-testid="refraction-card">
        <span>光學內容</span>
      </RefractionCard>
    );

    const card = screen.getByTestId('refraction-card');
    expect(card).toHaveClass('optical-surface');
    card.getBoundingClientRect = () => ({
      left: 100,
      top: 50,
      width: 400,
      height: 300,
      right: 500,
      bottom: 350,
    });

    // 純觸控 pointerType="touch" 不應寫入座標
    fireEvent.pointerMove(card, { clientX: 220, clientY: 180, pointerType: 'touch' });
    act(() => {
      vi.runAllTimers();
    });
    expect(card.style.getPropertyValue('--mouse-x')).toBe('');

    // 滑鼠 pointerType="mouse" 應更新相對光暈座標
    fireEvent.pointerEnter(card, { clientX: 220, clientY: 180, pointerType: 'mouse' });
    fireEvent.pointerMove(card, { clientX: 220, clientY: 180, pointerType: 'mouse' });
    act(() => {
      vi.runAllTimers();
    });
    expect(card.style.getPropertyValue('--mouse-x')).toBe('120px');
    expect(card.style.getPropertyValue('--mouse-y')).toBe('130px');

    fireEvent.pointerLeave(card, { pointerType: 'mouse' });
    expect(card.style.getPropertyValue('--mouse-x')).toBe('-400px');
    expect(card.style.getPropertyValue('--mouse-y')).toBe('-400px');
  });
});
