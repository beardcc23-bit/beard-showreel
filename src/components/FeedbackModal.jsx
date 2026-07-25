import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
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
      setErrorMessage('未設定 Google Apps Script Web App URL');
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
      }, 2200);
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onMouseEnter={() => window.dispatchEvent(new CustomEvent('hide-custom-cursor'))}
          onMouseLeave={() => window.dispatchEvent(new CustomEvent('show-custom-cursor'))}
        >
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer z-0"
          />

          {/* Modal 主體卡片 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] z-10 overflow-hidden text-left my-auto"
          >
            {/* 頂部發光飾條 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-aurora-blue to-transparent" />

            {/* 關閉按鈕 */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors duration-200 cursor-pointer z-20"
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
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-sm bg-aurora-blue/10 border border-aurora-blue/30 text-aurora-blue">
                    <MessageSquareText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase">
                      Feedback / 留下回饋
                    </h3>
                    <p className="text-xs text-zinc-400">
                      歡迎分享您的任何想法或優化建議
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Name / 您的稱呼 <span className="text-aurora-blue">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="例如：Alex Chen"
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    EMAIL / LINE
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com 或 LINE ID (選填)"
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Message / 回饋內容 <span className="text-aurora-blue">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="請輸入您的寶貴建議..."
                    className="w-full rounded-sm bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue transition-colors duration-200 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs"
                  >
                    <AlertCircle size={16} className="shrink-0 text-rose-400" />
                    <span>{errorMessage || '連線失敗，請檢查網路或稍後再試。'}</span>
                  </motion.div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-sm text-xs mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 cursor-pointer"
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
    </AnimatePresence>,
    document.body
  );
}
