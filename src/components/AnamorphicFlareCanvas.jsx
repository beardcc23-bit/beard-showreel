import React, { useEffect, useRef, useState } from 'react';

export default function AnamorphicFlareCanvas() {
  const canvasRef = useRef(null);
  const mouseTargetRef = useRef({ x: -1000, y: -1000 });
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const flareAlphaRef = useRef(0);
  const isTickingRef = useRef(false);
  const lastMoveTimeRef = useRef(0);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
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

    // 塵埃與大氣懸浮微粒 (Volumetric Dust Particles)
    const particleCount = 35;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // 渲染電影級 Lens Flare 與光束
    const render = (now) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // 滑鼠座標平滑插值 (Lerp Smooth Motion)
      const target = mouseTargetRef.current;
      const current = mousePosRef.current;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      // 計算光暈透明度 (Fade in / Fade out)
      const timeSinceMove = now - lastMoveTimeRef.current;
      if (timeSinceMove < 1200) {
        flareAlphaRef.current += (1.0 - flareAlphaRef.current) * 0.08;
      } else {
        flareAlphaRef.current += (0.0 - flareAlphaRef.current) * 0.05;
      }

      const alpha = flareAlphaRef.current;

      // 1. 繪製流體大氣塵埃粒子 (Volumetric Particles)
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha * 0.35})`;
        ctx.fill();
      });

      if (alpha > 0.01 && current.x > 0 && current.y > 0) {
        const x = current.x;
        const y = current.y;
        const cx = width / 2;
        const cy = height / 2;

        // 2. 電影變形藍色橫向耀斑 (Anamorphic Blue Streak)
        const streakWidth = Math.min(width * 0.85, 900);
        const grad = ctx.createLinearGradient(x - streakWidth / 2, y, x + streakWidth / 2, y);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
        grad.addColorStop(0.2, 'rgba(0, 240, 255, 0.08)');
        grad.addColorStop(0.48, 'rgba(0, 240, 255, 0.45)');
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * alpha})`);
        grad.addColorStop(0.52, 'rgba(0, 240, 255, 0.45)');
        grad.addColorStop(0.8, 'rgba(0, 240, 255, 0.08)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(x - streakWidth / 2, y - 2, streakWidth, 4);

        // 次要輔助微光耀斑 (Secondary Thin Streak)
        const subGrad = ctx.createLinearGradient(x - streakWidth * 0.35, y, x + streakWidth * 0.35, y);
        subGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
        subGrad.addColorStop(0.5, `rgba(212, 175, 55, ${0.4 * alpha})`);
        subGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');

        ctx.fillStyle = subGrad;
        ctx.fillRect(x - streakWidth * 0.35, y - 0.75, streakWidth * 0.7, 1.5);

        // 3. 中心核心光芒與柔暈 (Core Glow)
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 25 * alpha;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 4. 沿對稱視差射線繪製鏡頭次級光斑 (Secondary Anamorphic Lens Ghosts)
        const dx = cx - x;
        const dy = cy - y;

        const ghosts = [
          { factor: 0.5, r: 18, color: 'rgba(0, 240, 255, 0.06)' },
          { factor: 0.2, r: 8, color: 'rgba(212, 175, 55, 0.08)' },
          { factor: -0.3, r: 24, color: 'rgba(0, 240, 255, 0.04)' },
          { factor: -0.65, r: 40, color: 'rgba(212, 175, 55, 0.05)' },
        ];

        ghosts.forEach((g) => {
          const gx = x + dx * g.factor;
          const gy = y + dy * g.factor;
          ctx.beginPath();
          ctx.arc(gx, gy, g.r * alpha, 0, Math.PI * 2);
          ctx.fillStyle = g.color;
          ctx.fill();
        });
      }

      // 5. 智慧 Stop-Ticking 控制：完全靜止且 alpha < 0.005 時停止迴圈
      if (timeSinceMove > 2000 && alpha < 0.005) {
        isTickingRef.current = false;
        animationFrameId = null;
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const startTicking = (now) => {
      if (!isTickingRef.current) {
        isTickingRef.current = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e) => {
      mouseTargetRef.current = { x: e.clientX, y: e.clientY };
      const now = performance.now();
      lastMoveTimeRef.current = now;
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
      className="fixed inset-0 pointer-events-none z-[99] w-full h-full block"
    />
  );
}
