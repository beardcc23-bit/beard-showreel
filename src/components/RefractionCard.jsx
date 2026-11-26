import React, { useRef, useEffect } from 'react';

const isReducedTransparency = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.('(prefers-reduced-transparency: reduce)')?.matches);

export default function RefractionCard({ as: Component = 'div', children, className = '', ...props }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const rectRef = useRef(null);
  const scrollYRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePointerEnter = (e) => {
    if (e.pointerType === 'touch' || !cardRef.current || isReducedTransparency()) return;
    rectRef.current = cardRef.current.getBoundingClientRect();
    scrollYRef.current = window.scrollY;
  };

  const handlePointerMove = (e) => {
    if (
      e.pointerType === 'touch' ||
      !cardRef.current ||
      document.body.classList.contains('is-scrolling') ||
      isReducedTransparency()
    ) {
      return;
    }
    pointerRef.current.x = e.clientX;
    pointerRef.current.y = e.clientY;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        if (!rectRef.current || scrollYRef.current !== window.scrollY) {
          rectRef.current = cardRef.current.getBoundingClientRect();
          scrollYRef.current = window.scrollY;
        }
        const rect = rectRef.current;
        cardRef.current.style.setProperty('--mouse-x', `${pointerRef.current.x - rect.left}px`);
        cardRef.current.style.setProperty('--mouse-y', `${pointerRef.current.y - rect.top}px`);
      }
      rafRef.current = null;
    });
  };

  const handlePointerLeave = () => {
    rectRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cardRef.current?.style.setProperty('--mouse-x', '-400px');
    cardRef.current?.style.setProperty('--mouse-y', '-400px');
  };

  return (
    <Component
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`optical-surface ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
