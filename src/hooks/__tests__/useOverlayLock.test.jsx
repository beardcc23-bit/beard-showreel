import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOverlayLock } from '../useOverlayLock';

function OverlayFixture({ isOpen, onClose }) {
  const ref = useRef(null);
  useOverlayLock(isOpen, onClose, { containerRef: ref });
  if (!isOpen) return null;
  return (
    <div ref={ref}>
      <button type="button" data-testid="first-btn">First</button>
      <button type="button" data-testid="last-btn">Last</button>
    </div>
  );
}

describe('useOverlayLock Hook 測試', () => {
  it('雙層覆蓋層疊加時應維持參照計數、同步設定 --scrollbar-comp 補償 fixed 導覽列，並僅在最後一層關閉時解鎖', () => {
    const closeA = vi.fn();
    const closeB = vi.fn();
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1425 });

    try {
      const { rerender, getByTestId } = render(
        <>
          <nav data-testid="bg-nav">Nav</nav>
          <main data-testid="bg-main">Main</main>
          <footer data-testid="bg-footer">Footer</footer>
          <OverlayFixture isOpen={true} onClose={closeA} />
          <OverlayFixture isOpen={true} onClose={closeB} />
        </>
      );

      expect(document.body).toHaveClass('modal-open');
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.style.paddingRight).toBe('15px');
      expect(document.documentElement.style.getPropertyValue('--scrollbar-comp')).toBe('15px');
      expect(getByTestId('bg-nav')).toHaveAttribute('inert');
      expect(getByTestId('bg-main')).toHaveAttribute('inert');
      expect(getByTestId('bg-footer')).toHaveAttribute('inert');

      // 按下 Escape 應僅觸發最上層 B 的關閉函式（LIFO）
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(closeB).toHaveBeenCalledTimes(1);
      expect(closeA).not.toHaveBeenCalled();

      // 關閉上層 B 時，A 仍開啟，背景與 --scrollbar-comp 不得提前解鎖
      rerender(
        <>
          <nav data-testid="bg-nav">Nav</nav>
          <main data-testid="bg-main">Main</main>
          <footer data-testid="bg-footer">Footer</footer>
          <OverlayFixture isOpen={true} onClose={closeA} />
          <OverlayFixture isOpen={false} onClose={closeB} />
        </>
      );
      expect(document.body).toHaveClass('modal-open');
      expect(document.documentElement.style.getPropertyValue('--scrollbar-comp')).toBe('15px');
      expect(getByTestId('bg-nav')).toHaveAttribute('inert');
      expect(getByTestId('bg-main')).toHaveAttribute('inert');

      // 關閉最後一層 A 時，應解鎖背景並移除 --scrollbar-comp 與 inert
      rerender(
        <>
          <nav data-testid="bg-nav">Nav</nav>
          <main data-testid="bg-main">Main</main>
          <footer data-testid="bg-footer">Footer</footer>
          <OverlayFixture isOpen={false} onClose={closeA} />
          <OverlayFixture isOpen={false} onClose={closeB} />
        </>
      );
      expect(document.body).not.toHaveClass('modal-open');
      expect(document.body.style.overflow).toBe('');
      expect(document.documentElement.style.getPropertyValue('--scrollbar-comp')).toBe('');
      expect(getByTestId('bg-nav')).not.toHaveAttribute('inert');
      expect(getByTestId('bg-main')).not.toHaveAttribute('inert');
      expect(getByTestId('bg-footer')).not.toHaveAttribute('inert');
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    }
  });

  it('應執行 Tab / Shift+Tab 焦點循環並在關閉時歸還原焦點', () => {
    const triggerBtn = document.createElement('button');
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();

    const onClose = vi.fn();
    const { getByTestId, rerender } = render(<OverlayFixture isOpen={true} onClose={onClose} />);
    const firstBtn = getByTestId('first-btn');
    const lastBtn = getByTestId('last-btn');

    lastBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(firstBtn);

    firstBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(lastBtn);

    rerender(<OverlayFixture isOpen={false} onClose={onClose} />);
    expect(document.activeElement).toBe(triggerBtn);
    document.body.removeChild(triggerBtn);
  });
});
