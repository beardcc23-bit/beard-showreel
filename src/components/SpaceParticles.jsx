import React, { useEffect, useRef } from 'react';

export default function SpaceParticles() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 裝置特性偵測 (手機減量，且停用滑鼠互動)
    const isMobile = window.innerWidth < 768 || 
                    ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0);
    const particleCount = isMobile ? 35 : 90;
    const forceRadius = 130; // 滑鼠力場半徑

    // 初始化粒子數據
    const initParticles = () => {
      const arr = [];
      for (let i = 0; i < particleCount; i++) {
        arr.push({
          // 初始 X, Y 位置
          x: Math.random() * width,
          y: Math.random() * height,
          // 原始基礎位置軌跡 (用來做斥力偏移後的 lerp 還原)
          baseX: 0,
          baseY: 0,
          // 粒子半徑（0.5 到 2.0 像素，製造深淺視差）
          size: Math.random() * 1.5 + 0.5,
          // 基礎漂浮速度
          vx: (Math.random() - 0.5) * 0.15,
          vy: -(Math.random() * 0.2 + 0.05), // 主要是向上緩慢漂浮
          // 亮度呼吸效果速度
          alphaSpeed: Math.random() * 0.02 + 0.005,
          alpha: Math.random(),
          // 暫時的物理偏移量 (lerp 用)
          offsetX: 0,
          offsetY: 0,
        });
      }
      particlesRef.current = arr;
    };

    initParticles();

    // 視窗 resize 處理
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    // 滑鼠與觸控事件監聽 (僅電腦端啟動滑鼠物理引力斥力)
    const handleMouseMove = (e) => {
      if (isMobile) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // 渲染循環 (由 GPU 幀同步驅動)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        // 1. 物理基礎漂移運動
        p.x += p.vx;
        p.y += p.vy;

        // 2. 超出畫布邊界時 Wrap-around（從另一側重新進入）
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // 3. 滑鼠交互物理計算 (斥力風阻效果)
        if (mouseRef.current.active && !isMobile) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < forceRadius) {
            // 距離越近，推力越強 (力場反比)
            const force = (forceRadius - distance) / forceRadius;
            const angle = Math.atan2(dy, dx);
            
            // 計算目標斥力偏移
            const targetOffsetX = Math.cos(angle) * force * 35;
            const targetOffsetY = Math.sin(angle) * force * 35;

            // 平滑 Lerp 到斥力偏移位置 (風阻感)
            p.offsetX += (targetOffsetX - p.offsetX) * 0.1;
            p.offsetY += (targetOffsetY - p.offsetY) * 0.1;
          } else {
            // 超出力場後，粒子平滑 lerp 游回原漂移軌跡
            p.offsetX += (0 - p.offsetX) * 0.05;
            p.offsetY += (0 - p.offsetY) * 0.05;
          }
        } else {
          // 沒有滑鼠交互時，物理偏移漸弱歸零
          p.offsetX += (0 - p.offsetX) * 0.05;
          p.offsetY += (0 - p.offsetY) * 0.05;
        }

        // 4. 計算粒子最終渲染位置 (基礎位置 + 物理偏移)
        const renderX = p.x + p.offsetX;
        const renderY = p.y + p.offsetY;

        // 5. 亮度的微弱呼吸閃爍 (微弱脈動)
        p.alpha += p.alphaSpeed;
        if (p.alpha > 1 || p.alpha < 0.1) {
          p.alphaSpeed = -p.alphaSpeed;
        }
        // 限制亮度區間在 0.1 ~ 0.65，使背景點綴優雅而不刺眼
        const alpha = Math.max(0.1, Math.min(0.65, p.alpha));

        // 6. 繪製微粒
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        // 使用亮金與白色色調微粒
        ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.85})`;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0; // 重置防止效能降低
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full overflow-hidden"
      style={{
        zIndex: 0, // 置於星空底層之上，UI 元件之下
        mixBlendMode: 'screen',
      }}
    />
  );
}
