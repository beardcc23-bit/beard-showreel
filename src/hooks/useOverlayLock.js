import { useEffect, useRef } from 'react';

let lockCount = 0;
const escapeStack = [];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isFocusableVisible(el, root) {
  let cur = el;
  while (cur && cur !== root) {
    if (cur.hidden || cur.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle(cur);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    cur = cur.parentElement;
  }
  return true;
}

/**
 * 統一管理彈窗與側邊選單的背景滾動鎖定、捲軸補償（含 fixed 導覽列）、Lenis 暫停、Escape 堆疊關閉與無障礙焦點陷阱
 */
export function useOverlayLock(
  isOpen,
  onClose,
  { containerRef = null, restoreFocus = true, initialFocusSelector = null } = {}
) {
  const onCloseRef = useRef(onClose);
  const initialFocusSelectorRef = useRef(initialFocusSelector);
  onCloseRef.current = onClose;
  initialFocusSelectorRef.current = initialFocusSelector;

  useEffect(() => {
    if (!isOpen) return;

    const previousFocused = typeof document !== 'undefined' ? document.activeElement : null;

    if (lockCount === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.documentElement.style.setProperty('--scrollbar-comp', `${scrollbarWidth}px`);
      }
      // 對尚未標記 inert 的背景主區段與頂部導覽列掛載原生 inert，並以 data-overlay-inert 區分避免解鎖時誤拆外部既有標記
      document.querySelectorAll('nav, main, footer').forEach((el) => {
        if (!el.hasAttribute('inert')) {
          el.setAttribute('inert', '');
          el.setAttribute('data-overlay-inert', 'true');
        }
      });
      window.lenis?.stop();
    }
    lockCount += 1;

    const closeHandler = () => onCloseRef.current?.();
    escapeStack.push(closeHandler);

    // 將初始焦點優先移入指定的業務首欄（如表單輸入框），未指定時退回第一個可聚焦元素，避免鍵盤焦點留在背景層
    const focusFrameId = requestAnimationFrame(() => {
      const container = containerRef?.current;
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const preferred = initialFocusSelectorRef.current
        ? container.querySelector(initialFocusSelectorRef.current)
        : null;
      const target =
        preferred && isFocusableVisible(preferred, container)
          ? preferred
          : container.querySelector(FOCUSABLE_SELECTOR);
      target?.focus?.({ preventScroll: true });
    });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // 僅由最上層開啟的彈窗響應 Escape（LIFO 堆疊順序）
        if (escapeStack[escapeStack.length - 1] === closeHandler) {
          e.stopPropagation();
          closeHandler();
        }
        return;
      }

      if (e.key === 'Tab' && containerRef?.current) {
        // 僅在最上層彈窗執行焦點循環限制
        if (escapeStack[escapeStack.length - 1] !== closeHandler) return;
        const focusables = Array.from(
          containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
        ).filter((el) => isFocusableVisible(el, containerRef.current));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !containerRef.current.contains(active)) {
            e.preventDefault();
            last.focus({ preventScroll: true });
          }
        } else if (active === last || !containerRef.current.contains(active)) {
          e.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrameId);
      window.removeEventListener('keydown', handleKeyDown);

      const idx = escapeStack.lastIndexOf(closeHandler);
      if (idx !== -1) escapeStack.splice(idx, 1);

      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.removeProperty('--scrollbar-comp');
        document.body.classList.remove('modal-open');
        document
          .querySelectorAll('[data-overlay-inert="true"]')
          .forEach((el) => {
            el.removeAttribute('inert');
            el.removeAttribute('data-overlay-inert');
          });
        window.lenis?.start();
      }

      if (
        restoreFocus &&
        previousFocused &&
        typeof previousFocused.focus === 'function' &&
        document.contains(previousFocused)
      ) {
        previousFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen, containerRef, restoreFocus]);
}
