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

// 模擬 HTMLMediaElement.prototype.load、window.scrollTo 與 HTMLCanvasElement.prototype.getContext（消除 jsdom 未實作洗版警告）
if (typeof window !== 'undefined') {
  if (window.HTMLMediaElement) {
    window.HTMLMediaElement.prototype.load = () => {};
  }
  window.scrollTo = () => {};
  if (window.HTMLCanvasElement) {
    window.HTMLCanvasElement.prototype.getContext = () => null;
  }
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
