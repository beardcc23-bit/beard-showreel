import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Copy, Check, MessageSquareText } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const email = 'beard.cc23@gmail.com';

  // 部署好的 Google Apps Script Web App URL (最新有效部署網址)
  const GAS_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbyqnxsdu2s0De5mrIKdmeharnJiy__hLyRyAnhZKzKjEDmXoCjUQYHrlUmmvShbnS7O/exec';



  const handleCopyEmail = (e) => {
    // 寫入剪貼簿
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden py-32 bg-bg-core/50">
      {/* 科技光點背景 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[46px] md:text-9xl font-black tracking-tighter uppercase mb-16 glow-title whitespace-nowrap w-full flex justify-center"
        >
          Let's <span className="text-aurora-blue">Connect</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-zinc-300 mb-16 font-light text-sm sm:text-lg max-w-xl mx-auto leading-relaxed"
        >
          隨時歡迎來信交流，探討影像與設計的更多可能。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Email 複製按鈕 (不觸發預設郵件軟體彈窗) */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="group flex items-center gap-4 w-full sm:w-[330px] px-6 py-4 rounded-sm bg-white/[0.03] border border-white/10 hover:border-aurora-blue/80 transition-all duration-300 backdrop-blur-md shadow-xl hover:-translate-y-0.5 cursor-pointer justify-start text-left"
              title="點擊複製 Email 地址"
            >
              <span className={`p-2.5 rounded-sm transition-colors duration-300 flex items-center justify-center shrink-0 ${copied ? 'bg-aurora-blue text-black shadow-[0_0_15px_rgba(0,255,255,0.35)]' : 'bg-aurora-blue text-black group-hover:bg-white'}`}>
                {copied ? <Check size={18} /> : <Mail size={18} />}
              </span>

              <span className="mono text-sm sm:text-base tracking-wider text-zinc-200 group-hover:text-aurora-blue transition-colors duration-300 truncate">
                {email}
              </span>
            </button>

            {/* 回饋按鈕 */}
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="group flex items-center gap-4 w-full sm:w-[330px] px-6 py-4 rounded-sm bg-white/[0.03] border border-white/10 hover:border-aurora-blue/80 transition-all duration-300 backdrop-blur-md shadow-xl hover:-translate-y-0.5 cursor-pointer justify-start"
            >
              <span className="p-2.5 rounded-sm bg-aurora-blue text-black flex items-center justify-center shrink-0 group-hover:bg-white transition-colors duration-300">
                <MessageSquareText size={18} />
              </span>
              <span className="mono text-sm sm:text-base tracking-wider text-zinc-200 group-hover:text-aurora-blue transition-colors duration-300 whitespace-nowrap">
                FEEDBACK / 留下回饋
              </span>
            </button>
          </div>


          {/* 複製成功 HUD Toast 視覺提示 */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-950/95 border border-aurora-blue/40 text-aurora-blue shadow-[0_0_20px_rgba(0,255,255,0.18)] backdrop-blur-xl select-none"
              >
                <Check size={12} />
                <span className="mono text-[10px] uppercase tracking-widest font-black">
                  COPIED TO CLIPBOARD // 成功複製 EMAIL
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 回饋 Modal 彈窗 */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        scriptUrl={GAS_SCRIPT_URL}
      />
    </section>
  );
}

