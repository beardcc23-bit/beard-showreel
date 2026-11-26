import { describe, it, expect } from 'vitest';
import {
  buildSampledFrames,
  buildLoadOrder,
  findNearestLoadedSlot,
} from '../sequenceLoader';

describe('sequenceLoader 序列載入演算法純函式測試', () => {
  it('buildSampledFrames 應保留首尾幀並按步進抽樣', () => {
    const full = buildSampledFrames(1, 117);
    expect(full).toHaveLength(117);
    expect(full[0]).toBe(0);
    expect(full[116]).toBe(116);

    const half = buildSampledFrames(2, 117);
    expect(half).toHaveLength(59);
    expect(half[0]).toBe(0);
    expect(half[58]).toBe(116);
  });

  it('buildLoadOrder 應優先排入首尾幀且無遺漏無重複', () => {
    const order = buildLoadOrder(59);
    expect(order).toHaveLength(59);
    expect(new Set(order).size).toBe(59);
    expect(order[0]).toBe(0);
    expect(order[1]).toBe(58);
  });

  it('findNearestLoadedSlot 應在目標幀未載入時回傳雙向最近可用影格', () => {
    const frames = [null, { id: 1 }, null, null, { id: 4 }];
    expect(findNearestLoadedSlot(frames, 1)).toBe(1);
    expect(findNearestLoadedSlot(frames, 2)).toBe(1);
    expect(findNearestLoadedSlot(frames, 3)).toBe(4);
    expect(findNearestLoadedSlot([null, null], 0)).toBe(-1);
  });
});
