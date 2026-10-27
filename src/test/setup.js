import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 模擬 IntersectionObserver（供 Framer Motion 與自訂滾動監控使用）
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;
window.IntersectionObserver = MockIntersectionObserver;

// 模擬 ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;
window.ResizeObserver = MockResizeObserver;

// 模擬 HTMLMediaElement.prototype.load（避免 jsdom 印出 Not implemented 警告）
if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.load = () => {};
}

// 初始化 navigator.clipboard
if (typeof window !== 'undefined' && !navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: () => Promise.resolve(),
    },
    writable: true,
    configurable: true,
  });
}

// 每次測試完畢清理 DOM
afterEach(() => {
  cleanup();
});
