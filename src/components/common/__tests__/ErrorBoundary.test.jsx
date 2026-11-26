import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

function BrokenWidget({ message = 'Unexpected render failure' }) {
  throw new Error(message);
}

describe('ErrorBoundary 安全錯誤邊界單元測試', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('子元件正常時應原樣渲染內容', () => {
    render(
      <ErrorBoundary>
        <div>正常畫面內容</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('正常畫面內容')).toBeInTheDocument();
  });

  it('子元件拋出例外時應攔截白屏並呈現繁中重新載入復原介面', () => {
    render(
      <ErrorBoundary>
        <BrokenWidget />
      </ErrorBoundary>
    );
    expect(screen.getByText(/頁面版本已更新，請重新載入以檢視最新內容/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重新載入' })).toBeInTheDocument();
  });

  it('minimal 模式下發生錯誤時應靜默降級回傳 null 而不影響主內容區', () => {
    const { container } = render(
      <ErrorBoundary minimal>
        <BrokenWidget />
      </ErrorBoundary>
    );
    expect(container.firstChild).toBeNull();
  });
});
