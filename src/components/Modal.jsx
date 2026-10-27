import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, type, data }) {
  const [iframeLoading, setIframeLoading] = React.useState(true);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  const activeDataRef = React.useRef(data);
  const activeTypeRef = React.useRef(type);
  if (data) {
    activeDataRef.current = data;
    activeTypeRef.current = type;
  }
  const currentData = data || activeDataRef.current;
  const currentType = type || activeTypeRef.current;
  const safeVideoId = currentData?.videoId && /^[\w-]+$/.test(String(currentData.videoId)) ? currentData.videoId : '';
  const safeVideoUrl = currentData?.videoUrl && /^https:\/\/((www\.|web\.)?facebook\.com|fb\.watch)\//i.test(String(currentData.videoUrl)) ? currentData.videoUrl : '';
  const hasValidVideoSource = currentType === 'video' && (currentData?.isFacebook ? Boolean(safeVideoUrl || safeVideoId) : Boolean(safeVideoId));

  // 當目標影片變更時重設 iframe 載入狀態
  useEffect(() => {
    if (isOpen && type === 'video') {
      setIframeLoading(true);
    }
  }, [isOpen, type, data?.videoId, data?.videoUrl]);

  // 當 Modal 開啟時，禁止背景 scroll、隱藏自訂游標（避免被 z-[9999] 遮罩壓在底下消失）並且監聽 Escape 按鈕
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      // Lenis 攔截滾輪後以 scrollTo 捲動，body overflow:hidden 擋不住，需明確暫停
      window.lenis?.stop();
      window.dispatchEvent(new CustomEvent('hide-custom-cursor'));

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onCloseRef.current?.();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('modal-open');
        window.lenis?.start();
        window.removeEventListener('keydown', handleKeyDown);
        window.dispatchEvent(new CustomEvent('show-custom-cursor'));
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      {isOpen && currentData && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={currentData.title || "Media Player Modal"}
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
        >
          {/* 遮罩層 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 cursor-pointer"
          />

          {/* 彈窗內容本體 */}
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative w-full bg-bg-core border border-zinc-800 rounded-lg overflow-hidden shadow-2xl z-10 flex flex-col max-h-[95vh] ${
              currentType === 'video' && currentData.aspect === 'portrait'
                ? 'max-w-[45vh] md:max-w-[50vh]'
                : currentType === 'video' && currentData.aspect === 'square'
                ? 'max-w-[70vh] md:max-w-[75vh]'
                : currentType === 'image'
                ? 'max-w-2xl'
                : 'max-w-4xl'
            }`}
          >
            {/* 關閉按鈕：符合 Apple HIG 最小 44x44pt 觸控標準與焦點輪廓 */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-black/60 text-white hover:text-aurora-blue transition duration-300 border border-zinc-800 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-blue"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {currentType === 'video' ? (
              /* 影片播放模式 */
              <div 
                className={`bg-black mx-auto overflow-hidden w-full relative ${
                  currentData.aspect === 'portrait'
                    ? 'aspect-[9/16] h-[80vh]'
                    : currentData.aspect === 'square'
                    ? 'aspect-square h-[70vh] md:h-[75vh]'
                    : 'aspect-video'
                }`}
              >
                 {/* 科技質感載入骨架屏 */}
                 {iframeLoading && hasValidVideoSource && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md z-10">
                     <div className="w-9 h-9 rounded-full border border-aurora-blue/25 border-t-aurora-blue animate-spin mb-4" />
                     <span className="mono text-[11px] text-aurora-blue tracking-[0.25em] uppercase font-semibold animate-pulse">
                       CONNECTING MEDIA NODE...
                     </span>
                   </div>
                 )}
                 {currentData.isFacebook ? (
                  <iframe
                    key={safeVideoUrl || safeVideoId}
                    src={isOpen && (safeVideoUrl || safeVideoId) ? (safeVideoUrl 
                      ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(safeVideoUrl)}&show_text=0&t=0&autoplay=1`
                      : `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${safeVideoId}&show_text=0&t=0&autoplay=1`) : 'about:blank'}
                    title="Facebook Video Player"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => setIframeLoading(false)}
                    className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                  ></iframe>
                ) : (
                  <iframe
                    key={currentData.videoId}
                    src={isOpen && safeVideoId ? `https://www.youtube.com/embed/${safeVideoId}?autoplay=1` : 'about:blank'}
                    title="YouTube Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => setIframeLoading(false)}
                    className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
                  ></iframe>
                )}
              </div>
            ) : (
              /* 單張圖片展示模式 (例如 Flame 節點解密) */
              <div className="p-4 md:p-6 flex flex-col bg-[#121314] rounded-lg">
                <div className="w-full overflow-hidden border border-zinc-900 rounded-sm mb-3.5">
                  <img
                    src={currentData.imageUrl}
                    alt={currentData.title}
                    width="1920"
                    height="902"
                    decoding="async"
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <div className="flex items-center gap-2.5 pl-1 pb-1">
                  <span className="flex gap-[1.5px] h-3 pointer-events-none">
                    <span className="w-[1.5px] h-full bg-aurora-blue" />
                    <span className="w-[1px] h-full bg-aurora-blue/50" />
                  </span>
                  <span className="text-[11px] text-zinc-300 font-bold tracking-wide">
                    {currentData.description}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
