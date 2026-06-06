import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-32 border-t border-zinc-900 bg-bg-core/50">
      {/* 科技光點背景 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-9xl font-black tracking-tighter uppercase mb-16 glow-title"
        >
          Let's <span className="text-aurora-blue">Sync</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-zinc-300 mb-20 font-light text-lg max-w-xl mx-auto leading-relaxed"
        >
          無論是追求極致視覺的合成專案，還是需要邏輯與美感並行的 UI/UX 設計，我隨時準備好與你共同構建未來體驗。
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row gap-12 justify-center items-center"
        >
          <a
            href="mailto:your-email@example.com"
            className="group flex items-center gap-6 text-xl font-bold hover:text-aurora-blue transition duration-300"
          >
            <span className="bg-aurora-blue text-black p-4 rounded-sm group-hover:bg-white transition-colors duration-300 flex items-center justify-center">
              <Mail size={20} />
            </span>
            <span className="mono text-sm uppercase tracking-wider text-zinc-300 group-hover:text-aurora-blue transition-colors duration-300">
              your-email@example.com
            </span>
          </a>
          
          <div className="hidden md:block w-px h-8 bg-zinc-800" />
          
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-6 text-xl font-bold hover:text-aurora-blue transition duration-300"
          >
            <span className="bg-aurora-blue text-black p-4 rounded-sm group-hover:bg-white transition-colors duration-300 flex items-center justify-center">
              <Linkedin size={20} />
            </span>
            <span className="mono text-sm uppercase tracking-wider text-zinc-300 group-hover:text-aurora-blue transition-colors duration-300">
              LinkedIn Professional
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
