import { useEffect } from 'react';

/**
 * 自訂 Hook: 手機水平儀 (DeviceOrientation 陀螺儀) 重力流光
 * 支援 Android 靜默開啟與 iOS Safari (iOS 13+) 第一次互動授權
 */
export function useGyroscope() {
  useEffect(() => {
    // 限制只在手機/觸控裝置 (max-width: 768px 或 Touch) 上運行，避免桌機重複執行
    if (typeof window === 'undefined') return;

    let isListening = false;

    // 水平儀數據處理函式
    const handleOrientation = (event) => {
      const gamma = event.gamma || 0; // 左右傾斜角 (-90 ~ 90 度)
      const beta = event.beta || 0;   // 前後傾斜角 (-180 ~ 180 度)

      // 以手持 45 度角為自然坐姿基準點，位移限制在 ±75px 內
      const tiltX = Math.max(-75, Math.min(75, gamma * 1.6));
      const tiltY = Math.max(-75, Math.min(75, (beta - 45) * 1.6));

      document.documentElement.style.setProperty('--tilt-x', `${tiltX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--tilt-y', `${tiltY.toFixed(1)}px`);
    };

    // 啟動監聽
    const startGyroscope = () => {
      if (isListening) return;
      window.addEventListener('deviceorientation', handleOrientation, true);
      isListening = true;
    };

    // 第一次觸控/點擊隱形自動請求授權 (iOS 相容機制)
    const handleFirstInteraction = async () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);

      // iOS 13+ 權限請求機制
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            startGyroscope();
          }
        } catch (e) {
          // 授權失敗或拒絕時靜默忽視，維持 7s 自動流光
        }
      } else {
        // Android 手機與一般瀏覽器直接啟動
        startGyroscope();
      }
    };

    // Android / 非 iOS 13 瀏覽器：一進站先嘗試監聽
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      startGyroscope();
    }

    // 綁定全域第一次點擊/滑動隱形觸發
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      if (isListening) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);
}
