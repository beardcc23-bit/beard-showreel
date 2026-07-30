import { useEffect, useState, useCallback } from 'react';

/**
 * 自訂 Hook: 手機水平儀 (DeviceOrientation 陀螺儀) 重力流光
 * 導出 requestPermission 確保在 iOS 13+ 上點擊按鈕時 100% 觸發系統授權彈窗
 */
export function useGyroscope() {
  const [gyroState, setGyroState] = useState('idle'); // 'idle' | 'granted' | 'denied' | 'unsupported'

  const startGyroscope = useCallback(() => {
    // 啟動重力感應標誌，暫停背景自動動畫，改由手機方向 100% 絕對控制
    document.documentElement.classList.add('gyro-active');

    const handleOrientation = (event) => {
      const gamma = event.gamma || 0; // 左右傾斜角 (-90 ~ 90 度)
      const beta = event.beta || 0;   // 前後傾斜角 (-180 ~ 180 度)

      // 直觀物理對應：
      // 手機往下傾斜 (beta > 45) -> tiltY 為正，光影穩定留在下方
      // 手機往上傾斜 (beta < 45) -> tiltY 為負，光影穩定留在上方
      // 手機往右傾斜 (gamma > 0) -> tiltX 為正，光影穩定留在右方
      // 手機往左傾斜 (gamma < 0) -> tiltX 為負，光影穩定留在左方
      const tiltX = Math.max(-130, Math.min(130, gamma * 2.8));
      const tiltY = Math.max(-150, Math.min(150, (beta - 40) * 2.8));

      document.documentElement.style.setProperty('--tilt-x', `${tiltX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--tilt-y', `${tiltY.toFixed(1)}px`);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    setGyroState('granted');
  }, []);

  const requestPermission = useCallback(async () => {
    // 檢查是否為需要授權彈窗的 iOS Safari (iOS 13+)
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          startGyroscope();
        } else {
          setGyroState('denied');
        }
      } catch (error) {
        console.warn('Gyroscope permission request error:', error);
        setGyroState('denied');
      }
    } else {
      // Android 手機或一般瀏覽器：直接啟動
      startGyroscope();
    }
  }, [startGyroscope]);

  useEffect(() => {
    // 掛載全域全區觸發函式
    window.requestGyroPermission = requestPermission;

    // 非 iOS 13 的 Android 手機或桌面瀏覽器：直接自動監聽
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      startGyroscope();
    }
  }, [startGyroscope, requestPermission]);

  return { gyroState, requestPermission };
}
