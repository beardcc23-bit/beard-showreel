import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CanvasSequence({ onPlayVideo }) {
  const canvasRef = useRef(null);
  const currentFrameRef = useRef(0);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 代表第一幀是否載入完成（首頁解鎖）
  const [bgPreloadComplete, setBgPreloadComplete] = useState(false); // 背景其餘影格是否預載完畢
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  const frameCount = 145; // png-0_00000000.png ~ png-0_00000144.png
  const fps = 30;
  const frameInterval = 1000 / fps;

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL;
    const firstFrameSrc = `${basePath}png-0/png-0_00000000.png?v=2`;
    
    const firstImg = new Image();
    firstImg.src = firstFrameSrc;
    
    firstImg.onload = () => {
      // 第一幀載入成功，立即初始化 images 陣列並結束全螢幕 loading
      const initialImages = new Array(frameCount);
      initialImages[0] = firstImg;
      setImages(initialImages);
      setIsLoading(false);
      setLoadProgress(1);
      
      // 接著在背景非同步分批加載剩餘 144 張圖片
      preloadRemainingFrames(initialImages);
    };

    firstImg.onerror = () => {
      // 容錯防卡死
      setIsLoading(false);
      preloadRemainingFrames(new Array(frameCount));
    };

    const preloadRemainingFrames = async (targetArray) => {
      const concurrencyLimit = 4; // 每次併發 4 個請求，防止網路排隊堵塞
      let nextIndex = 1;
      let loadedCount = 1;

      const loadFrame = (index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = `${basePath}png-0/png-0_${String(index).padStart(8, '0')}.png?v=2`;
          img.onload = () => {
            targetArray[index] = img;
            resolve();
          };
          img.onerror = () => {
            resolve(); // 容錯，出錯也 resolve 以便加載繼續
          };
        });
      };

      const worker = async () => {
        while (nextIndex < frameCount) {
          const currentIndex = nextIndex++;
          await loadFrame(currentIndex);
          loadedCount++;
          const progress = Math.round((loadedCount / frameCount) * 100);
          setLoadProgress(progress);
        }
      };

      // 啟動多個並行下載 worker
      const workers = [];
      for (let w = 0; w < concurrencyLimit; w++) {
        workers.push(worker());
      }
      await Promise.all(workers);
      
      // 背景加載完畢，更新全數 images 並開啟播放
      setImages([...targetArray]);
      setBgPreloadComplete(true);
    };
  }, []);

  useEffect(() => {
    if (isLoading || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 設定畫布解析度匹配原始高畫質尺寸 (1504x832)
    canvas.width = 1504;
    canvas.height = 832;

    let animationFrameId;
    let lastFrameTime = performance.now();

    const render = (now) => {
      // 只有在背景預載入完全結束，且 isPlaying 為 true 時，才播放動畫
      if (isPlaying && bgPreloadComplete) {
        const deltaTime = now - lastFrameTime;
        if (deltaTime >= frameInterval) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const img = images[currentFrameRef.current];
          if (img && img.complete) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
          currentFrameRef.current = (currentFrameRef.current + 1) % frameCount;
          lastFrameTime = now - (deltaTime % frameInterval);
        }
      } else {
        // 背景加載中或暫停時，繪製首幀或當前幀，防止畫面空白
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = images[currentFrameRef.current] || images[0];
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
  }, [isLoading, images, isPlaying, bgPreloadComplete]);

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
      {/* 高質感科幻 Preloader (載入第一幀即消失) */}
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
                  strokeDashoffset={0}
                  transition={{ ease: 'easeInOut' }}
                />
              </svg>
              {/* 內圈呼吸燈 */}
              <div className="w-20 h-20 rounded-full bg-bg-mist flex items-center justify-center animate-pulse border border-aurora-blue/20">
                <span className="mono text-xs font-black text-white">SYNC</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <span className="mono text-[10px] tracking-[0.4em] text-aurora-blue uppercase animate-pulse">
                INITIALIZING VISUAL MATRIX
              </span>
              <p className="text-[10px] text-zinc-500 mono mt-2 uppercase tracking-widest">
                FPS: 30 // CHUNKED PRELOAD ACTIVE // REGISTRY: OPTIMAL
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
        className={`w-[1000px] max-w-[90vw] aspect-video bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-sm relative overflow-hidden border border-zinc-800 ${
          isLoading ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <div className="w-full h-full overflow-hidden relative">
          <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
          <div className="glow-border" />
        </div>

        {/* 置中獨立感應區 */}
        {!isLoading && (
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onPlayVideo('s6s2p87fPdA')}
            className="absolute inset-0 m-auto w-[260px] h-[160px] z-20 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
          >
            {/* 播放按鈕與提示字 */}
            <div className="relative z-10 flex flex-col items-center pointer-events-none">
              <div className={`w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-300 transform ${
                showOverlay ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-white ml-1"
                >
                  <path d="M8 5.14v14c0 .86.94 1.36 1.66.88l10-7a1 1 0 000-1.76l-10-7A1 1 0 008 5.14z" />
                </svg>
              </div>

              <span className={`mono text-[9px] text-white uppercase tracking-[0.3em] mt-4 font-black transition-all duration-300 ${
                showOverlay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              }`}>
                Click to View Full Reel
              </span>
            </div>
          </div>
        )}

        {/* 右上角極微型背景加載進度指示器（精緻細節，當加載完畢後淡出消失） */}
        {!bgPreloadComplete && !isLoading && (
          <div className="absolute top-4 right-4 mono text-[6px] text-aurora-blue opacity-50 select-none pointer-events-none uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <span className="w-1 h-1 rounded-full bg-aurora-blue animate-ping" />
            Caching Matrix: {loadProgress}%
          </div>
        )}
      </motion.div>
    </div>
  );
}
