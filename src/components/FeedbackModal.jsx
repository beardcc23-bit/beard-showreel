import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from './common/Icons';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { emilSpring } from '../utils/motion';

const FORMULA_PREFIX_RE = /^[=+@\-\t\r|＝＋－＠｜]/;
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g;

const isIncompleteEmail = (val) => {
  const trimmed = (val || '').trim();
  return trimmed.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const isValidGasUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'https:' &&
      !parsed.username &&
      !parsed.password &&
      parsed.hostname.toLowerCase() === 'script.google.com' &&
      parsed.pathname.startsWith('/macros/s/')
    );
  } catch {
    return false;
  }
};

const sanitizeSheetInput = (str) => {
  if (!str) return '';
  const cleaned = str.replace(CONTROL_CHARS_RE, '').trim();
  const safeLines = cleaned.replace(/([\r\n]+)\s*([=+@\-\t\r|＝＋－＠｜])/g, "$1'$2");
  if (FORMULA_PREFIX_RE.test(safeLines)) {
    return `'${safeLines}`;
  }
  return safeLines;
};

let lastSubmitTimestamp = 0;
const COOLDOWN_MS = 20000;
const COOLDOWN_STORAGE_KEY = 'fb_last_ts';
const DRAFT_STORAGE_KEY = 'fb_draft_v1';

const getLastSubmitTime = () => {
  try {
    const stored = Number(sessionStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
    const validStored = Number.isFinite(stored) && stored <= Date.now() ? stored : 0;
    return Math.max(lastSubmitTimestamp, validStored);
  } catch {
    return lastSubmitTimestamp;
  }
};
const setLastSubmitTime = (ts) => {
  lastSubmitTimestamp = ts;
  try {
    sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(ts));
  } catch {
    // 忽略無痕或禁用 storage 環境
  }
};

const readDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return { name: '', email: '', message: '' };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed?.name === 'string' ? parsed.name.slice(0, 60) : '',
      email: typeof parsed?.email === 'string' ? parsed.email.slice(0, 100) : '',
      message: typeof parsed?.message === 'string' ? parsed.message.slice(0, 500) : '',
    };
  } catch {
    return { name: '', email: '', message: '' };
  }
};

const writeDraft = (nextForm) => {
  try {
    if (!nextForm.name && !nextForm.email && !nextForm.message) {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } else {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextForm));
    }
  } catch {
    // 忽略無痕限制
  }
};

/**
 * 右側全高滑出式工業回饋抽屜 (Right-Side Optical Slide-Over Panel)
 */
export default function FeedbackModal({ isOpen, onClose, scriptUrl }) {
  const [formData, setFormData] = useState(readDraft);
  const [honeypot, setHoneypot] = useState('');
  const [openTime, setOpenTime] = useState(Date.now());
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  const hadRestoredDraftRef = useRef(false);
  const abortControllerRef = useRef(null);
  const dialogRef = useRef(null);
  const swipeStartRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleSafeClose = useCallback(() => {
    if (isSubmittingRef.current || status === 'submitting') return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    onCloseRef.current?.();
  }, [status]);

  useOverlayLock(isOpen, handleSafeClose, {
    containerRef: dialogRef,
    initialFocusSelector: formData.name.trim() ? '#feedback-message' : '#feedback-name',
  });

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      const restored = readDraft();
      setFormData(restored);
      isSubmittingRef.current = false;
      hasUserInteractedRef.current = false;
      hadRestoredDraftRef.current = Boolean(restored.name.trim() || restored.message.trim());
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
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    writeDraft(next);
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
      dialogRef.current?.querySelector('#feedback-name')?.focus();
      return;
    }

    if (isIncompleteEmail(formData.email)) {
      setStatus('error');
      setErrorMessage('信箱格式似乎不完整，請確認後再送出（或直接填寫 LINE ID）。');
      dialogRef.current?.querySelector('#feedback-email')?.focus();
      return;
    }

    if (!formData.message || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('請填寫訊息內容！');
      dialogRef.current?.querySelector('#feedback-message')?.focus();
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

    if (
      honeypot ||
      (now - openTime < 600 && !hasUserInteractedRef.current && !hadRestoredDraftRef.current)
    ) {
      setStatus('success');
      const cleared = { name: '', email: '', message: '' };
      setFormData(cleared);
      writeDraft(cleared);
      closeTimerRef.current = setTimeout(() => {
        setStatus('idle');
        onCloseRef.current?.();
      }, 2500);
      return;
    }

    if (!isValidGasUrl(scriptUrl)) {
      setStatus('error');
      setErrorMessage('未設定有效之後端 API 網址');
      return;
    }

    isSubmittingRef.current = true;
    setStatus('submitting');
    setErrorMessage('');

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, 12000);

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
      const cleared = { name: '', email: '', message: '' };
      setFormData(cleared);
      writeDraft(cleared);
      closeTimerRef.current = setTimeout(() => {
        setStatus('idle');
        onCloseRef.current?.();
      }, 2500);
    } catch (err) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted && !didTimeout) return;
      if (!didTimeout) console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage(
        didTimeout ? '連線逾時，請檢查網路或稍後再試。' : '連線失敗，請檢查網路或稍後再試。'
      );
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
          {/* 暗房遮罩（傳送中鎖定防誤觸中斷請求） */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleSafeClose}
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-0 ${
              status === 'submitting' ? 'cursor-wait' : 'cursor-pointer'
            }`}
          />

          {/* 右側全高滑出式磨砂毛玻璃面板（支援非輸入框區向右滑動直覺收合） */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={emilSpring.drawer}
            onTouchStart={(e) => {
              const tag = e.target?.tagName;
              if (tag === 'INPUT' || tag === 'TEXTAREA') {
                swipeStartRef.current = null;
                return;
              }
              const t = e.touches?.[0];
              if (t) swipeStartRef.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = swipeStartRef.current;
              swipeStartRef.current = null;
              const t = e.changedTouches?.[0];
              if (!start || !t) return;
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              if (dx > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                handleSafeClose();
              }
            }}
            className="optical-frosted-drawer relative w-full max-w-lg h-full max-h-[100dvh] bg-[#060912]/62 backdrop-blur-2xl backdrop-saturate-[185%] border-l border-white/18 px-7 pt-7 sm:px-10 sm:pt-10 pb-[calc(2rem+env(safe-area-inset-bottom))] shadow-[-30px_0_80px_rgba(0,0,0,0.92)] z-10 overflow-y-auto overscroll-contain flex flex-col justify-between text-left"
          >
            {/* 左緣光譜漫射細線 */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[2px] spectral-bar-v"
            />

            <div className="flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <h3 id="feedback-modal-title" className="font-display text-2xl font-bold text-title-white tracking-tight">
                  傳送訊息
                </h3>
                <p className="text-xs text-zinc-400 mt-1.5 font-light">
                  歡迎專案合作洽詢、職務邀約或交流想法
                </p>
              </div>

              <button
                onClick={handleSafeClose}
                disabled={status === 'submitting'}
                type="button"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-1 focus-visible:ring-spectral-crimson"
                aria-label="關閉聯繫表單"
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
                  訊息已送出，我將盡快與您聯繫
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
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={status === 'error' && !formData.name.trim() ? 'true' : undefined}
                    maxLength={60}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="請輸入稱呼"
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.06] focus:border-spectral-crimson/85 focus:shadow-[inset_0_0_16px_rgba(235,74,46,0.08)] transition-[background-color,border-color,box-shadow] select-text"
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
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={
                      status === 'error' && isIncompleteEmail(formData.email) ? 'true' : undefined
                    }
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="選填，方便回覆您"
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.06] focus:border-spectral-crimson/85 focus:shadow-[inset_0_0_16px_rgba(235,74,46,0.08)] transition-[background-color,border-color,box-shadow] select-text"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <label htmlFor="feedback-message" className="block text-xs tracking-wider text-zinc-400">
                      訊息內容 <span className="text-spectral-crimson">*</span>
                    </label>
                    <span
                      className={`mono text-[11px] tabular-nums transition-colors ${
                        formData.message.length >= 450 ? 'text-dawn-gold' : 'text-zinc-500'
                      }`}
                      aria-live="off"
                    >
                      {formData.message.length} / 500
                    </span>
                  </div>
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={5}
                    aria-required="true"
                    aria-invalid={
                      status === 'error' && !formData.message.trim() ? 'true' : undefined
                    }
                    maxLength={500}
                    value={formData.message}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        handleSubmit(e);
                      }
                    }}
                    placeholder="請輸入合作需求、職務資訊或想交流的內容..."
                    className="w-full bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:bg-white/[0.06] focus:border-spectral-crimson/85 focus:shadow-[inset_0_0_16px_rgba(235,74,46,0.08)] transition-[background-color,border-color,box-shadow] resize-none select-text"
                  />
                </div>

                {status === 'error' && (
                  <m.div
                    role="alert"
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
                    onClick={handleSafeClose}
                    disabled={status === 'submitting'}
                    className="px-5 py-3 text-xs tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                        <span>傳送訊息</span>
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
