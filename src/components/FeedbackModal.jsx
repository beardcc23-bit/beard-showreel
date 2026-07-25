import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2, MessageSquareText } from 'lucide-react';

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scriptUrl) {
      setStatus('error');
      setErrorMessage('未設定 Google Apps Script Web App URL');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formData),
      });

      const resData = await response.json();

      if (resData.status === 'success') {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 2200);
      } else {
        throw new Error(resData.message || '傳送失敗，請稍後再試');
      }
    } catch (err) {
      console.error('Feedback submission error:', err);
      setStatus('error');
      setErrorMessage('連線失敗，請檢查網路或稍後再試。');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          onMouseEnter={() => window.dispatchEvent(new CustomEvent('hide-custom-cursor'))}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent('show-custom-cursor'))}
        >
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal 主體 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] z-10 overflow-hidden text-left"
          >
            {/* 科技細節頂部線條 */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-aurora-blue/60 to-transparent" />

            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors duration-200"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-aurora-blue/10 border border-aurora-blue/40 flex items-center justify-center text-aurora-blue mb-4 shadow-[0_0_30px_rgba(0,255,255,0.25)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                  Feedback Received
                </h3>
                <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                  感謝你的寶貴建議！訊息已成功傳送並同步通知至信箱。
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-sm bg-aurora-blue/10 border border-aurora-blue/30 text-aurora-blue">
                    <MessageSquareText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase">
                      Feedback / 留下回饋
                    </h3>
                    <p className="text-xs text-zinc-400">
                      歡迎分享您的任何想法、合作提議或優化建議
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Name / 您的稱呼
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例如：Alex Chen"
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email / 聯絡信箱
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Message / 回饋內容
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="請輸入您的寶貴建議..."
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{errorMessage || '傳送失敗，請直接寄信至 beard.cc23@gmail.com'}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-sm text-xs mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-aurora-blue text-black font-semibold text-xs mono uppercase tracking-wider hover:bg-white transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,255,0.25)] cursor-pointer"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
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
    </AnimatePresence>
  );
}
