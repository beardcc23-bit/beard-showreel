import React, { useRef, useEffect } from 'react';

const hoverNoneQuery =
  typeof window !== 'undefined' ? window.matchMedia?.('(hover: none)') : null;

export default function RefractionCard({ children, className = '', ...props }) {
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

  const handleMouseEnter = () => {
    if (hoverNoneQuery?.matches || !cardRef.current) return;
    rectRef.current = cardRef.current.getBoundingClientRect();
    scrollYRef.current = window.scrollY;
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current || hoverNoneQuery?.matches) return;
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

  const handleMouseLeave = () => {
    rectRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    cardRef.current?.style.setProperty('--mouse-x', '-400px');
    cardRef.current?.style.setProperty('--mouse-y', '-400px');
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`optical-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
