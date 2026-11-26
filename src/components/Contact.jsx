import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Check, Copy, ArrowRight } from 'lucide-react';
import RevealHeading from './common/RevealHeading';
import { DEFAULT_GAS_SCRIPT_URL } from '../constants/siteConfig';
import { useClipboard } from '../hooks/useClipboard';

const loadFeedbackModal = () => import('./FeedbackModal');
const FeedbackModal = React.lazy(loadFeedbackModal);
let isFeedbackChunkPreloaded = false;

const warmFeedbackChunk = () => {
  if (isFeedbackChunkPreloaded) return;
  isFeedbackChunkPreloaded = true;
  loadFeedbackModal().catch(() => {
    isFeedbackChunkPreloaded = false;
  });
};

/**
 * 第五幕 Contact：瑞士雙欄分割厚玻璃艙（左艙信箱複製 × 右艙滑出式回饋抽屜觸發器）
 */
export default function Contact() {
  const sectionRef = useRef(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [hasFeedbackMounted, setHasFeedbackMounted] = useState(false);
  const emailUser = 'beard.cc23';
  const emailDomain = 'gmail.com';
  const email = `${emailUser}@${emailDomain}`;
  const { copied, copy } = useClipboard(2500);

  const GAS_SCRIPT_URL = import.meta.env.VITE_GAS_SCRIPT_URL || DEFAULT_GAS_SCRIPT_URL;

  // 滑近聯絡區時於閒置期自動預熱 FeedbackModal chunk（3.9KB），確保純觸控手機首次點擊亦 0ms 秒開
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined' || isFeedbackChunkPreloaded) return undefined;
    if (typeof IntersectionObserver === 'undefined') return undefined;
    let idleId = null;
    let timerId = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          io.disconnect();
          if ('requestIdleCallback' in window) {
            idleId = window.requestIdleCallback(warmFeedbackChunk, { timeout: 1500 });
          } else {
            timerId = setTimeout(warmFeedbackChunk, 350);
          }
        }
      },
      { rootMargin: '280px 0px' }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== null) clearTimeout(timerId);
    };
  }, []);

  const handleCopyEmail = () => {
    copy(email);
  };

  const handleCloseFeedback = React.useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden py-32 md:py-44 px-5 md:px-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 左對齊標頭（移除寬度限制以固定單排呈現） */}
        <div className="mb-12 md:mb-16">
          <RevealHeading className="font-display text-[clamp(1.75rem,6.5vw,5.5rem)] whitespace-nowrap font-extrabold uppercase tracking-[-0.035em] leading-[0.94] text-title-white">
            Let&apos;s Connect<span className="text-spectral-crimson">.</span>
          </RevealHeading>
        </div>

        {/* 瑞士雙欄 1px 分割厚玻璃互動艙（保留外層無 overflow-hidden 以完整呈現右上 3D 玻璃厚度斷面） */}
        <div className="optical-surface grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.10]">
          {/* 左艙（7/12）：點擊複製信箱 */}
          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label={`複製 Email 地址: ${email}`}
            className="lg:col-span-7 w-full py-9 sm:py-11 md:py-12 px-6 sm:px-10 md:px-11 flex items-center text-left transition-colors duration-300 hover:bg-white/[0.025] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-spectral-crimson cursor-pointer group relative"
          >
            {copied && (
              <span
                role="status"
                aria-live="polite"
                className="absolute top-3.5 left-6 sm:left-10 md:left-11 inline-flex items-center gap-1.5 text-xs text-spectral-crimson"
              >
                <Check size={13} className="shrink-0" />
                <span className="sr-only">COPIED TO CLIPBOARD</span>
                <span>已複製 Email</span>
              </span>
            )}

            <span className="w-full flex items-center justify-between gap-4">
              <span className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-[-0.02em] leading-none text-title-white group-hover:text-white transition-colors duration-300 truncate">
                {email}
              </span>
              <span className="w-10 h-10 shrink-0 border border-spectral-crimson/35 bg-spectral-crimson/[0.06] group-hover:border-spectral-crimson/80 group-hover:bg-spectral-crimson/15 flex items-center justify-center transition-colors duration-300">
                {copied ? (
                  <Check size={17} className="text-spectral-crimson" />
                ) : (
                  <Copy
                    size={16}
                    className="text-spectral-crimson transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </span>
            </span>
          </button>

          {/* 右艙（5/12）：開啟右側滑出式回饋抽屜（懸停／聚焦預熱 chunk，點擊秒開） */}
          <button
            type="button"
            onPointerEnter={warmFeedbackChunk}
            onFocus={warmFeedbackChunk}
            onClick={() => {
              setHasFeedbackMounted(true);
              setIsFeedbackOpen(true);
            }}
            aria-label="開啟回饋表單"
            className="lg:col-span-5 w-full py-9 sm:py-11 md:py-12 px-6 sm:px-10 md:px-11 flex items-center text-left transition-colors duration-300 hover:bg-white/[0.025] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-spectral-crimson cursor-pointer group"
          >
            <span className="w-full flex items-center justify-between gap-4">
              <span>
                <span className="block font-display text-lg sm:text-xl md:text-2xl font-bold tracking-[-0.02em] leading-none text-title-white group-hover:text-white transition-colors duration-300">
                  Leave a Note
                </span>
                <span className="block mt-2.5 text-xs sm:text-sm text-zinc-400 font-light tracking-wide group-hover:text-zinc-200 transition-colors">
                  留下回饋，探討影像的更多可能
                </span>
              </span>
              <span className="w-10 h-10 shrink-0 border border-spectral-crimson/35 bg-spectral-crimson/[0.06] group-hover:border-spectral-crimson/80 group-hover:bg-spectral-crimson/15 flex items-center justify-center transition-colors duration-300">
                <ArrowRight
                  size={16}
                  className="text-spectral-crimson group-hover:translate-x-0.5 transition-transform duration-300"
                />
              </span>
            </span>
          </button>
        </div>
      </div>

      {hasFeedbackMounted && (
        <Suspense fallback={null}>
          <FeedbackModal
            isOpen={isFeedbackOpen}
            onClose={handleCloseFeedback}
            scriptUrl={GAS_SCRIPT_URL}
          />
        </Suspense>
      )}
    </section>
  );
}
