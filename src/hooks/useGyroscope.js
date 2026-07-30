import { useEffect, useState, useCallback } from 'react';

/**
 * 自訂 Hook: 手機水平儀 (DeviceOrientation 陀螺儀) 重力流光
 * 導出 requestPermission 確保在 iOS 13+ 上點擊按鈕時 100% 觸發系統授權彈窗
 */
export function useGyroscope() {
  const [gyroState, setGyroState] = useState('idle'); // 'idle' | 'granted' | 'denied' | 'unsupported'

  const startGyroscope = useCallback(() => {
    const handleOrientation = (event) => {
      const gamma = event.gamma || 0; // 左右傾斜角 (-90 ~ 90 度)
      const beta = event.beta || 0;   // 前後傾斜角 (-180 ~ 180 度)

      // 以手持 45 度角為自然坐姿基準點，位移限制在 ±75px 內
      const tiltX = Math.max(-75, Math.min(75, gamma * 1.6));
      const tiltY = Math.max(-75, Math.min(75, (beta - 45) * 1.6));

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
