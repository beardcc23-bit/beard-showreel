import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 直連式防彈重力感應 Hook (Direct DOM Binding)
 * 直接操作 .mobile-aurora-mesh 元素 style.transform，100% 消除 CSS 變數層傳遞失效問題
 */
export function useGyroscope() {
  const [gyroStatus, setGyroStatus] = useState('AUTO_FLOW'); // 'AUTO_FLOW' | 'ACTIVE' | 'DENIED'
  const isListeningRef = useRef(false);
  const rafIdRef = useRef(null);

  const startGyroscope = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const meshElement = document.querySelector('.mobile-aurora-mesh');
      if (document.documentElement) {
        document.documentElement.classList.add('gyro-active');
      }

      let latestX = 0;
      let latestY = 0;
      let isTicking = false;

      const applyDirectTransform = () => {
        try {
          const targetMesh = meshElement || document.querySelector('.mobile-aurora-mesh');
          if (targetMesh) {
            // 直連式寫入 transform，不經 CSS 變數，100% 絕對連動
            targetMesh.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`;
          }
        } catch (e) {
          // 靜默捕捉 DOM 操作
        } finally {
          isTicking = false;
        }
      };

      const handleOrientation = (event) => {
        if (!event) return;

        // 相容不同手機角數據
        const g = typeof event.gamma === 'number' ? event.gamma : 0;
        const b = typeof event.beta === 'number' ? event.beta : 40;

        if (!isNaN(g) && !isNaN(b)) {
          // 直觀對應與安全邊界限制 (-220px ~ +220px)
          latestX = Math.round(Math.max(-220, Math.min(220, g * 4.5)));
          latestY = Math.round(Math.max(-240, Math.min(240, (b - 40) * 4.5)));

          if (!isTicking) {
            isTicking = true;
            rafIdRef.current = requestAnimationFrame(applyDirectTransform);
          }
        }
      };

      if (!isListeningRef.current) {
        // 標準陀螺儀事件監聽
        window.addEventListener('deviceorientation', handleOrientation, true);
        isListeningRef.current = true;
      }
      
      setGyroStatus('ACTIVE');
    } catch (err) {
      console.warn('Gyroscope direct binding fallback:', err);
      setGyroStatus('AUTO_FLOW');
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const response = await DeviceOrientationEvent.requestPermission().catch(() => 'denied');
        if (response === 'granted') {
          startGyroscope();
          return 'ACTIVE';
        } else {
          setGyroStatus('DENIED');
          return 'DENIED';
        }
      } else {
        startGyroscope();
        return 'ACTIVE';
      }
    } catch (error) {
      setGyroStatus('DENIED');
      return 'DENIED';
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

  return { gyroStatus, requestPermission };
}
