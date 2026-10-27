/**
 * Emil Kowalski 核心動效規範 (Motion Engineering Specification)
 * 專注於物理彈簧 (Spring Physics)、合理 Easing 曲線與 300ms 內的微互動 (Micro-interactions)
 */

export const emilSpring = {
  // 適用於按鈕、點擊反饋、微型互動 (清脆、具實體質量)
  snappy: {
    type: 'spring',
    stiffness: 450,
    damping: 32,
    mass: 0.75,
  },
  // 適用於卡片展開、Tab 滑動、面板移動 (柔順平滑、無生硬停頓)
  smooth: {
    type: 'spring',
    stiffness: 280,
    damping: 26,
    mass: 0.9,
  },
  // 適用於選單、彈窗展開 (大尺度物理位移)
  gentle: {
    type: 'spring',
    stiffness: 200,
    damping: 24,
    mass: 1,
  },
};

// 點擊微反饋 (Micro-tap Feedback)
export const tapFeedback = {
  scale: 0.97,
  transition: emilSpring.snappy,
};
