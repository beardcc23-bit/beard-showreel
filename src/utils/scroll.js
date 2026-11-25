export const LENIS_EASE_OUT_EXPO = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * 全站統一平滑捲動工具：優先走全域 Lenis，純觸控行動端／測試環境自動降級至原生 scrollTo 並支援減少動態
 */
export function smoothScrollTo(
  target,
  { offset = 0, duration = 1.05, easing = LENIS_EASE_OUT_EXPO } = {}
) {
  if (typeof window === 'undefined') return;

  if (window.lenis) {
    window.lenis.start();
    const options = { duration, easing };
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
  const prefersReduced = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  window.scrollTo({
    top,
    behavior: prefersReduced ? 'auto' : 'smooth',
  });
}
