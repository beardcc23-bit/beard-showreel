import { useEffect, useRef } from 'react';

let lockCount = 0;
const escapeStack = [];

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 統一管理彈窗與側邊選單的背景滾動鎖定、捲軸補償（含 fixed 導覽列）、Lenis 暫停、Escape 堆疊關閉與無障礙焦點陷阱
 */
export function useOverlayLock(
  isOpen,
  onClose,
  { containerRef = null, restoreFocus = true } = {}
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
      // 對背景主區段與頂部導覽列標記原生 inert，阻斷鍵盤與行動螢幕閱讀器穿透背景內容
      document.querySelectorAll('nav, main, footer').forEach((el) => el.setAttribute('inert', ''));
      window.lenis?.stop();
    }
    lockCount += 1;

    const closeHandler = () => onCloseRef.current?.();
    escapeStack.push(closeHandler);

    // 將初始焦點移入彈窗內第一個可聚焦元素，避免鍵盤焦點留在背景層
    const focusFrameId = requestAnimationFrame(() => {
      const container = containerRef?.current;
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const firstFocusable = container.querySelector(FOCUSABLE_SELECTOR);
      firstFocusable?.focus?.({ preventScroll: true });
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
        ).filter((el) => {
          if (el.closest('[aria-hidden="true"]')) return false;
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        });

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
          .querySelectorAll('nav, main, footer')
          .forEach((el) => el.removeAttribute('inert'));
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
