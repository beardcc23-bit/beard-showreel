import React, { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // 檢查是否為行動裝置
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      if (!isMobileDevice) {
        document.body.classList.add('custom-cursor');
      } else {
        document.body.classList.remove('custom-cursor');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      if (glowRef.current && dotRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e) => {
      // 判斷是否懸停在可互動元素上
      const target = e.target;
      if (!target) return;
      
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.tech-card') ||
        target.closest('.glow-title') ||
        target.closest('[role="button"]')
      ) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target) return;
      
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.tech-card') ||
        target.closest('.glow-title') ||
        target.closest('[role="button"]')
      ) {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div
        ref={glowRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
        style={{
          width: isHovered ? '1620px' : '1260px',
          height: isHovered ? '1620px' : '1260px',
          background: isHovered
            ? 'radial-gradient(circle, rgba(62, 161, 220, 0.16) 0%, rgba(196, 132, 165, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(62, 161, 220, 0.12) 0%, rgba(196, 132, 165, 0.05) 40%, transparent 70%)',
        }}
      />
      <div
        ref={dotRef}
        id="cursor-dot"
        className="transition-transform duration-100 ease-out"
        style={{
          transform: `translate(-50%, -50%) scale(${isHovered ? 2.5 : 1})`,
        }}
      />
    </>
  );
}
