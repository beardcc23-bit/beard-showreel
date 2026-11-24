import React, { useRef } from 'react';
import { m, useInView, useReducedMotion } from 'framer-motion';

const SHUTTER_EASE = [0.16, 1, 0.3, 1];
const SHUTTER_DURATION = 0.88;

/**
 * RevealHeading：VFX 光學快門掃光顯影大標（方案 B：Optical Shutter Wipe）
 * - 致敬 Autodesk Flame / Nuke 的 Before-After Wipe 切幕比對線
 * - 全程僅走 GPU 合成層（clip-path + transform + opacity），零重排、僅進場觸發一次
 * - 內部裝飾層皆標記 aria-hidden，維持純淨單一 <h2> 語意供 SEO 與無障礙讀取
 */
export default function RevealHeading({ children, className = '', delay = 0 }) {
  const headingRef = useRef(null);
  const prefersReduced = useReducedMotion();
  const isInView = useInView(headingRef, {
    once: true,
    amount: 0.35,
    margin: '0px 0px -60px 0px',
  });

  if (prefersReduced) {
    return (
      <h2 ref={headingRef} className={className}>
        {children}
      </h2>
    );
  }

  return (
    <h2 ref={headingRef} className={className}>
      {/* inline-block 精準鎖定掃光寬度等於文字實際寬度，不浪費在右側空白處 */}
      <span className="relative inline-block">
        {/* 底層未曝光暗影輪廓：提供進場前的視覺錨點，快門切開後柔和隱去避免重影 */}
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0.08 }}
          animate={isInView ? { opacity: 0 } : { opacity: 0.08 }}
          transition={{ duration: SHUTTER_DURATION * 0.75, delay: delay + 0.25, ease: 'easeOut' }}
          className="block select-none pointer-events-none"
        >
          {children}
        </m.span>

        {/* 主文字快門顯影層：與光刃同步由左向右俐落切開曝光 */}
        <m.span
          data-testid="reveal-heading-content"
          initial={{
            clipPath: 'inset(-8% 100% -12% 0%)',
            x: -10,
            opacity: 0.25,
          }}
          animate={
            isInView
              ? {
                  clipPath: 'inset(-8% -2% -12% 0%)',
                  x: 0,
                  opacity: 1,
                }
              : {
                  clipPath: 'inset(-8% 100% -12% 0%)',
                  x: -10,
                  opacity: 0.25,
                }
          }
          transition={{
            duration: SHUTTER_DURATION,
            delay,
            ease: SHUTTER_EASE,
          }}
          className="block absolute inset-0 will-change-[clip-path,transform,opacity]"
        >
          {children}
        </m.span>

        {/* VFX 光學快門掃描線（Shutter Wipe Blade）：緊貼 clip-path 邊界同步滑過文字全寬 */}
        <span
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-[8%] -bottom-[8%] inset-x-0 overflow-hidden"
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
              x: { duration: SHUTTER_DURATION, delay, ease: SHUTTER_EASE },
              opacity: {
                duration: SHUTTER_DURATION,
                delay,
                times: [0, 0.08, 0.8, 1],
                ease: 'linear',
              },
            }}
            className="block relative w-full h-full will-change-[transform,opacity]"
          >
            {/* 左側暗房色散拖尾餘暉 */}
            <span
              className="block absolute top-0 bottom-0 left-0 -translate-x-full w-12 sm:w-16 md:w-24"
              style={{
                background:
                  'linear-gradient(270deg, rgba(235, 74, 46, 0.36) 0%, rgba(208, 52, 108, 0.16) 46%, transparent 100%)',
              }}
            />
            {/* 核心 2px 光譜快門光刃（純白→熾熱橘紅→光學冰藍） */}
            <span
              className="block absolute top-0 bottom-0 left-0 -translate-x-1/2 w-[2px]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, #FFFFFF 28%, #EB4A2E 62%, #1276B8 100%)',
                boxShadow:
                  '0 0 14px rgba(235, 74, 46, 0.9), 0 0 6px rgba(255, 255, 255, 0.85)',
              }}
            />
          </m.span>
        </span>
      </span>
    </h2>
  );
}
