import React, { useEffect, useRef, useState } from 'react';

export default function TrackingHudCanvas() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const isTickingRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // 檢查是否為行動裝置
    const checkMobile = () => {
      const mobileDevice =
        window.innerWidth < 768 ||
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0;
      setIsMobile(mobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 時間碼計算器 (Flame Timecode Simulator)
    const getTimecode = (now) => {
      const totalFrames = Math.floor((now / 1000) * 30);
      const ff = String(totalFrames % 30).padStart(2, '0');
      const ss = String(Math.floor(totalFrames / 30) % 60).padStart(2, '0');
      const mm = String(Math.floor(totalFrames / 1800) % 60).padStart(2, '0');
      const hh = String(Math.floor(totalFrames / 108000) % 24).padStart(2, '0');
      return `${hh}:${mm}:${ss}:${ff}`;
    };

    // 繪製與更新迴圈
    const render = (now) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const points = pointsRef.current;
      const mouse = mouseRef.current;

      // 1. 繪製動態運動向量網格 (Motion Vector Network)
      ctx.lineWidth = 0.75;
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        p1.alpha -= 0.025; // 點生命值淡出

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * Math.min(p1.alpha, p2.alpha) * 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${lineAlpha})`; // Dawn Gold 金色向量線
            ctx.stroke();
          }
        }
      }

      // 清除生命值告罄的點
      pointsRef.current = points.filter((p) => p.alpha > 0);

      // 2. 繪製歷史軌跡點
      pointsRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.8})`; // Aurora Blue 光學點
        ctx.fill();
      });

      // 3. 當前游標位置繪製 Flame VFX Tracking Crosshair & HUD
      if (mouse.x >= 0 && mouse.y >= 0) {
        const x = mouse.x;
        const y = mouse.y;

        // 瞄準十字角標 (Corner Target Target Box)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 1;
        const boxSize = 12;
        const gap = 4;

        // Top-Left corner
        ctx.beginPath();
        ctx.moveTo(x - boxSize, y - gap);
        ctx.lineTo(x - boxSize, y - boxSize);
        ctx.lineTo(x - gap, y - boxSize);
        ctx.stroke();

        // Bottom-Right corner
        ctx.beginPath();
        ctx.moveTo(x + boxSize, y + gap);
        ctx.lineTo(x + boxSize, y + boxSize);
        ctx.lineTo(x + gap, y + boxSize);
        ctx.stroke();

        // 實時動態時間碼 (Live Timecode Indicator)
        const tc = getTimecode(now);
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
        ctx.fillText(`TC ${tc}`, x + 16, y - 10);

        // 座標資訊 (X, Y)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillText(`TRK [${Math.round(x)}, ${Math.round(y)}]`, x + 16, y + 4);
      }

      // 4. 智慧 Stop-Ticking 效能控制
      // 若超過 1.5 秒無新滑鼠移動且追蹤點完全消失，自動終止迴圈
      const timeSinceLastMove = now - lastMoveTimeRef.current;
      if (timeSinceLastMove > 1500 && pointsRef.current.length === 0) {
        isTickingRef.current = false;
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // 喚醒繪製迴圈 (Start Ticking)
    const startTicking = (now) => {
      if (!isTickingRef.current) {
        isTickingRef.current = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // 滑鼠移動事件監聽
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      mouseRef.current = { x, y };

      const now = performance.now();
      lastMoveTimeRef.current = now;

      // 每隔一段位移加入歷史點
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      if (!lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) > 12) {
        pointsRef.current.push({ x, y, alpha: 1.0 });
        if (pointsRef.current.length > 25) {
          pointsRef.current.shift();
        }
      }

      startTicking(now);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] w-full h-full block"
    />
  );
}
