import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 零凍結、大動態重力感應 Hook
 * 1. 2.5 倍超大幅度動態響應 (最高 ±320px 磅礡流動)
 * 2. 徹底移除原生 alert，採用 passive 防凍結事件監聽，絕對不引發主執行緒崩潰
 */
export function useGyroscope() {
  const [gyroState, setGyroState] = useState('idle'); // 'idle' | 'granted' | 'denied'
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
      let latestBeta = 40;
      let isTicking = false;

      const updateCSSVariables = () => {
        try {
          // 嚴格整數化與安全數值防護
          const safeGamma = Number.isFinite(latestGamma) ? latestGamma : 0;
          const safeBeta = Number.isFinite(latestBeta) ? latestBeta : 40;

          // 2.5x 超大位移幅度：限制在 ±320px 內，呈現極度顯著的流光奔動感
          const tiltX = Math.round(Math.max(-320, Math.min(320, safeGamma * 6.5)));
          const tiltY = Math.round(Math.max(-350, Math.min(350, (safeBeta - 40) * 6.5)));

          if (document.documentElement) {
            document.documentElement.style.setProperty('--tilt-x', `${tiltX}px`);
            document.documentElement.style.setProperty('--tilt-y', `${tiltY}px`);
          }
        } catch (e) {
          // 靜默捕捉 DOM 操作
        } finally {
          isTicking = false;
        }
      };

      const handleOrientation = (event) => {
        if (!event) return;
        const g = event.gamma;
        const b = event.beta;

        if (typeof g === 'number' && typeof b === 'number' && !isNaN(g) && !isNaN(b)) {
          latestGamma = g;
          latestBeta = b;

          if (!isTicking) {
            isTicking = true;
            rafIdRef.current = requestAnimationFrame(updateCSSVariables);
          }
        }
      };

      // 採用 passive: true 事件監聽，確保主執行緒 100% 不卡死、不崩潰
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      isListeningRef.current = true;
      setGyroState('granted');
    } catch (err) {
      console.warn('Gyroscope silent catch:', err);
      setGyroState('denied');
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
        setGyroState('denied');
        return false;
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

  return { gyroState, requestPermission };
}
