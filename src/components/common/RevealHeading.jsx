import React, { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'framer-motion';

const SHUTTER_EASE = [0.24, 0.82, 0.32, 1];
const SHUTTER_DURATION = 1.6;
const SHUTTER_BASE_DELAY = 0.12;

/**
 * RevealHeading：VFX 光學快門與橘色橫條導引顯影大標
 * - 固定單排呈現（whitespace-nowrap），由橘紅橫條與快門光帶從左至右沉穩導引視線逐字曝光
 * - 全程僅走 GPU 合成層（clip-path + transform + opacity），零重排、僅進場觸發一次
 * - 內部裝飾層皆標記 aria-hidden，維持純淨單一 <h2> 語意供 SEO 與無障礙讀取
 */
export default function RevealHeading({ children, className = '', delay = 0 }) {
  const headingRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(headingRef, {
    once: true,
    amount: 0.5,
    margin: '0px 0px -10% 0px',
  });
  const startDelay = delay + SHUTTER_BASE_DELAY;

  if (prefersReduced) {
    return (
      <h2 ref={headingRef} className={className}>
        <span className="inline-block whitespace-nowrap">{children}</span>
      </h2>
    );
  }

  return (
    <h2 ref={headingRef} className={className}>
      {/* inline-block + whitespace-nowrap 強制鎖定單排並讓掃光寬度 1:1 貼合文字實寬 */}
      <span className="relative inline-block whitespace-nowrap">
        {/* 底層未曝光暗影輪廓：提供進場前的視覺錨點，快門切開後柔和隱去避免重影 */}
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0.1 }}
          animate={isInView ? { opacity: 0 } : { opacity: 0.1 }}
          transition={{ duration: SHUTTER_DURATION * 0.8, delay: startDelay + 0.35, ease: 'easeOut' }}
          className="block select-none pointer-events-none"
        >
          {children}
        </m.span>

        {/* 主文字快門顯影層：隨橘色橫條與光刃由左向右沉穩切開曝光 */}
        <m.span
          data-testid="reveal-heading-content"
          initial={{
            clipPath: 'inset(-10% 100% -16% 0%)',
            x: -12,
            opacity: 0.2,
          }}
          animate={
            isInView
              ? {
                  clipPath: 'inset(-10% -3% -16% 0%)',
                  x: 0,
                  opacity: 1,
                }
              : {
                  clipPath: 'inset(-10% 100% -16% 0%)',
                  x: -12,
                  opacity: 0.2,
                }
          }
          transition={{
            duration: SHUTTER_DURATION,
            delay: startDelay,
            ease: SHUTTER_EASE,
          }}
          className="block absolute inset-0 will-change-[clip-path,transform,opacity]"
        >
          {children}
        </m.span>

        {/* 底部品牌橘紅導引橫條：隨文字顯影同步由左向右延伸領跑視線，定版後柔和收隱 */}
        <m.span
          aria-hidden="true"
          data-testid="reveal-heading-bar"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            isInView
              ? {
                  scaleX: [0, 1, 1],
                  opacity: [0, 1, 1, 0],
                }
              : { scaleX: 0, opacity: 0 }
          }
          transition={{
            scaleX: {
              duration: SHUTTER_DURATION * 1.12,
              delay: startDelay,
              times: [0, 0.89, 1],
              ease: SHUTTER_EASE,
            },
            opacity: {
              duration: SHUTTER_DURATION * 1.28,
              delay: startDelay,
              times: [0, 0.06, 0.78, 1],
              ease: 'easeOut',
            },
          }}
          className="pointer-events-none select-none block absolute left-0 right-0 -bottom-[0.1em] h-[3px] sm:h-[4px] origin-left will-change-[transform,opacity]"
          style={{
            background:
              'linear-gradient(90deg, rgba(235, 74, 46, 0.18) 0%, #EB4A2E 62%, #FF8A6C 100%)',
            boxShadow: '0 0 16px rgba(235, 74, 46, 0.75)',
          }}
        />

        {/* VFX 橘紅光學快門掃描帶（Shutter Wipe Blade）：緊貼 clip-path 邊界從容滑過整排文字 */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-[10%] -bottom-[14%] inset-x-0 overflow-hidden"
        >
          <m.span
            data-testid="reveal-heading-blade"
            initial={{ x: '0%', opacity: 0 }}
            animate={
              isInView
                ? {
                    x: ['0%', '100%'],
                    opacity: [0, 1, 1, 0],
                  }
                : { x: '0%', opacity: 0 }
            }
            transition={{
              x: { duration: SHUTTER_DURATION, delay: startDelay, ease: SHUTTER_EASE },
              opacity: {
                duration: SHUTTER_DURATION,
                delay: startDelay,
                times: [0, 0.06, 0.86, 1],
                ease: 'linear',
              },
            }}
            className="block relative w-full h-full will-change-[transform,opacity]"
          >
            {/* 左側加長熾熱橘紅橫向拖尾光帶 */}
            <span
              className="block absolute top-0 bottom-0 left-0 -translate-x-full w-20 sm:w-28 md:w-40"
              style={{
                background:
                  'linear-gradient(270deg, rgba(235, 74, 46, 0.56) 0%, rgba(235, 74, 46, 0.24) 48%, transparent 100%)',
              }}
            />
            {/* 核心 3px 熾熱橘紅前導光刃 */}
            <span
              className="block absolute top-0 bottom-0 left-0 -translate-x-1/2 w-[3px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 138, 108, 0.35) 0%, #FF8A6C 24%, #EB4A2E 68%, rgba(235, 74, 46, 0.45) 100%)',
                boxShadow:
                  '0 0 20px rgba(235, 74, 46, 0.95), 0 0 8px rgba(255, 138, 108, 0.9)',
              }}
            />
          </m.span>
        </span>
      </span>
    </h2>
  );
}
