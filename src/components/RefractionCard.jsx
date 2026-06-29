import React, { useRef } from 'react';

export default function RefractionCard({ children, className = '', variant = 'glass', ...props }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const borderClass = variant === 'glass' ? 'glass-prism-border' : 'prism-border';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`${borderClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
