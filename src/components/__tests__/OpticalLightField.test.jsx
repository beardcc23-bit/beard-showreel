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

  it('在具備 WebGL Context 環境下應無錯誤完成初始化、渲染與滾動／滑鼠喚醒（防止 TDZ ReferenceError）', () => {
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const mockGl = {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      COMPILE_STATUS: 0x8b81,
      LINK_STATUS: 0x8b82,
      ARRAY_BUFFER: 0x8892,
      STATIC_DRAW: 0x88e4,
      FLOAT: 0x1406,
      TRIANGLES: 0x0004,
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      deleteShader: () => {},
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      deleteProgram: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      deleteBuffer: () => {},
      getAttribLocation: () => 0,
      getUniformLocation: () => ({}),
      useProgram: () => {},
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      viewport: () => {},
      uniform1f: () => {},
      uniform2f: () => {},
      uniform4f: () => {},
      drawArrays: () => {},
    };
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (type === 'webgl' || type === 'experimental-webgl') return mockGl;
      return null;
    };

    try {
      const { container, unmount } = render(<OpticalLightField />);
      expect(container.querySelector('canvas')).toHaveClass('opacity-100');
      expect(container.querySelector('.optical-blob-warm')).toBeNull();
      window.dispatchEvent(new Event('scroll'));
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 300 }));
      unmount();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });
});
