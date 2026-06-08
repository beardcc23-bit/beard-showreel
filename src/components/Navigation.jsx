import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: '自我介紹', eng: 'About', href: '#introduction' },
    { name: '設計宣言', eng: 'Manifesto', href: '#about' },
    { name: '視覺合成', eng: 'Visual Synthesis', href: '#vfx' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center backdrop-blur-xl border-b border-border bg-bg-core/40 transition-colors duration-500">
        <div className="flex items-center gap-6">
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-white-or-black hover:text-aurora-blue transition focus:outline-none"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
          <div className="text-xl font-black tracking-tighter mono text-white-or-black">
            Beard<span className="text-aurora-blue"> Showreel</span>
          </div>
        </div>
        
        <div className="hidden md:flex space-x-12 text-xs font-bold uppercase tracking-widest mono">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-aurora-blue transition duration-300 relative group"
            >
              {item.eng}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-aurora-blue transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className="prism-button px-6 py-2 text-[10px] font-black uppercase tracking-widest transition duration-300 hidden md:block"
          >
            Establish Connection
          </a>
        </div>
      </nav>

      {/* 行動裝置側邊選單 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] md:hidden"
            />
            {/* 側邊選單主體 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-[80%] max-w-[320px] h-screen bg-bg-core/95 backdrop-blur-2xl z-[1000] md:hidden flex flex-col justify-center p-8 gap-10 border-r border-border"
            >
              <button
                onClick={toggleMenu}
                className="absolute top-6 right-6 text-white-or-black hover:text-aurora-blue transition"
                aria-label="Close Menu"
              >
                <X size={28} />
              </button>

              <div className="text-sm text-zinc-600 font-bold uppercase tracking-widest mono mb-4">
                // Navigate
              </div>

              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className="text-2xl font-black uppercase tracking-tighter mono text-white-or-black hover:text-aurora-blue transition duration-300 flex flex-col"
                >
                  <span className="text-[10px] text-zinc-600 font-medium tracking-widest mono">// {item.eng}</span>
                  {item.name}
                </a>
              ))}

              <div className="mt-8 border-t border-zinc-800 pt-8">
                <a
                  href="#contact"
                  onClick={toggleMenu}
                  className="prism-button block w-full py-4 text-center text-black font-bold uppercase text-xs tracking-widest"
                >
                  建立聯繫
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
