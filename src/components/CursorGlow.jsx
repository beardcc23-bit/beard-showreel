import React, { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  // 在 ref 中緩存滑鼠位置，避免 mousemove 時頻繁更新 React state 導致重複 render
  const mouseCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
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

    let animationFrameId = null;

    // 使用 requestAnimationFrame 同步瀏覽器重繪幀率
    const updateCursorPosition = () => {
      if (glowRef.current && dotRef.current) {
        const { x, y } = mouseCoords.current;
        // 使用 translate3d 啟用 GPU 硬體加速，避開 Reflow/Layout，直接進行 Composite 渲染
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      animationFrameId = requestAnimationFrame(updateCursorPosition);
    };

    const handleMouseMove = (e) => {
      mouseCoords.current.x = e.clientX;
      mouseCoords.current.y = e.clientY;
    };

    animationFrameId = requestAnimationFrame(updateCursorPosition);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.tech-card') ||
        target.closest('.glow-title') ||
        target.closest('[role="button"]') ||
        target.closest('.group') // 懸停在卡片上時也觸發放大
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
        target.closest('[role="button"]') ||
        target.closest('.group')
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
      cancelAnimationFrame(animationFrameId);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* 游標外層光暈 */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[100] transition-all duration-300 ease-out will-change-transform"
        style={{
          width: isHovered ? '1000px' : '750px', // 將原本 1620px 縮小至最高 1000px，降低 GPU Fill-rate 繪製負擔
          height: isHovered ? '1000px' : '750px',
          background: isHovered
            ? 'radial-gradient(circle, rgba(62, 161, 220, 0.14) 0%, rgba(196, 132, 165, 0.07) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(62, 161, 220, 0.1) 0%, rgba(196, 132, 165, 0.04) 40%, transparent 70%)',
        }}
      />
      {/* 游標核心中心點 */}
      <div
        ref={dotRef}
        id="cursor-dot"
        className="fixed top-0 left-0 pointer-events-none z-[101] will-change-transform"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#3ea1dc',
          borderRadius: '50%',
          transform: `translate3d(0,0,0) translate(-50%, -50%) scale(${isHovered ? 2.5 : 1})`,
          transition: 'transform 0.15s ease-out',
        }}
      />
    </>
  );
}
