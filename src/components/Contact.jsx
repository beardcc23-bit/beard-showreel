import React, { useState } from 'react';
import { m } from 'framer-motion';
import { Check, Copy, ArrowRight, MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { useClipboard } from '../hooks/useClipboard';

/**
 * 第五幕 Contact：瑞士雙欄分割厚玻璃艙（左艙信箱複製 × 右艙滑出式回饋抽屜觸發器）
 */
export default function Contact() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const emailUser = 'beard.cc23';
  const emailDomain = 'gmail.com';
  const email = `${emailUser}@${emailDomain}`;
  const { copied, copy } = useClipboard(2500);

  const GAS_SCRIPT_URL =
    import.meta.env.VITE_GAS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbyqnxsdu2s0De5mrIKdmeharnJiy__hLyRyAnhZKzKjEDmXoCjUQYHrlUmmvShbnS7O/exec';

  const handleCopyEmail = () => {
    if (copied) return;
    copy(email);
  };

  const handleCloseFeedback = React.useCallback(() => {
    setIsFeedbackOpen(false);
  }, []);

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-32 md:py-44 px-5 md:px-12 border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* 左對齊緊密收攏標頭 */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="mono text-xs uppercase tracking-[0.26em] text-spectral-crimson block mb-4">
            04 / DIRECT INQUIRY
          </span>
          <m.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-[clamp(2.6rem,7vw,5.75rem)] font-bold uppercase tracking-[-0.04em] leading-[0.94] text-title-white"
          >
            Let&apos;s Connect<span className="text-spectral-crimson">.</span>
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-zinc-300 font-light text-sm sm:text-base leading-relaxed"
          >
            隨時歡迎來信交流，探討影像與設計的更多可能。
          </m.p>
        </div>

        {/* 瑞士雙欄 1px 分割厚玻璃互動艙（保留外層無 overflow-hidden 以完整呈現右上 3D 玻璃厚度斷面） */}
        <div className="optical-surface grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.10]">
          {/* 左艙（7/12）：點擊複製信箱 */}
          <button
            type="button"
            onClick={handleCopyEmail}
            title="點擊複製 Email 地址"
            aria-label={`複製 Email 地址: ${email}`}
            className="lg:col-span-7 w-full min-h-[180px] sm:min-h-[220px] p-7 sm:p-10 md:p-11 flex flex-col justify-between text-left transition-colors duration-300 hover:bg-white/[0.025] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-spectral-crimson cursor-pointer group"
          >
            <span className="w-full flex flex-wrap items-center justify-between gap-3 mb-10">
              <span className="mono text-[10px] uppercase tracking-[0.26em] text-zinc-400">
                DIRECT MAIL
              </span>
              {copied ? (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-1.5 mono text-[10px] uppercase tracking-[0.22em] text-spectral-crimson"
                >
                  <Check size={12} className="shrink-0" />
                  <span>COPIED TO CLIPBOARD // 成功複製 EMAIL</span>
                </span>
              ) : (
                <span className="mono text-[10px] uppercase tracking-[0.24em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  CLICK TO COPY
                </span>
              )}
            </span>

            <span className="w-full flex items-end justify-between gap-4">
              <span className="font-display text-[clamp(1.35rem,3.2vw,2.6rem)] font-medium tracking-[-0.02em] leading-none text-title-white group-hover:text-white transition-colors duration-300 break-all">
                {email}
              </span>
              <span className="w-10 h-10 shrink-0 border border-white/[0.12] bg-white/[0.02] group-hover:border-spectral-crimson/60 group-hover:bg-spectral-crimson/10 flex items-center justify-center transition-colors duration-300">
                {copied ? (
                  <Check size={17} className="text-spectral-crimson" />
                ) : (
                  <Copy
                    size={16}
                    className="text-zinc-400 group-hover:text-title-white transition-colors"
                  />
                )}
              </span>
            </span>
          </button>

          {/* 右艙（5/12）：開啟右側滑出式回饋抽屜 */}
          <button
            type="button"
            onClick={() => setIsFeedbackOpen(true)}
            aria-label="開啟回饋表單"
            className="lg:col-span-5 w-full min-h-[180px] sm:min-h-[220px] p-7 sm:p-10 md:p-11 flex flex-col justify-between text-left transition-colors duration-300 hover:bg-white/[0.025] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-spectral-crimson cursor-pointer group"
          >
            <span className="w-full flex items-center justify-between gap-3 mb-10">
              <span className="mono text-[10px] uppercase tracking-[0.26em] text-zinc-400">
                FEEDBACK
              </span>
              <MessageSquareText
                size={14}
                className="text-zinc-500 group-hover:text-spectral-crimson transition-colors duration-300"
              />
            </span>

            <span className="w-full flex items-end justify-between gap-4">
              <span>
                <span className="block font-display text-[clamp(1.35rem,2.6vw,2.15rem)] font-medium tracking-[-0.02em] leading-none text-title-white">
                  Leave a Note
                </span>
                <span className="block mt-2.5 text-xs sm:text-sm text-zinc-400 font-light tracking-wide group-hover:text-zinc-200 transition-colors">
                  留下回饋與專案諮詢
                </span>
              </span>
              <span className="w-10 h-10 shrink-0 border border-white/[0.12] bg-white/[0.02] group-hover:border-spectral-crimson/60 group-hover:bg-spectral-crimson/10 flex items-center justify-center transition-colors duration-300">
                <ArrowRight
                  size={16}
                  className="text-zinc-400 group-hover:text-title-white group-hover:translate-x-0.5 transition-all duration-300"
                />
              </span>
            </span>
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={handleCloseFeedback}
        scriptUrl={GAS_SCRIPT_URL}
      />
    </section>
  );
}
