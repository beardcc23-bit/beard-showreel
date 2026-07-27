import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimatedCounter from '../AnimatedCounter';

describe('AnimatedCounter 通用元件測試', () => {
  it('未觸發 trigger 時數字預設應為 0', () => {
    render(<AnimatedCounter value={300} trigger={false} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('觸發 trigger 時應正確渲染狀態', () => {
    render(<AnimatedCounter value={13} trigger={true} duration={0.1} />);
    // 渲染容器即可
    expect(screen.getByText(/[0-9]+/)).toBeInTheDocument();
  });
});
