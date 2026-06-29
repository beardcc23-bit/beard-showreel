import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function Contact() {
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
          className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase mb-16 glow-title whitespace-nowrap"
        >
          Let's <span className="text-aurora-blue">Connect</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-zinc-300 mb-20 font-light text-lg max-w-xl mx-auto leading-relaxed"
        >
          隨時歡迎來信交流，探討影像的更多可能。
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center items-center"
        >
          <a
            href="mailto:beard.cc23@gmail.com"
            className="group flex items-center gap-6 text-xl font-bold hover:text-aurora-blue transition duration-300"
          >
            <span className="bg-aurora-blue text-black p-4 rounded-sm group-hover:bg-white transition-colors duration-300 flex items-center justify-center">
              <Mail size={20} />
            </span>
            <span className="mono text-sm tracking-wider text-zinc-300 group-hover:text-aurora-blue transition-colors duration-300">
              beard.cc23@gmail.com
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
