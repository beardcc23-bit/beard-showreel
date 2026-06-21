import React, { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);
  const [isMobile, setIsMobile] = useState(true);

  // 在 ref 中緩存滑鼠與 hover 狀態，避免頻繁更新 React state 導致重複 render
  const mouseCoords = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

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

    // 使用 requestAnimationFrame 同步瀏覽器重繪幀率，完全由 GPU/Ref 驅動
    const updateCursorPosition = () => {
      if (glowRef.current && dotRef.current) {
        const { x, y } = mouseCoords.current;
        // 使用 translate3d 啟用 GPU 硬體加速，避開 Reflow/Layout，直接進行 Composite 渲染
        glowRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1)`;
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
        if (!isHoveredRef.current) {
          isHoveredRef.current = true;
          if (glowRef.current) {
            glowRef.current.classList.add('is-hovered');
          }
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target) return;
      
      const relatedTarget = e.relatedTarget;
      
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.tech-card') ||
        target.closest('.glow-title') ||
        target.closest('[role="button"]') ||
        target.closest('.group')
      ) {
        // 判斷滑鼠是否真的移出所有可 hover 區塊
        const isStillHovered = relatedTarget && (
          relatedTarget.closest('a') ||
          relatedTarget.closest('button') ||
          relatedTarget.closest('.tech-card') ||
          relatedTarget.closest('.glow-title') ||
          relatedTarget.closest('[role="button"]') ||
          relatedTarget.closest('.group')
        );
        
        if (!isStillHovered) {
          isHoveredRef.current = false;
          if (glowRef.current) {
            glowRef.current.classList.remove('is-hovered');
          }
        }
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
        className="cursor-glow-element"
      />
      {/* 游標核心同心圓環 (45度開口反向旋轉) */}
      <div
        ref={dotRef}
        id="cursor-dot"
        className="fixed top-0 left-0 pointer-events-none z-[101] will-change-transform flex items-center justify-center"
        style={{
          width: '32px',
          height: '32px',
          transform: 'translate3d(0,0,0) translate(-50%, -50%) scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" className="overflow-visible">
          {/* 外環 (45度開口，半徑 12) */}
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeLinecap="round"
            className="cursor-ring-outer"
            strokeDasharray="66 10"
          />
          {/* 內環 (45度開口，半徑 7) */}
          <circle
            cx="16"
            cy="16"
            r="7"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeOpacity="0.85"
            strokeLinecap="round"
            className="cursor-ring-inner"
            strokeDasharray="38 6"
          />
        </svg>
      </div>
    </>
  );
}
