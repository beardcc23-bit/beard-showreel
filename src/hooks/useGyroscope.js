import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 零露黑邊極速流光 Engine (Gradient Center Coordinate Positioning)
 * 背景邊界 100% 固定不變，透過動態漸層中心點座標 (--lx, --ly) 實現極致平滑的水銀重力流動！
 */
export function useGyroscope() {
  const [gyroStatus, setGyroStatus] = useState('AUTO_FLOW');
  const isListeningRef = useRef(false);
  const rafIdRef = useRef(null);

  const startGyroscope = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      if (document.documentElement) {
        document.documentElement.classList.add('gyro-active');
      }

      let latestX = 0;
      let latestY = 0;
      let isTicking = false;

      const updateGradientCoordinates = () => {
        try {
          if (document.documentElement) {
            // 動態控制漸層中心點偏移 (-28% ~ +28%)
            document.documentElement.style.setProperty('--lx', `${latestX.toFixed(1)}%`);
            document.documentElement.style.setProperty('--ly', `${latestY.toFixed(1)}%`);
          }
        } catch (e) {
          // 靜默捕捉 DOM 操作
        } finally {
          isTicking = false;
        }
      };

      const handleOrientation = (event) => {
        if (!event) return;

        const g = typeof event.gamma === 'number' ? event.gamma : 0;
        const b = typeof event.beta === 'number' ? event.beta : 40;

        if (!isNaN(g) && !isNaN(b)) {
          // 直觀百分比位移：手機向左 (g < 0) -> --lx 為負 (光斑向左流)
          // 手機向下 (b > 40) -> --ly 為正 (光斑向下流)
          latestX = Math.max(-28, Math.min(28, g * 0.75));
          latestY = Math.max(-30, Math.min(30, (b - 40) * 0.75));

          if (!isTicking) {
            isTicking = true;
            rafIdRef.current = requestAnimationFrame(updateGradientCoordinates);
          }
        }
      };

      if (!isListeningRef.current) {
        window.addEventListener('deviceorientation', handleOrientation, true);
        isListeningRef.current = true;
      }
      
      setGyroStatus('ACTIVE');
    } catch (err) {
      console.warn('Gyroscope gradient positioning fallback:', err);
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
