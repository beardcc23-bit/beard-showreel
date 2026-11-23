import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useOverlayLock } from '../hooks/useOverlayLock';

const sanitizeSheetInput = (str) => {
  if (!str) return '';
  const cleaned = str.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  const safeLines = cleaned.replace(/([\r\n]+)\s*([=+@\-\t\r|])/g, "$1'$2");
  if (/^[=+@\-\t\r|]/.test(safeLines)) {
    return `'${safeLines}`;
  }
  return safeLines;
};

let lastSubmitTimestamp = 0;
const COOLDOWN_MS = 20000;
const COOLDOWN_STORAGE_KEY = 'fb_last_ts';
const getLastSubmitTime = () => {
  try {
    const stored = Number(localStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
    return Math.max(lastSubmitTimestamp, stored);
  } catch {
    return lastSubmitTimestamp;
  }
};
const setLastSubmitTime = (ts) => {
  lastSubmitTimestamp = ts;
  try {
    localStorage.setItem(COOLDOWN_STORAGE_KEY, String(ts));
  } catch {
    // 忽略無痕或禁用 storage 環境
  }
};

/**
 * 右側全高滑出式工業回饋抽屜 (Right-Side Optical Slide-Over Panel)
 */
export default function FeedbackModal({ isOpen, onClose, scriptUrl }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [openTime, setOpenTime] = useState(Date.now());
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useOverlayLock(isOpen, onClose, { hideCursor: true, containerRef: dialogRef });

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      isSubmittingRef.current = false;
      hasUserInteractedRef.current = false;
      setOpenTime(Date.now());
      setHoneypot('');
      setStatus('idle');
      setErrorMessage('');
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
      };
    }
    return undefined;
  }, [isOpen]);

  const handleChange = (e) => {
    hasUserInteractedRef.current = true;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || status === 'submitting' || status === 'success') return;

    if (!formData.name || !formData.name.trim()) {
      setStatus('error');
      setErrorMessage('請填寫您的稱呼 / 姓名！');
      return;
    }

    if (!formData.message || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('請填寫回饋內容！');
      return;
    }

    const now = Date.now();
    const lastTs = getLastSubmitTime();
    if (now - lastTs < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - lastTs)) / 1000);
      setStatus('error');
      setErrorMessage(`送出過於頻繁，請等待 ${waitSec} 秒後再試。`);
      return;
    }

    if (honeypot || (now - openTime < 600 && !hasUserInteractedRef.current)) {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      closeTimerRef.current = setTimeout(() => {
        setStatus('idle');
        onCloseRef.current?.();
      }, 2500);
      return;
    }

    if (!scriptUrl) {
      setStatus('error');
      setErrorMessage('未設定後端 API 網址');
      return;
    }

    isSubmittingRef.current = true;
    setStatus('submitting');
    setErrorMessage('');

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const safeName = sanitizeSheetInput(formData.name.slice(0, 60));
      const safeEmail = sanitizeSheetInput(formData.email.slice(0, 100));
      const safeMessage = sanitizeSheetInput(formData.message.slice(0, 500));

      const params = new URLSearchParams();
      params.append('name', safeName);
      params.append('email', safeEmail);
      params.append('message', safeMessage);

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: params.toString(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (controller.signal.aborted) return;
      setLastSubmitTime(Date.now());
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      closeTimerRef.current = setTimeout(() => {
        setStatus('idle');
        onCloseRef.current?.();
      }, 2500);
    } catch (err) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) return;
      console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage('連線失敗，請檢查網路或稍後再試。');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          data-lenis-prevent
          className="fixed inset-0 z-[99999] flex justify-end select-none"
        >
          {/* 暗房遮罩 */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer z-0"
          />

          {/* 右側全高滑出式磨砂毛玻璃面板 */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="relative w-full max-w-lg h-full max-h-[100dvh] bg-[#060912]/62 backdrop-blur-2xl backdrop-saturate-[185%] border-l border-white/18 px-7 pt-7 sm:px-10 sm:pt-10 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[-30px_0_80px_rgba(0,0,0,0.92)] z-10 overflow-y-auto overscroll-contain flex flex-col justify-between text-left"
          >
            {/* 左緣光譜漫射細線 */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[2px]"
              style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EB4A2E 42%, #D0346C 72%, #1276B8 100%)' }}
            />

            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <h3 id="feedback-modal-title" className="font-display text-2xl font-bold text-title-white tracking-tight">
                  留下回饋
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 font-light">
                  歡迎分享您的任何想法或優化建議
                </p>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                aria-label="關閉回饋表單"
              >
                <X size={20} />
              </button>
            </div>

            {status === 'success' ? (
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="my-auto py-16 text-center flex flex-col items-center justify-center"
              >
                <div className="w-14 h-14 border border-spectral-crimson/60 bg-spectral-crimson/10 flex items-center justify-center text-spectral-crimson mb-6">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="text-xl font-semibold text-white tracking-wide">
                  感謝你的回饋
                </h4>
              </m.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 my-auto py-8" noValidate>
                <input
                  type="text"
                  name="corporate_organization"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  aria-hidden="true"
                />

                <div>
                  <label htmlFor="feedback-name" className="block text-xs tracking-wider text-zinc-400 mb-2">
                    您的稱呼 <span className="text-spectral-crimson">*</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    name="name"
                    maxLength={60}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="請輸入稱呼"
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-spectral-crimson transition-colors select-text"
                  />
                </div>

                <div>
                  <label htmlFor="feedback-email" className="block text-xs tracking-wider text-zinc-400 mb-2">
                    信箱 / LINE
                  </label>
                  <input
                    id="feedback-email"
                    type="text"
                    name="email"
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="選填，方便回覆您"
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-spectral-crimson transition-colors select-text"
                  />
                </div>

                <div>
                  <label htmlFor="feedback-message" className="block text-xs tracking-wider text-zinc-400 mb-2">
                    回饋內容 <span className="text-spectral-crimson">*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={5}
                    maxLength={500}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="請輸入想說的話..."
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-spectral-crimson transition-colors resize-none select-text"
                  />
                </div>

                {status === 'error' && (
                  <m.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 p-3.5 bg-spectral-crimson/10 border border-spectral-crimson/40 text-zinc-100 text-xs"
                  >
                    <AlertCircle size={15} className="shrink-0 text-spectral-crimson" />
                    <span>{errorMessage || '連線失敗，請檢查網路或稍後再試。'}</span>
                  </m.div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 text-xs tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    取消
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="spectral-cta flex items-center gap-2.5 px-7 py-3.5 text-xs tracking-[0.2em] disabled:opacity-50 cursor-pointer"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>傳送中...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>送出回饋</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div aria-hidden="true" className="pt-2" />
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
