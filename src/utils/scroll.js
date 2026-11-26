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

function resolveScrollTop(target, offset = 0) {
  const rawTop =
    typeof target === 'number'
      ? target + offset
      : target && typeof target.getBoundingClientRect === 'function'
      ? target.getBoundingClientRect().top + window.scrollY + offset
      : 0;
  return Math.max(0, Math.round(rawTop));
}

/**
 * 全站統一平滑捲動工具：單次計算目標數值座標並傳入 Lenis，省去二次 getBoundingClientRect 強制重排
 */
export function smoothScrollTo(
  target,
  { offset = 0, duration = 1.05, easing = LENIS_EASE_OUT_EXPO } = {}
) {
  if (typeof window === 'undefined') return;

  const top = resolveScrollTop(target, offset);

  // 若當前捲動座標已停在目標錨點 2px 誤差內，直接早退避免重複啟動 1.05s 捲動計時器
  if (Math.abs(top - window.scrollY) < 2) return;

  if (window.lenis) {
    window.lenis.start();
    window.lenis.scrollTo(top, { duration, easing });
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
 * 0ms 無感瞬切定位工具（用於電影級透明溶解換頁，消除長距離往回倒拉捲動的暈眩感）
 */
export function instantScrollTo(target, { offset = 0 } = {}) {
  if (typeof window === 'undefined') return;

  const top = resolveScrollTop(target, offset);

  if (window.lenis) {
    window.lenis.start();
    window.lenis.scrollTo(top, { immediate: true });
    return;
  }

  window.scrollTo({
    top,
    behavior: 'auto',
  });
}
