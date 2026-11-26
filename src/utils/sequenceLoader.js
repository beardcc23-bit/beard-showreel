/**
 * Hero 逐幀序列抽樣、兩階段骨架交錯載入順序與最近就緒幀回退純函式模組
 */
export const TOTAL_SOURCE_FRAMES = 117;
export const LAST_SOURCE_FRAME = TOTAL_SOURCE_FRAMES - 1;

export function buildSampledFrames(step = 1, totalFrames = TOTAL_SOURCE_FRAMES) {
  const safeStep = Math.max(1, step);
  const lastFrame = Math.max(0, totalFrames - 1);
  const indices = [];
  for (let i = 0; i < totalFrames; i += safeStep) {
    indices.push(i);
  }
  if (indices[indices.length - 1] !== lastFrame) {
    indices.push(lastFrame);
  }
  return indices;
}

export function buildLoadOrder(count, keySlot = -1) {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const order = [];
  const added = new Set();
  const push = (slot) => {
    if (slot >= 0 && slot < count && !added.has(slot)) {
      added.add(slot);
      order.push(slot);
    }
  };

  // 第 0 層：起點、終點與主視覺定版幀（第 80 格）同批最優先載入
  push(0);
  push(count - 1);
  if (keySlot > 0 && keySlot < count - 1) {
    push(keySlot);
  }

  // 第 1 層：均勻骨架幀（進站瞬間即可全段順滑刷動不斷格）
  const skeletonStep = Math.max(1, Math.floor((count - 1) / 10));
  for (let i = skeletonStep; i < count - 1; i += skeletonStep) {
    push(i);
  }

  // 第 2 層：二分穿插補齊其餘細節影格
  const midStep = Math.max(1, Math.floor(skeletonStep / 2));
  for (let i = midStep; i < count - 1; i += midStep) {
    push(i);
  }
  for (let i = 1; i < count - 1; i += 1) {
    push(i);
  }
  return order;
}

export function findNearestLoadedSlot(frames, targetSlot) {
  if (!Array.isArray(frames) || frames.length === 0) return -1;
  if (frames[targetSlot]) return targetSlot;
  for (let dist = 1; dist < frames.length; dist += 1) {
    if (targetSlot - dist >= 0 && frames[targetSlot - dist]) return targetSlot - dist;
    if (targetSlot + dist < frames.length && frames[targetSlot + dist]) return targetSlot + dist;
  }
  return -1;
}
