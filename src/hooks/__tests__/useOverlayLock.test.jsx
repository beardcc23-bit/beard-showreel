import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useOverlayLock } from '../useOverlayLock';

function OverlayFixture({ isOpen, onClose, hideCursor = false }) {
  const ref = useRef(null);
  useOverlayLock(isOpen, onClose, { hideCursor, containerRef: ref });
  if (!isOpen) return null;
  return (
    <div ref={ref}>
      <button type="button" data-testid="first-btn">First</button>
      <button type="button" data-testid="last-btn">Last</button>
    </div>
  );
}

describe('useOverlayLock Hook 測試', () => {
  it('雙層覆蓋層疊加時應維持參照計數，僅在最後一層關閉時解鎖背景與恢復游標', () => {
    const closeA = vi.fn();
    const closeB = vi.fn();
    const hideSpy = vi.fn();
    const showSpy = vi.fn();
    window.addEventListener('hide-custom-cursor', hideSpy);
    window.addEventListener('show-custom-cursor', showSpy);

    const { rerender } = render(
      <>
        <OverlayFixture isOpen={true} onClose={closeA} hideCursor />
        <OverlayFixture isOpen={true} onClose={closeB} hideCursor />
      </>
    );

    expect(document.body).toHaveClass('modal-open');
    expect(document.body.style.overflow).toBe('hidden');
    expect(hideSpy).toHaveBeenCalledTimes(1);

    // 按下 Escape 應僅觸發最上層 B 的關閉函式（LIFO）
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(closeB).toHaveBeenCalledTimes(1);
    expect(closeA).not.toHaveBeenCalled();

    // 關閉上層 B 時，A 仍開啟，背景不得提前解鎖
    rerender(
      <>
        <OverlayFixture isOpen={true} onClose={closeA} hideCursor />
        <OverlayFixture isOpen={false} onClose={closeB} hideCursor />
      </>
    );
    expect(document.body).toHaveClass('modal-open');
    expect(showSpy).not.toHaveBeenCalled();

    // 關閉最後一層 A 時，應解鎖背景並發送恢復游標事件
    rerender(
      <>
        <OverlayFixture isOpen={false} onClose={closeA} hideCursor />
        <OverlayFixture isOpen={false} onClose={closeB} hideCursor />
      </>
    );
    expect(document.body).not.toHaveClass('modal-open');
    expect(document.body.style.overflow).toBe('');
    expect(showSpy).toHaveBeenCalledTimes(1);

    window.removeEventListener('hide-custom-cursor', hideSpy);
    window.removeEventListener('show-custom-cursor', showSpy);
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
