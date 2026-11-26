import { describe, it, expect } from 'vitest';
import {
  HERO_FINAL_FRAME_PROGRESS,
  getHeroStickyScrollable,
  getHeroFinalFrameY,
} from '../heroScroll';

describe('heroScroll 首屏時間軸常數與座標換算測試', () => {
  it('getHeroStickyScrollable 與 getHeroFinalFrameY 應精準計算扣除 sticky 舞台高度後的定版座標', () => {
    expect(getHeroStickyScrollable(null)).toBe(0);
    expect(getHeroFinalFrameY(null)).toBe(0);

    const heroEl = document.createElement('section');
    const stickyEl = document.createElement('div');
    stickyEl.setAttribute('data-hero-sticky', '');
    Object.defineProperty(stickyEl, 'offsetHeight', { value: 900 });
    heroEl.appendChild(stickyEl);
    heroEl.getBoundingClientRect = () => ({
      top: 0,
      height: 2520,
      bottom: 2520,
      left: 0,
      right: 1440,
      width: 1440,
    });

    const scrollable = getHeroStickyScrollable(heroEl);
    expect(scrollable).toBe(1620);
    expect(getHeroFinalFrameY(heroEl)).toBe(Math.round(1620 * HERO_FINAL_FRAME_PROGRESS));
  });
});
