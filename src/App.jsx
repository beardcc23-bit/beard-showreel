import React, { useState } from 'react';
import Navigation from './components/Navigation';
import CursorGlow from './components/CursorGlow';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Manifesto from './components/Manifesto';
import VisualSynthesis from './components/VisualSynthesis';
import Contact from './components/Contact';
import Modal from './components/Modal';

export default function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null, // 'project' | 'video'
    data: null,
  });

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


  const handleOpenVideoModal = (videoId, isFacebook = false, aspect = 'video', videoUrl = null) => {
    setModalState({
      isOpen: true,
      type: 'video',
      data: { videoId, isFacebook, aspect, videoUrl },
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: null,
    });
  };

  return (
    <div className="relative text-white min-h-screen selection:bg-aurora-blue selection:text-black overflow-x-hidden">
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
        <Hero onPlayVideo={handleOpenVideoModal} />

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
