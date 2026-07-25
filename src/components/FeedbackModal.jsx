import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, scriptUrl }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // 彈窗開啟時的背景滾動與游標處理
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
        window.dispatchEvent(new CustomEvent('show-custom-cursor'));
      };
    } else {
      document.body.style.overflow = 'unset';
      window.dispatchEvent(new CustomEvent('show-custom-cursor'));
    }
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    if (!scriptUrl) {
      setStatus('error');
      setErrorMessage('未設定後端 API 網址');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // 改用 URLSearchParams 傳送標準表單格式，對 Google Apps Script 具備 100% 相容性
      const params = new URLSearchParams();
      params.append('name', formData.name.trim());
      params.append('email', formData.email.trim());
      params.append('message', formData.message.trim());

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: params.toString(),
      });

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 2500);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage('連線失敗，請檢查網路或稍後再試。');
    }
  };

  // 使用 React Portal 傳送至 document.body 脫離父層 transform 限制
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
          onMouseEnter={() => window.dispatchEvent(new CustomEvent('hide-custom-cursor'))}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent('show-custom-cursor'))}
        >
          {/* 高級暗黑毛玻璃背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl cursor-pointer z-0"
          />

          {/* Modal 主體奢華卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 25 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg rounded-2xl bg-zinc-950/95 border border-white/10 p-6 sm:p-8 shadow-[0_0_90px_rgba(0,0,0,0.95)] z-10 overflow-hidden text-left my-auto backdrop-blur-2xl"
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
                {/* 雙層發光脈衝波紋 */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-aurora-blue/20 animate-ping duration-1000 pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-aurora-blue/10 border border-aurora-blue/50 flex items-center justify-center text-aurora-blue shadow-[0_0_35px_rgba(0,255,255,0.35)] relative z-10">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest mono">
                  FEEDBACK RECEIVED
                </h3>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed font-light">
                  感謝您的寶貴建議！訊息已成功發送並同步通知至信箱。
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Header 區塊 */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase glow-title">
                    Feedback / 留下回饋
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 font-light">
                    歡迎分享您的任何想法或優化建議
                  </p>
                </div>

                {/* 稱呼欄位 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] mono font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      Name / 您的稱呼
                    </label>
                    <span className="mono text-[9px] uppercase tracking-wider text-aurora-blue/90 font-bold">
                      (REQUIRED)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例如：Alex Chen"
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-300"
                  />
                </div>

                {/* Email / LINE 欄位 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] mono font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      Email / LINE
                    </label>
                    <span className="mono text-[9px] uppercase tracking-wider text-zinc-500">
                      (OPTIONAL)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com 或 LINE ID"
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-300"
                  />
                </div>

                {/* 留言內容欄位 */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] mono font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      Message / 回饋內容
                    </label>
                    <span className="mono text-[9px] uppercase tracking-wider text-aurora-blue/90 font-bold">
                      (REQUIRED)
                    </span>
                  </div>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="請輸入您的寶貴建議..."
                    className="w-full rounded-md bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue focus:ring-1 focus:ring-aurora-blue/40 focus:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all duration-300 resize-none"
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
                    className="group relative flex items-center gap-2 px-6 py-2.5 rounded-md bg-aurora-blue text-black font-bold text-xs mono uppercase tracking-wider hover:bg-white transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,255,0.25)] hover:shadow-[0_0_25px_rgba(0,255,255,0.45)] cursor-pointer active:scale-[0.97]"
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
