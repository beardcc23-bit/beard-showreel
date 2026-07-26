import React, { useState } from 'react';
import Navigation from './components/Navigation';
import CursorGlow from './components/CursorGlow';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Manifesto from './components/Manifesto';
import VisualSynthesis from './components/VisualSynthesis';
import Contact from './components/Contact';
import Lenis from 'lenis';

const Modal = React.lazy(() => import('./components/Modal'));

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
    window.lenis = lenis;

    let rafId = null;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.lenis = null;
      lenis.destroy();
    };
  }, []);

  // 實作幾何軌道背景的滑鼠三維視差傾斜 (Lens Parallax) - 採用 rAF + Lerp 進行效能調優
  React.useEffect(() => {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (isTouch) return;

    const orbit = document.querySelector('.orbit-container');
    if (!orbit) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId = null;
    let isRunning = false;

    const updateParallax = () => {
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      
      currentX += dx * 0.08;
      currentY += dy * 0.08;

      orbit.style.transform = `translate3d(calc(-50% + ${currentX * 18}px), calc(-50% + ${currentY * 15}px), 0) rotateX(${-currentY * 12}deg) rotateY(${currentX * 12}deg)`;

      // 如果差距仍大於 0.0001 則繼續下一幀插值，否則停止動畫迴圈以節省資源
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        isRunning = false;
      }
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 到 1
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2; // -1 到 1
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
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
        <div className="crystal crystal-1" />
        <div className="crystal crystal-2" />
        <div className="crystal crystal-3" />
        <div className="crystal crystal-4" />
        <div className="crystal crystal-5" />
        {/* 網頁版限定的額外漂浮晶體 (防止手機版卡頓) */}
        <div className="crystal crystal-6 hidden md:block" />
        <div className="crystal crystal-7 hidden md:block" />
        <div className="crystal crystal-8 hidden md:block" />
        <div className="crystal crystal-9 hidden md:block" />
        <div className="crystal crystal-10 hidden md:block" />
      </div>

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
