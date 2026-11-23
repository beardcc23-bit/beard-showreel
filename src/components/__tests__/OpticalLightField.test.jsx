import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OpticalLightField from '../OpticalLightField';

describe('OpticalLightField 光學流體色散背景測試', () => {
  it('在無 WebGL 環境下應安全降級渲染 CSS 光譜備援層並具備無障礙隱藏屬性', () => {
    const { container, unmount } = render(<OpticalLightField />);
    const root = container.querySelector('.optical-field');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.optical-blob-warm')).toBeInTheDocument();
    expect(container.querySelector('.optical-blob-cool')).toBeInTheDocument();
    unmount();
  });
});
