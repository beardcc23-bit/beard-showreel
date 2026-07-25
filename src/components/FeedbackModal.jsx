import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, AlertCircle, Loader2, MessageSquareText } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, scriptUrl }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scriptUrl) {
      setStatus('error');
      setErrorMessage('請先設定 Google Apps Script Web App URL');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // 傳送 JSON 給 Google Apps Script Web App
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // 使用 text/plain 避免 CORS preflight 限制
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
      setErrorMessage(err.message || '連線失敗，請檢查網路或稍後再試。');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal 主體 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-xl bg-zinc-950/90 border border-white/10 p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10 overflow-hidden"
        >
          {/* 光暈點綴 */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-aurora-blue/10 rounded-full blur-3xl pointer-events-none" />

          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
            aria-label="Close Modal"
          >
            <X size={18} />
          </button>

          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-aurora-blue/10 border border-aurora-blue/30 flex items-center justify-center text-aurora-blue mb-4 shadow-[0_0_25px_rgba(0,255,255,0.2)]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">
                Feedback Received
              </h3>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
                感謝你的寶貴建議！訊息已同步發送至信箱通知。
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-sm bg-aurora-blue/10 border border-aurora-blue/20 text-aurora-blue">
                  <MessageSquareText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight uppercase">
                    Feedback / 意見回饋
                  </h3>
                  <p className="text-xs text-zinc-400">
                    有任何合作想法或網站改進建議，歡迎隨時留言！
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
                  className="w-full rounded-sm bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue/80 transition-colors duration-200"
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
                  className="w-full rounded-sm bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue/80 transition-colors duration-200"
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
                  placeholder="請分享您的寶貴想法或建議..."
                  className="w-full rounded-sm bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-aurora-blue/80 transition-colors duration-200 resize-none"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-aurora-blue text-black font-semibold text-xs mono uppercase tracking-wider hover:bg-white transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(0,255,255,0.25)]"
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
    </AnimatePresence>
  );
}
