import React, { useState } from 'react';
import Navigation from './components/Navigation';
import CursorGlow from './components/CursorGlow';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Manifesto from './components/Manifesto';
import VisualSynthesis from './components/VisualSynthesis';
import Contact from './components/Contact';
import Modal from './components/Modal';
import RefractiveCrystals from './components/RefractiveCrystals';
import Lenis from 'lenis';
import SpaceParticles from './components/SpaceParticles';

export default function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'project' | 'video'
    data: null,
  });
  const [isPageLoaded, setIsPageLoaded] = useState(false);

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

  // 初始化 Lenis 電影級平滑滾動
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 經典指數緩動
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // 實作幾何軌道背景的滑鼠三維視差傾斜 (Lens Parallax)
  React.useEffect(() => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const orbit = document.querySelector('.orbit-container');
    if (!orbit) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPercent = (clientX / window.innerWidth - 0.5) * 2; // -1 到 1
      const yPercent = (clientY / window.innerHeight - 0.5) * 2; // -1 到 1

      // 幾何軌道進行平滑的三維傾斜與位移 (加入 calc 以維持置中)
      orbit.style.transform = `translate3d(calc(-50% + ${xPercent * 18}px), calc(-50% + ${yPercent * 15}px), 0) rotateX(${-yPercent * 12}deg) rotateY(${xPercent * 12}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
      {/* 全域大氣粒子與星空背景 */}
      <SpaceParticles />

      {/* 視覺背景與光學粒子 */}
      <div className="mist-bg" />
      <div className="grid-bg" />

      {/* 3D 幾何與折射背景裝飾 */}
      <div className="lens-flare flare-1" />
      <div className="lens-flare flare-2" />
      <div className="lens-flare flare-3" />
      
      {/* 旋轉幾何軌道 */}
      <div className="orbit-container">
        <div className="orbit-ring ring-outer" />
        <div className="orbit-ring ring-middle" />
        <div className="orbit-ring ring-inner" />
        <div className="orbit-ring ring-diagonal" />
      </div>

      {/* 3D 物理折射水晶背景 */}
      <RefractiveCrystals />

      {/* 高科技滑鼠光暈 */}
      <CursorGlow />

      {/* 頂部與行動側邊導覽列 */}
      <Navigation />

      {/* 主頁面區段 */}
      <main>
        {/* 首頁 Hero 區 (純全屏 Canvas 序列播放，無重疊文字) */}
        <Hero onPlayVideo={handleOpenVideoModal} isModalOpen={modalState.isOpen} onLoaded={() => setIsPageLoaded(true)} />

        {/* 開場介紹區段 (S Y S T E M _ S T A T U S : O P T I M A L 及精雕文案與按鈕) */}
        <Introduction onPlayVideo={handleOpenVideoModal} />

        {/* 02 設計宣言 (已整併技能進度條與設計故事) */}
        <Manifesto onPlayVideo={handleOpenVideoModal} />

        {/* 03 視覺合成 (VFX 影片卡片列表，支援 state 彈窗播放) */}
        <VisualSynthesis onPlayVideo={handleOpenVideoModal} />


        {/* 聯絡我們 */}
        <Contact />
      </main>

      {/* 頁尾 */}
      <footer className="py-20 text-center text-zinc-700 mono text-[6px] uppercase tracking-[0.4em]">
        &copy; 2026 Beard Chou // SYSTEM SECURED
      </footer>

      {/* 全域狀態驅動互動彈窗 */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type={modalState.type}
        data={modalState.data}
      />
    </div>
  );
}
