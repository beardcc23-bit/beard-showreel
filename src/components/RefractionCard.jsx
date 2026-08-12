import React, { useRef, useEffect } from 'react';

export default function RefractionCard({ children, className = '', variant = 'glass', ...props }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        cardRef.current.style.setProperty('--mouse-x', `${clientX - rect.left}px`);
        cardRef.current.style.setProperty('--mouse-y', `${clientY - rect.top}px`);
      }
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const borderClass = variant === 'glass' ? 'glass-prism-border' : 'prism-border';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${borderClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
