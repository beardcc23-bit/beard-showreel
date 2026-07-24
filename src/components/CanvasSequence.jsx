import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CanvasSequence({ onPlayVideo, isModalOpen, onLoaded }) {
  const canvasRef = useRef(null);
  const currentFrameRef = useRef(0);
  const loadedImagesRef = useRef([]);
  const isPlayingRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true); // 代表第一幀是否載入完成（首頁解鎖）
  const [bgPreloadComplete, setBgPreloadComplete] = useState(false); // 背景其餘影格是否預載完畢
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  const frameCount = 145; // png-0_00000000.png ~ png-0_00000144.png
  const fps = 30;
  const frameInterval = 1000 / fps;

  // 同步 state 與 ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    let isCancelled = false;
    const isMobile = window.innerWidth < 768;
    const folderName = isMobile ? 'png-0-mobile' : 'png-0';
    const basePath = import.meta.env.BASE_URL;
    const firstFrameSrc = `${basePath}${folderName}/png-0_00000000.webp?v=3`;
    
    // 初始化 ref 陣列長度
    loadedImagesRef.current = new Array(frameCount);
    
    const firstImg = new Image();
    firstImg.src = firstFrameSrc;
    
    firstImg.onload = () => {
      if (isCancelled) return;
      // 第一幀載入成功，立即初始化並結束全螢幕 loading，使首頁解鎖
      loadedImagesRef.current[0] = firstImg;
      setIsLoading(false);
      if (onLoaded) onLoaded();
      setLoadProgress(1);
      
      // 接著在背景非同步分批加載剩餘 144 張圖片
      preloadRemainingFrames(folderName);
    };

    firstImg.onerror = () => {
      if (isCancelled) return;
      // 容錯防卡死
      setIsLoading(false);
      if (onLoaded) onLoaded();
      preloadRemainingFrames(folderName);
    };

    const preloadRemainingFrames = async (activeFolder) => {
      const concurrencyLimit = 4; // 每次併發 4 個請求，防止網路排隊堵塞
      let nextIndex = 1;
      let loadedCount = 1;

      const loadFrame = (index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = `${basePath}${activeFolder}/png-0_${String(index).padStart(8, '0')}.webp?v=3`;
          img.onload = () => {
            loadedImagesRef.current[index] = img;
            resolve();
          };
          img.onerror = () => {
            resolve(); // 容錯，出錯也 resolve 以便加載繼續
          };
        });
      };

      const worker = async () => {
        while (nextIndex < frameCount && !isCancelled) {
          const currentIndex = nextIndex++;
          await loadFrame(currentIndex);
          if (isCancelled) return;
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
      
      if (!isCancelled) {
        setBgPreloadComplete(true);
      }
    };

    return () => {
      isCancelled = true;
      if (loadedImagesRef.current) {
        loadedImagesRef.current.forEach((img, idx) => {
          if (img) {
            img.onload = null;
            img.onerror = null;
            loadedImagesRef.current[idx] = null;
          }
        });
        loadedImagesRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 設定畫布解析度匹配原始高畫質尺寸 (1504x832)
    if (canvas.width !== 1504) canvas.width = 1504;
    if (canvas.height !== 832) canvas.height = 832;

    let animationFrameId;
    let lastFrameTime = performance.now();
    let isIntersecting = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const render = (now) => {
      const drawImageProp = (img) => {
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgRatio;
          drawX = (canvas.width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          drawX = 0;
          drawY = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      };

      // 只要在畫面中 (isIntersecting) 且 Modal 關閉，才繪製
      if (isIntersecting && !isModalOpen) {
        if (isPlayingRef.current) {
          const deltaTime = now - lastFrameTime;
          if (deltaTime >= frameInterval) {
            const img = loadedImagesRef.current[currentFrameRef.current];
            if (img && img.complete) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              drawImageProp(img);
            }
            currentFrameRef.current = (currentFrameRef.current + 1) % frameCount;
            lastFrameTime = now - (deltaTime % frameInterval);
          }
        } else {
          // 當暫停 (isPlaying == false) 時，持續維護當前影格繪製，避免畫面變黑
          const img = loadedImagesRef.current[currentFrameRef.current];
          if (img && img.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawImageProp(img);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoading, isModalOpen]);

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
      {/* 播放器後方 HUD 同心圓旋轉背景（僅在手機版顯示，網頁桌面版隱藏） */}
      {!isLoading && (
        <div className="absolute w-[1300px] h-[1300px] md:w-[1500px] md:h-[1500px] max-w-[140vw] max-h-[140vw] z-0 pointer-events-none flex md:hidden items-center justify-center overflow-visible opacity-50">
          <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-zinc-800/80 animate-[spin_100s_linear_infinite]" />
          <div className="absolute w-[75%] h-[75%] rounded-full border-[1.5px] border-dashed border-dawn-gold/25 animate-[spin_70s_linear_infinite_reverse]" />
          <div className="absolute w-[55%] h-[55%] rounded-full border border-zinc-800/40 animate-[spin_40s_linear_infinite]" />
        </div>
      )}

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
        onClick={() => onPlayVideo('s6s2p87fPdA')}
        className={`w-full md:w-[1000px] md:max-w-[90vw] aspect-[5/4] md:aspect-video bg-black shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-none md:rounded-sm relative overflow-hidden border-y border-zinc-800 md:border md:border-zinc-800 transition-all duration-300 z-10 cursor-pointer ${
          isLoading ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        <div className="w-full h-full overflow-hidden relative">
          <canvas ref={canvasRef} className="w-full h-full block pointer-events-none object-cover" />
          
          {/* Hover 滿版微暗調半透明 Overlay，凸顯 YT 紅色按鈕但不擋住畫格內容 */}
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 pointer-events-none flex flex-col items-center justify-center ${
            showOverlay ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className={`flex flex-col items-center transform transition-all duration-300 ${
              showOverlay ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}>
              {/* YouTube 紅色播放按鈕 */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-500 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 md:w-10 md:h-10 text-white translate-x-[2px]"
                >
                  <path d="M8 5.14v14c0 .86.94 1.36 1.66.88l10-7a1 1 0 000-1.76l-10-7A1 1 0 008 5.14z" />
                </svg>
              </div>

              <span className="mono text-[10px] md:text-xs text-white uppercase tracking-[0.3em] mt-4 font-black drop-shadow-md">
                Click to View Full Reel
              </span>
            </div>
          </div>

          <div className="glow-border pointer-events-none" />
        </div>

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
