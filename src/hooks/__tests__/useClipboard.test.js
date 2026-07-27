import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClipboard } from '../useClipboard';

describe('useClipboard Custom Hook 測試', () => {
  const writeTextMock = vi.fn().mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    writeTextMock.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it('初始狀態 copied 應為 false', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
  });

  it('呼叫 copy 時應寫入剪貼簿並更新 copied 狀態', async () => {
    const { result } = renderHook(() => useClipboard(2500));

    await act(async () => {
      result.current.copy('beard@example.com');
    });

    expect(writeTextMock).toHaveBeenCalledWith('beard@example.com');
    expect(result.current.copied).toBe(true);
  });
});
