import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CanvasSequence({ onPlayVideo }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  const frameCount = 181; // 000.png ~ 180.png
  const fps = 30;
  const frameInterval = 1000 / fps;

  useEffect(() => {
    // 預載入圖片序列
    let loadedCount = 0;
    const loadedImages = [];

    const handleImageLoad = () => {
      loadedCount++;
      const progress = Math.round((loadedCount / frameCount) * 100);
      setLoadProgress(progress);
      if (loadedCount === frameCount) {
        setImages(loadedImages);
        setIsLoading(false);
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const basePath = import.meta.env.BASE_URL;
      img.src = `${basePath}jpg/showreel00108${String(i).padStart(3, '0')}.jpg`;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad; // 容錯防卡死
      loadedImages.push(img);
    }
  }, []);

  useEffect(() => {
    if (isLoading || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 設定畫布解析度 (1000x563)
    canvas.width = 1000;
    canvas.height = 563;

    let animationFrameId;
    let currentFrame = 0;
    let lastFrameTime = performance.now();

    const render = (now) => {
      if (isPlaying) {
        const deltaTime = now - lastFrameTime;
        if (deltaTime >= frameInterval) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const img = images[currentFrame];
          if (img && img.complete) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          currentFrame = (currentFrame + 1) % frameCount;
          lastFrameTime = now - (deltaTime % frameInterval);
        }
      } else {
        // 暫停時繪製當前畫面，避免空白
        const img = images[currentFrame];
        if (img && img.complete) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoading, images, isPlaying]);

  const handleMouseEnter = () => {
    setIsPlaying(false);
    setShowOverlay(true);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
    setShowOverlay(false);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      {/* 高質感科幻 Preloader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="preloader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-bg-core pointer-events-auto"
          >
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* 外圈旋轉動畫 */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="50"
                  className="stroke-zinc-800"
                  strokeWidth="2"
                  fill="transparent"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="50"
                  className="stroke-aurora-blue"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * loadProgress) / 100}
                  transition={{ ease: 'easeInOut' }}
                />
              </svg>
              {/* 內圈呼吸燈 */}
              <div className="w-20 h-20 rounded-full bg-bg-mist flex items-center justify-center animate-pulse border border-aurora-blue/20">
                <span className="mono text-xs font-black text-white">{loadProgress}%</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <span className="mono text-[10px] tracking-[0.4em] text-aurora-blue uppercase animate-pulse">
                INITIALIZING VISUAL MATRIX
              </span>
              <p className="text-[10px] text-zinc-500 mono mt-2 uppercase tracking-widest">
                FPS: 30 // FRAME_COUNT: {frameCount} // REGISTRY: OPTIMAL
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 圖片序列 Canvas 主體 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          scale: isLoading ? 0.95 : 1 
        }}
        transition={{ duration: 1, ease: 'easeOut' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`w-[1000px] max-w-[90vw] aspect-video bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-sm relative cursor-pointer overflow-hidden border border-zinc-800 ${
          isLoading ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <div className="w-full h-full overflow-hidden relative">
          <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
          <div className="glow-border" />
        </div>

        {/* Hover 顯示 Youtube Overlay */}
        <AnimatePresence>
          {!isLoading && showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => onPlayVideo('s6s2p87fPdA')}
              className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.8, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 10 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center shadow-lg transition-transform duration-300 transform hover:scale-110">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-10 h-10 text-white ml-1"
                  >
                    <path d="M8 5.14v14c0 .86.94 1.36 1.66.88l10-7a1 1 0 000-1.76l-10-7A1 1 0 008 5.14z" />
                  </svg>
                </div>
                <span className="mono text-[10px] text-white uppercase tracking-[0.3em] mt-5 font-black drop-shadow-md">
                  Click to View Full Reel
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
