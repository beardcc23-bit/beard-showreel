import React, { useEffect, useRef } from 'react';

export default function WaveformScopeCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let isIntersecting = true;
    let width = 0;
    let height = 0;

    // 設定與調整 Canvas 尺寸匹配容器解析度
    const resizeCanvas = () => {
      if (!canvas.parentElement || !ctx) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 視區監控 IntersectionObserver (Stop-Ticking 效能規範)
    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !animationFrameId) {
          lastTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // 滑鼠與觸控事件監聽
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove);
      parent.addEventListener('mouseleave', handleMouseLeave);
    }

    let lastTime = performance.now();
    let time = 0;

    // RGB 波形渲染參數
    const channels = [
      { color: 'rgba(255, 60, 60, 0.45)', blend: 'screen', speedMult: 0.8, freq: 0.012, phase: 0 },
      { color: 'rgba(40, 240, 140, 0.45)', blend: 'screen', speedMult: 1.1, freq: 0.015, phase: 2 },
      { color: 'rgba(0, 240, 255, 0.55)', blend: 'screen', speedMult: 0.95, freq: 0.018, phase: 4 },
      { color: 'rgba(212, 175, 55, 0.35)', blend: 'screen', speedMult: 1.3, freq: 0.022, phase: 1.5 },
    ];

    const render = (now) => {
      if (!isIntersecting) {
        animationFrameId = null;
        return;
      }

      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      time += deltaTime;

      ctx.clearRect(0, 0, width, height);

      // 繪製背景底層微型網格刻度 (Flame Scope Grid)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const stepY = height / 6;
      for (let y = stepY; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const mouse = mouseRef.current;

      // 繪製多通道 RGB 波形線條
      channels.forEach((ch) => {
        ctx.beginPath();
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;

        const centerY = height * 0.5;

        for (let x = 0; x < width; x += 4) {
          // 基礎多重正弦波干涉計算
          let baseAmplitude = 25 * Math.sin(time * 1.5 + x * 0.005);
          let wave =
            Math.sin(x * ch.freq + time * ch.speedMult + ch.phase) * (30 + baseAmplitude) +
            Math.cos(x * 0.005 - time) * 15;

          // 滑鼠靠近時產生引力波形扭曲與振幅加成 (Mouse Attractor)
          if (mouse.active) {
            const dist = Math.abs(x - mouse.x);
            if (dist < 180) {
              const factor = Math.cos((dist / 180) * (Math.PI / 2));
              const mouseOffsetY = (mouse.y - centerY) * 0.25;
              wave += mouseOffsetY * factor + Math.sin(time * 10 + x) * 20 * factor;
            }
          }

          const y = centerY + wave;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      // 繪製滑鼠感應光點脈衝
      if (mouse.active && mouse.x >= 0 && mouse.x <= width) {
        ctx.beginPath();
        ctx.arc(mouse.x, height * 0.5, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove);
        parent.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* 視覺 HUD 標示 */}
      <div className="absolute bottom-3 right-6 mono text-[8px] tracking-[0.25em] text-aurora-blue/40 uppercase select-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-aurora-blue/60 animate-ping" />
        RGB Waveform Scope // Interactive Signal Matrix
      </div>
    </div>
  );
}
