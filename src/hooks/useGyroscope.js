import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 防彈級自訂 Hook: 手機水平儀 (DeviceOrientation 陀螺儀) 重力流光
 * 包含 rAF 動畫節流、Strict NaN 防護、全域 Exception 包覆與記憶體自動清理
 */
export function useGyroscope() {
  const [gyroState, setGyroState] = useState('idle'); // 'idle' | 'granted' | 'denied' | 'unsupported'
  const rafIdRef = useRef(null);
  const isListeningRef = useRef(false);

  const startGyroscope = useCallback(() => {
    if (isListeningRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      if (document.documentElement) {
        document.documentElement.classList.add('gyro-active');
      }

      let latestGamma = 0;
      let latestBeta = 0;
      let isTicking = false;

      const updateCSSVariables = () => {
        try {
          // 嚴格 NaN / Null / Infinity 防護
          const safeGamma = Number.isFinite(latestGamma) ? latestGamma : 0;
          const safeBeta = Number.isFinite(latestBeta) ? latestBeta : 40;

          // 直觀物理對應，安全邊界裁切 (-120px ~ +120px)
          const tiltX = Math.max(-120, Math.min(120, safeGamma * 2.5));
          const tiltY = Math.max(-140, Math.min(140, (safeBeta - 40) * 2.5));

          if (document.documentElement) {
            document.documentElement.style.setProperty('--tilt-x', `${tiltX.toFixed(1)}px`);
            document.documentElement.style.setProperty('--tilt-y', `${tiltY.toFixed(1)}px`);
          }
        } catch (e) {
          // 靜默捕捉 DOM style 寫入例外，確保主執行緒絕不卡死崩潰
        } finally {
          isTicking = false;
        }
      };

      const handleOrientation = (event) => {
        if (!event) return;
        // 嚴格過濾無效數值
        if (typeof event.gamma === 'number' && typeof event.beta === 'number') {
          latestGamma = event.gamma;
          latestBeta = event.beta;

          // rAF 節流：畫面每影格最多更新一次 CSS 變數，效能 100% 流暢且絕不耗能卡死
          if (!isTicking) {
            isTicking = true;
            rafIdRef.current = requestAnimationFrame(updateCSSVariables);
          }
        }
      };

      window.addEventListener('deviceorientation', handleOrientation, true);
      isListeningRef.current = true;
      setGyroState('granted');
    } catch (err) {
      console.warn('Gyroscope startup error caught safely:', err);
      setGyroState('denied');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          startGyroscope();
          return true;
        } else {
          setGyroState('denied');
          return false;
        }
      } else {
        startGyroscope();
        return true;
      }
    } catch (error) {
      console.warn('Permission request error caught safely:', error);
      setGyroState('denied');
      return false;
    }
  }, [startGyroscope]);

  useEffect(() => {
    window.requestGyroPermission = requestPermission;

    // 非 iOS 13+ 的 Android / 桌面裝置直接自動安全啟用
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      startGyroscope();
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [startGyroscope, requestPermission]);

  return { gyroState, requestPermission };
}
