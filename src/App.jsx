import React, { useState } from 'react';
import Navigation from './components/Navigation';
import CursorGlow from './components/CursorGlow';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Manifesto from './components/Manifesto';
import VisualSynthesis from './components/VisualSynthesis';
import Contact from './components/Contact';
import { useLenisScroll } from './hooks/useLenisScroll';
import { useParallaxOrbit } from './hooks/useParallaxOrbit';

const Modal = React.lazy(() => import('./components/Modal'));

export default function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'project' | 'video' | 'image'
    data: null,
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  // 初始化平滑滾動與 3D 幾何軌道視差 Hooks
  useLenisScroll();
  useParallaxOrbit();

  React.useEffect(() => {
    const handleOpenImage = (e) => {
      const { imageUrl, title, description } = e.detail;
      setModalState({
        isOpen: true,
        type: 'image',
        data: { imageUrl, title, description }
      });
    };
    window.addEventListener('open-image-modal', handleOpenImage);
    return () => {
      window.removeEventListener('open-image-modal', handleOpenImage);
    };
  }, []);

  const handleOpenVideoModal = React.useCallback((videoId, isFacebook = false, aspect = 'video', videoUrl = null) => {
    setModalState({
      isOpen: true,
      type: 'video',
      data: { videoId, isFacebook, aspect, videoUrl },
    });
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    });
  }, []);

  return (
    <div className={`relative text-white min-h-screen selection:bg-aurora-blue selection:text-black overflow-x-hidden ${isPageLoaded ? 'is-loaded' : 'is-loading'}`}>

      {/* 視覺背景與光學粒子 */}
      <div className="mist-bg" />
      <div className="grid-bg" />
      {/* 手機版專屬：極光金屬流光漫延背景 */}
      <div className="mobile-aurora-mesh pointer-events-none" />

      {/* 3D 幾何與折射背景裝飾 */}
      <div className="lens-flare flare-1" />
      <div className="lens-flare flare-2" />
      <div className="lens-flare flare-3" />
      
      {/* 旋轉幾何軌道與漂浮水晶 */}
      <div className="orbit-container">
        <div className="orbit-ring ring-outer" />
        <div className="orbit-ring ring-middle" />
        <div className="orbit-ring ring-inner" />
        <div className="orbit-ring ring-diagonal" />
        
        {/* 漂浮玻璃晶體粒子 */}
        <div className="crystal crystal-1"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-2"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-3"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-4"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-5"><div className="crystal-inner w-full h-full" /></div>
        {/* 網頁版限定的額外漂浮晶體 (防止手機版卡頓) */}
        <div className="crystal crystal-6 hidden md:block"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-7 hidden md:block"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-8 hidden md:block"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-9 hidden md:block"><div className="crystal-inner w-full h-full" /></div>
        <div className="crystal crystal-10 hidden md:block"><div className="crystal-inner w-full h-full" /></div>
      </div>

      {/* 高科技滑鼠光暈 */}
      <CursorGlow />

      {/* 頂部與行動側邊導覽列 */}
      <Navigation />

      {/* 主頁面區段 */}
      <main>
        {/* 首頁 Hero 區 */}
        <Hero onPlayVideo={handleOpenVideoModal} isModalOpen={modalState.isOpen} onLoaded={() => setIsPageLoaded(true)} />

        {/* 開場介紹區段 */}
        <Introduction onPlayVideo={handleOpenVideoModal} />

        {/* 02 設計宣言 */}
        <Manifesto onPlayVideo={handleOpenVideoModal} />

        {/* 03 視覺合成 */}
        <VisualSynthesis onPlayVideo={handleOpenVideoModal} />

        {/* 聯絡我們 */}
        <Contact />
      </main>

      {/* 頁尾 */}
      <footer className="py-20 text-center text-zinc-400 mono text-[10px] uppercase tracking-[0.4em]">
        &copy; 2026 Beard Chou // SYSTEM SECURED
      </footer>

      {/* 全域狀態驅動互動彈窗 */}
      <React.Suspense fallback={null}>
        <Modal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          type={modalState.type}
          data={modalState.data}
        />
      </React.Suspense>
    </div>
  );
}
