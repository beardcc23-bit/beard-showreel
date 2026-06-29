import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Zap, Award } from 'lucide-react';

export default function Modal({ isOpen, onClose, type, data }) {
  // 當 Modal 開啟時，禁止背景 scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
        {/* 遮罩層 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
        />

        {/* 彈窗內容本體 */}
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative w-full bg-bg-core border border-zinc-800 rounded-lg overflow-hidden shadow-2xl z-10 flex flex-col max-h-[95vh] transition-all duration-300 ${
            type === 'video' && data.aspect === 'portrait'
              ? 'max-w-[45vh] md:max-w-[50vh]'
              : type === 'video' && data.aspect === 'square'
              ? 'max-w-[70vh] md:max-w-[75vh]'
              : 'max-w-4xl'
          }`}
        >
          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:text-aurora-blue transition duration-300 border border-zinc-800"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {type === 'video' ? (
            /* 影片播放模式 */
            <div className={`bg-black mx-auto overflow-hidden w-full ${
              data.aspect === 'portrait'
                ? 'aspect-[9/16] h-[80vh]'
                : data.aspect === 'square'
                ? 'aspect-square h-[70vh] md:h-[75vh]'
                : 'aspect-video'
            }`}>
               {data.isFacebook ? (
                <iframe
                  src={data.videoUrl 
                    ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(data.videoUrl)}&show_text=0&t=0&autoplay=1`
                    : `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${data.videoId}&show_text=0&t=0&autoplay=1`}
                  title="Facebook Video Player"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${data.videoId}?autoplay=1`}
                  title="YouTube Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              )}
            </div>
          ) : (
            /* Case Study 專案模式 */
            <div className="overflow-y-auto flex-1">
              {/* 頂部視覺區 */}
              <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gradient-to-br from-bg-mist to-bg-core flex items-center justify-center border-b border-zinc-800/80">
                {/* 電影感網格與光暈背景 */}
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-core via-transparent to-transparent z-10" />
                <div
                  className="absolute w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-20 pointer-events-none animate-pulse"
                  style={{
                    background: `radial-gradient(circle, var(--color-aurora-blue) 0%, var(--color-soft-magenta) 100%)`,
                  }}
                />
                
                {/* 裝飾文字 */}
                <div className="absolute top-6 left-8 mono text-[10px] text-zinc-500 uppercase tracking-[0.4em] z-20">
                  SYSTEM_DUMP // CASE_STUDY_{data.id}
                </div>
                
                <div className="relative z-20 text-center px-6">
                  <span className="mono text-[10px] text-aurora-blue uppercase tracking-widest font-black block mb-3">
                    // {data.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                    {data.title}
                  </h2>
                </div>
              </div>

              {/* 內文區 */}
              <div className="p-8 md:p-12 grid md:grid-cols-3 gap-8 md:gap-12">
                {/* 左側邊欄：屬性與標籤 */}
                <div className="space-y-6 md:border-r md:border-zinc-800 md:pr-8">
                  <div>
                    <h3 className="mono text-[10px] text-zinc-500 uppercase tracking-widest mb-2">// Project Meta</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">屬性</span>
                        <span className="text-white font-medium">{data.category}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">版本</span>
                        <span className="text-aurora-blue font-bold mono">v.2.0</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">精密級</span>
                        <span className="text-dawn-gold font-bold mono">Pixel-Perfect</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">// Core Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-3 py-1 bg-bg-mist text-zinc-300 font-bold uppercase tracking-widest border border-zinc-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右側：專案挑戰與解決方案 */}
                <div className="md:col-span-2 space-y-8">
                  {/* Problem */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Cpu size={16} className="text-soft-magenta" />
                      <h4 className="mono text-xs uppercase tracking-widest text-soft-magenta font-black">
                        01 // The Challenge (挑戰痛點)
                      </h4>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light pl-7">
                      {data.problem}
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className="text-aurora-blue" />
                      <h4 className="mono text-xs uppercase tracking-widest text-aurora-blue font-black">
                        02 // The Solution (解決方案)
                      </h4>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-light pl-7">
                      {data.solution}
                    </p>
                  </div>

                  {/* Impact */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Award size={16} className="text-prism-green" />
                      <h4 className="mono text-xs uppercase tracking-widest text-prism-green font-black">
                        03 // The Impact (具體成效)
                      </h4>
                    </div>
                    <div className="pl-7">
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-sm">
                        <p className="text-sm text-zinc-300 leading-relaxed font-light">
                          {data.impact || '透過視覺層級的最佳化與微交互引導，將資訊加載感知降低 30%，並在使用者滿意度測試中獲得 95% 以上的極高反饋，完美平衡了「極簡美學」與「高效率互動」的訴求。'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
