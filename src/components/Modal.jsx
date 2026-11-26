import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from './common/Icons';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { emilSpring } from '../utils/motion';
import {
  isSafeLocalImageUrl,
  getSafeFacebookVideoUrl,
  getSafeExternalUrl,
} from '../utils/url';

export default function Modal({ isOpen, onClose, type, data }) {
  const [iframeLoading, setIframeLoading] = React.useState(true);
  const dialogRef = useRef(null);

  const activeDataRef = useRef(data);
  const activeTypeRef = useRef(type);
  if (data) {
    activeDataRef.current = data;
    activeTypeRef.current = type;
  }
  const currentData = data || activeDataRef.current;
  const currentType = type || activeTypeRef.current;
  const safeVideoId = currentData?.videoId && /^[\w-]+$/.test(String(currentData.videoId)) ? currentData.videoId : '';
  const safeVideoUrl = getSafeFacebookVideoUrl(currentData?.videoUrl);
  const safeImageUrl = isSafeLocalImageUrl(currentData?.imageUrl) ? currentData.imageUrl : '';
  const hasValidVideoSource = currentType === 'video' && (currentData?.isFacebook ? Boolean(safeVideoUrl || safeVideoId) : Boolean(safeVideoId));
  const rawExternalWatchUrl =
    currentType === 'video' && hasValidVideoSource
      ? currentData?.isFacebook
        ? safeVideoUrl || `https://www.facebook.com/watch/?v=${safeVideoId}`
        : `https://www.youtube.com/watch?v=${safeVideoId}`
      : '';
  const safeExternalWatchUrl = getSafeExternalUrl(rawExternalWatchUrl);

  useEffect(() => {
    if (!isOpen || type !== 'video' || !hasValidVideoSource) {
      setIframeLoading(false);
      return undefined;
    }
    setIframeLoading(true);
    // 8 秒載入看門狗：若企業防火牆阻擋外部嵌入插件或 onLoad 延遲，自動揭開遮罩防永久卡死
    const watchdog = setTimeout(() => setIframeLoading(false), 8000);
    return () => clearTimeout(watchdog);
  }, [isOpen, type, hasValidVideoSource, data?.videoId, data?.videoUrl]);

  useOverlayLock(isOpen, onClose, { containerRef: dialogRef });

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence mode="wait">
      {isOpen && currentData && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={currentData.title || 'Media Player Modal'}
          data-lenis-prevent
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
        >
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/92 cursor-pointer"
          />

          <m.div
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            transition={emilSpring.smooth}
            className={`relative w-full bg-[#05070B] border border-white/[0.16] shadow-[0_32px_100px_rgba(0,0,0,0.96),-18px_-14px_64px_rgba(235,74,46,0.12),18px_18px_68px_rgba(18,118,184,0.14)] z-10 flex flex-col max-h-[94dvh] overflow-y-auto overscroll-contain ${
              currentType === 'video' && currentData.aspect === 'portrait'
                ? 'max-w-[45dvh] md:max-w-[50dvh]'
                : currentType === 'video' && currentData.aspect === 'square'
                ? 'max-w-[70dvh] md:max-w-[75dvh]'
                : 'max-w-5xl'
            }`}
          >
            {/* 頂緣光譜細線與獨立暗房審片室頂部控制列（左側顯示當前播放作品標題，右側為獨立關閉鈕防誤觸） */}
            <div
              aria-hidden="true"
              className="h-[2px] w-full shrink-0 spectral-bar-h"
            />

            <div className="flex items-center justify-between pl-4 pr-2.5 py-1.5 bg-[#05070B] border-b border-white/10 shrink-0 gap-3">
              <span className="inline-flex items-center gap-2.5 min-w-0 text-xs font-medium tracking-wider text-zinc-200">
                <span aria-hidden="true" className="w-1.5 h-1.5 bg-spectral-crimson shrink-0 shadow-[0_0_8px_rgba(235,74,46,0.8)]" />
                <span className="truncate">{currentData.title || 'SHOWREEL'}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {safeExternalWatchUrl && (
                  <a
                    href={safeExternalWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="於新分頁開啟原影片"
                    className="min-w-[40px] min-h-[40px] px-2 text-zinc-400 hover:text-title-white transition-colors inline-flex items-center justify-center gap-1 text-[11px] tracking-wider focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                  >
                    <ArrowUpRight size={15} className="text-spectral-crimson" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="min-w-[40px] min-h-[40px] shrink-0 text-zinc-300 hover:text-spectral-crimson transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {currentType === 'video' ? (
              <div
                className={`bg-black mx-auto overflow-hidden w-full relative ${
                  currentData.aspect === 'portrait'
                    ? 'aspect-[9/16] h-[80dvh]'
                    : currentData.aspect === 'square'
                    ? 'aspect-square h-[70dvh] md:h-[75dvh]'
                    : 'aspect-video'
                }`}
              >
                {iframeLoading && hasValidVideoSource && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05070B] z-0 pointer-events-none">
                    <div className="w-10 h-[1.5px] bg-white/15 overflow-hidden relative mb-4">
                      <div className="absolute inset-y-0 left-0 w-1/2 bg-spectral-crimson animate-pulse" />
                    </div>
                    <span className="mono text-[10px] text-zinc-400 tracking-[0.28em] uppercase">
                      LOADING STREAM
                    </span>
                  </div>
                )}
                {currentData.isFacebook ? (
                  <iframe
                    key={safeVideoUrl || safeVideoId}
                    src={
                      isOpen && (safeVideoUrl || safeVideoId)
                        ? safeVideoUrl
                          ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(safeVideoUrl)}&show_text=0&t=0&autoplay=1`
                          : `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${safeVideoId}&show_text=0&t=0&autoplay=1`
                        : 'about:blank'
                    }
                    title="Facebook Video Player"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={isOpen && hasValidVideoSource ? () => setIframeLoading(false) : undefined}
                    className="relative z-10 w-full h-full border-0"
                  />
                ) : (
                  <iframe
                    key={currentData.videoId}
                    src={
                      isOpen && safeVideoId
                        ? `https://www.youtube.com/embed/${safeVideoId}?autoplay=1&rel=0&playsinline=1`
                        : 'about:blank'
                    }
                    title="YouTube Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={isOpen && hasValidVideoSource ? () => setIframeLoading(false) : undefined}
                    className="relative z-10 w-full h-full border-0"
                  />
                )}
              </div>
            ) : (
              /* 圖片模式：固定 1920:902 比例防開窗瞬間高度塌陷跳動，無裁切完整展示 Flame Batch 節點樹 */
              <div className="p-4 md:p-6 flex flex-col bg-[#05070B]">
                <div className="w-full aspect-[1920/902] max-h-[78dvh] overflow-hidden border border-white/10 mb-3.5 bg-black flex items-center justify-center">
                  {safeImageUrl && (
                    <img
                      src={safeImageUrl}
                      alt={currentData.title}
                      width="1920"
                      height="902"
                      decoding="async"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex items-center text-xs text-zinc-300 tracking-wide">
                  <span className="flex items-center gap-2.5">
                    <span className="w-2 h-2 bg-spectral-crimson" />
                    <span>{currentData.description}</span>
                  </span>
                </div>
              </div>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
