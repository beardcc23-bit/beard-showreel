import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useMediaQuery } from '../useMediaQuery';

function MediaProbe({ query }) {
  const matched = useMediaQuery(query);
  return <span data-testid="probe">{matched ? 'YES' : 'NO'}</span>;
}

describe('useMediaQuery 即時媒體查詢監聽測試', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('應正確讀取初始 matches 狀態，於觸發 change 事件時即時更新，並在卸載時移除監聽器', () => {
    let changeHandler = null;
    const addEventListener = vi.fn((event, cb) => {
      if (event === 'change') changeHandler = cb;
    });
    const removeEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener,
      removeEventListener,
    }));

    const { unmount } = render(
      <>
        <MediaProbe query="(max-width: 767px)" />
        <MediaProbe query="(max-width: 767px)" />
      </>
    );
    const probes = screen.getAllByTestId('probe');
    expect(probes[0]).toHaveTextContent('NO');
    expect(probes[1]).toHaveTextContent('NO');
    // 多個元件訂閱同一查詢字串時應共享單一底層 MediaQueryList 監聽器
    expect(addEventListener).toHaveBeenCalledTimes(1);

    act(() => {
      changeHandler?.({ matches: true });
    });
    expect(probes[0]).toHaveTextContent('YES');
    expect(probes[1]).toHaveTextContent('YES');

    unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith('change', changeHandler);
  });
});
