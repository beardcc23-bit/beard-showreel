import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// 防止 Google Sheets 試算表公式注入攻擊 (CSV / Formula Injection)
const sanitizeSheetInput = (str) => {
  if (!str) return '';
  const trimmed = str.trim();
  // 防禦字首與換行後的試算表公式觸發字元 (=, +, -, @, |, \t, \r)，強制補上前綴單引號轉義為純文字
  const safeLines = trimmed.replace(/([\r\n]+)\s*([=+@\-\t\r|])/g, "$1'$2");
  if (/^[=+@\-\t\r|]/.test(safeLines)) {
    return `'${safeLines}`;
  }
  return safeLines;
};

// 結合 sessionStorage 與記憶體的防洪計時器 (單次成功後 20 秒冷卻，防止重新整理繞過)
let lastSubmitTimestamp = 0;
const COOLDOWN_MS = 20000;
const getLastSubmitTime = () => {
  try {
    const stored = Number(sessionStorage.getItem('fb_last_ts') || 0);
    return Math.max(lastSubmitTimestamp, stored);
  } catch {
    return lastSubmitTimestamp;
  }
};
const setLastSubmitTime = (ts) => {
  lastSubmitTimestamp = ts;
  try {
    sessionStorage.setItem('fb_last_ts', String(ts));
  } catch {
    // 忽略無痕模式或禁用 storage 的情況
  }
};

export default function FeedbackModal({ isOpen, onClose, scriptUrl }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [openTime, setOpenTime] = useState(Date.now());
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimerRef = React.useRef(null);
  const isSubmittingRef = React.useRef(false);
  const abortControllerRef = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  // 彈窗開啟時的背景滾動與游標處理
  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      isSubmittingRef.current = false;
      setOpenTime(Date.now());
      setHoneypot('');
      setStatus('idle');
      setErrorMessage('');
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      // Lenis 攔截滾輪後以 scrollTo 捲動，body overflow:hidden 擋不住，需明確暫停
      window.lenis?.stop();
      window.dispatchEvent(new CustomEvent('hide-custom-cursor'));
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCloseRef.current?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('modal-open');
        window.lenis?.start();
        window.removeEventListener('keydown', handleKeyDown);
        window.dispatchEvent(new CustomEvent('show-custom-cursor'));
      };
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current || status === 'submitting' || status === 'success') return;

    // 檢查必填項目 (姓名與留言)
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

    // 防刷冷卻保護：防止短時間內重複連擊浪費 API 配額
    const now = Date.now();
    const lastTs = getLastSubmitTime();
    if (now - lastTs < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - lastTs)) / 1000);
      setStatus('error');
      setErrorMessage(`送出過於頻繁，請等待 ${waitSec} 秒後再試。`);
      return;
    }

    // 反自動化防禦：若機器人填入蜜罐欄位或表單開啟至送出少於 1 秒，靜默略過並偽裝成功
    if (honeypot || (now - openTime < 1000)) {
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
      // 消毒與長度安全截斷處理
      const safeName = sanitizeSheetInput(formData.name.slice(0, 60));
      const safeEmail = sanitizeSheetInput(formData.email.slice(0, 100));
      const safeMessage = sanitizeSheetInput(formData.message.slice(0, 500));

      // 改用 URLSearchParams 傳送標準表單格式，對 Google Apps Script 具備 100% 相容性
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

  // 使用 React Portal 傳送至 document.body 脫離父層 transform 限制
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          data-lenis-prevent
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
        >
          {/* 高級暗黑毛玻璃背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm cursor-pointer z-0"
          />

          {/* Modal 主體奢華卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/10 p-6 sm:p-8 shadow-[0_0_90px_rgba(0,0,0,0.95)] z-10 overflow-hidden text-left my-auto"
          >
            {/* 頂部極細藍色漸層飾條 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-aurora-blue to-transparent opacity-80" />

            {/* 關閉按鈕 (Hover 微妙旋轉動態) */}
            <button
              onClick={onClose}
              type="button"
              className="group absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer z-20"
              aria-label="Close Modal"
            >
              <X size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="py-12 text-center flex flex-col items-center justify-center"
              >
                {/* 雙層黃光發光脈衝波紋 */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping duration-1000 pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.45)] relative z-10">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wider">
                  感謝你的回饋
                </h3>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* 逼真偽裝的蜜罐欄位 (移至螢幕外，避開啟發式偵測，機器人填寫將觸發靜默攔截) */}
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

                {/* Header 區塊 */}
                <div className="mb-6">
                  <h3 id="feedback-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase glow-title">
                    Feedback / 留下回饋
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 font-light">
                    歡迎分享您的任何想法或優化建議
                  </p>
                </div>

                {/* 稱呼欄位 */}
                <div>
                  <label htmlFor="feedback-name" className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Name / 您的稱呼 <span className="text-aurora-blue">*</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    name="name"
                    maxLength={60}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例如：Alex Chen"
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-all duration-300"
                  />
                </div>

                {/* Email / LINE 欄位 */}
                <div>
                  <label htmlFor="feedback-email" className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email / LINE
                  </label>
                  <input
                    id="feedback-email"
                    type="text"
                    name="email"
                    maxLength={100}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com 或 LINE ID"
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-all duration-300"
                  />
                </div>

                {/* 留言內容欄位 */}
                <div>
                  <label htmlFor="feedback-message" className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Message / 回饋內容 <span className="text-aurora-blue">*</span>
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    rows={4}
                    maxLength={500}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="請輸入您的寶貴建議..."
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-all duration-300 resize-none"
                  />
                </div>

                {/* 錯誤提示氣泡 */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 p-3.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs backdrop-blur-md"
                  >
                    <AlertCircle size={15} className="shrink-0 text-rose-400" />
                    <span>{errorMessage || '連線失敗，請檢查網路或稍後再試。'}</span>
                  </motion.div>
                )}

                {/* Action 按鈕組 */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-md text-xs mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer active:scale-95"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="group relative flex items-center gap-2 px-6 py-2.5 rounded-md bg-aurora-blue text-black font-bold text-xs mono uppercase tracking-wider hover:bg-white transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(212,175,55,0.28)] hover:shadow-[0_0_25px_rgba(212,175,55,0.48)] cursor-pointer active:scale-[0.97]"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
