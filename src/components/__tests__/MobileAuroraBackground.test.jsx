import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MobileAuroraBackground from '../MobileAuroraBackground';

describe('MobileAuroraBackground（手機版專屬極光漫延背景）', () => {
  it('應成功渲染並具有 mobile-aurora-mesh 類別', () => {
    const { container } = render(<MobileAuroraBackground />);
    const mesh = container.querySelector('.mobile-aurora-mesh');
    expect(mesh).toBeInTheDocument();
  });

  it('必須設定 pointer-events-none，確保 100% 不干擾任何觸控與指針互動', () => {
    const { container } = render(<MobileAuroraBackground />);
    const mesh = container.querySelector('.mobile-aurora-mesh');
    expect(mesh).toHaveClass('pointer-events-none');
  });

  it('必須設定 aria-hidden="true"，確保對螢幕報讀輔助設備隱藏純視覺裝飾', () => {
    const { container } = render(<MobileAuroraBackground />);
    const mesh = container.querySelector('.mobile-aurora-mesh');
    expect(mesh).toHaveAttribute('aria-hidden', 'true');
  });

  it('不應含有 transform-gpu 等可能與 keyframe 動畫衝突的 Tailwind 覆蓋類別', () => {
    const { container } = render(<MobileAuroraBackground />);
    const mesh = container.querySelector('.mobile-aurora-mesh');
    expect(mesh).not.toHaveClass('transform-gpu');
    expect(mesh).not.toHaveClass('will-change-transform');
  });
});
