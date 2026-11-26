import React, { useState, useRef } from 'react';
import { LazyMotion, MotionConfig, domMax } from 'framer-motion';
import Navigation from './components/Navigation';
import OpticalLightField from './components/OpticalLightField';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Manifesto from './components/Manifesto';
import VisualSynthesis from './components/VisualSynthesis';
import Contact from './components/Contact';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useLenisScroll } from './hooks/useLenisScroll';
import { APP_EVENTS } from './constants/siteConfig';
import { isSafeLocalImageUrl } from './utils/url';

const loadModal = () => import('./components/Modal');
const Modal = React.lazy(loadModal);

export default function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });
  const [hasModalMounted, setHasModalMounted] = useState(false);
  const hasPreloadedModalRef = useRef(false);

  useLenisScroll();

  React.useEffect(() => {
    const handleOpenImage = (e) => {
      if (!e?.detail || typeof e.detail.imageUrl !== 'string') return;
      const { imageUrl, title, description } = e.detail;
      if (!isSafeLocalImageUrl(imageUrl)) return;
      setHasModalMounted(true);
      setModalState({
        isOpen: true,
        type: 'image',
        data: { imageUrl, title, description },
      });
    };
    window.addEventListener(APP_EVENTS.OPEN_IMAGE_MODAL, handleOpenImage);
    return () => window.removeEventListener(APP_EVENTS.OPEN_IMAGE_MODAL, handleOpenImage);
  }, []);

  const handleOpenVideoModal = React.useCallback(
    (videoId, isFacebook = false, aspect = 'video', videoUrl = null, title = 'SHOWREEL') => {
      setHasModalMounted(true);
      setModalState({
        isOpen: true,
        type: 'video',
        data: { videoId, isFacebook, aspect, videoUrl, title },
      });
    },
    []
  );

  const handleCloseModal = React.useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    });
  }, []);

  const handlePageLoaded = React.useCallback(() => {
    if (hasPreloadedModalRef.current) return;
    hasPreloadedModalRef.current = true;
    // 首屏就緒後利用瀏覽器閒置期預熱 Modal chunk，確保首次點擊播放影片 0ms 秒開且不觸發全站重繪
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => loadModal(), { timeout: 1500 });
      } else {
        setTimeout(() => loadModal(), 600);
      }
    }
  }, []);

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen text-title-white selection:bg-spectral-crimson selection:text-white overflow-x-clip">
          {/* 全程深淵黑底 × 左側慢速流動光譜引擎 */}
          <OpticalLightField />

          {/* 頂部與行動側邊導覽列 */}
          <Navigation />

          {/* 主頁面五幕式區段 */}
          <main className="relative z-10">
            <Hero
              isModalOpen={modalState.isOpen}
              onLoaded={handlePageLoaded}
            />
            <Introduction onPlayVideo={handleOpenVideoModal} />
            <Manifesto onPlayVideo={handleOpenVideoModal} />
            <VisualSynthesis onPlayVideo={handleOpenVideoModal} />
            <Contact />
          </main>

          {/* 極簡電影後期室落款頁尾 */}
          <footer className="relative z-10 border-t border-white/[0.08] py-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-start text-xs tracking-wider text-zinc-500">
              <span>&copy; 2026 Beard Chou</span>
            </div>
          </footer>

          {/* 全域互動彈窗（首次觸發前不掛載 Portal 樹，並包覆 Chunk 錯誤邊界） */}
          {hasModalMounted && (
            <ErrorBoundary minimal>
              <React.Suspense fallback={null}>
                <Modal
                  isOpen={modalState.isOpen}
                  onClose={handleCloseModal}
                  type={modalState.type}
                  data={modalState.data}
                />
              </React.Suspense>
            </ErrorBoundary>
          )}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
