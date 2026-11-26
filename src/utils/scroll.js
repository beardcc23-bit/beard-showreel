export const LENIS_EASE_OUT_EXPO = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const SCROLL_TRIGGER_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Space',
  ' ',
  'Home',
  'End',
]);

export function isEditableElement(target) {
  if (!target || typeof target !== 'object') return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    Boolean(target.isContentEditable)
  );
}

/**
 * 全站統一平滑捲動工具：優先走全域 Lenis，純觸控行動端／測試環境自動降級至原生 scrollTo 並支援減少動態
 */
export function smoothScrollTo(
  target,
  { offset = 0, duration = 1.05, easing = LENIS_EASE_OUT_EXPO } = {}
) {
  if (typeof window === 'undefined') return;

  const rawTop =
    typeof target === 'number'
      ? target + offset
      : target && typeof target.getBoundingClientRect === 'function'
      ? target.getBoundingClientRect().top + window.scrollY + offset
      : 0;
  const top = Math.max(0, Math.round(rawTop));

  // 若當前捲動座標已停在目標錨點 2px 誤差內，直接早退避免重複啟動 1.05s 捲動計時器
  if (Math.abs(top - window.scrollY) < 2) return;

  if (window.lenis) {
    window.lenis.start();
    const options = { duration, easing };
    if (offset !== 0) options.offset = offset;
    window.lenis.scrollTo(target, options);
    return;
  }

  const prefersReduced = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  window.scrollTo({
    top,
    behavior: prefersReduced ? 'auto' : 'smooth',
  });
}

/**
 * 0ms 無感瞬切定位工具（用於電影級 Dip-to-Black 暗場換頁，消除長距離往回倒拉捲動的暈眩感）
 */
export function instantScrollTo(target, { offset = 0 } = {}) {
  if (typeof window === 'undefined') return;

  if (window.lenis) {
    window.lenis.start();
    const options = { immediate: true };
    if (offset !== 0) options.offset = offset;
    window.lenis.scrollTo(target, options);
    return;
  }

  const rawTop =
    typeof target === 'number'
      ? target + offset
      : target
      ? target.getBoundingClientRect().top + window.scrollY + offset
      : 0;
  const top = Math.max(0, Math.round(rawTop));

  window.scrollTo({
    top,
    behavior: 'auto',
  });
}
