import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';

// 本地知識庫定義，用於靜態模擬模式
const KNOWLEDGE_BASE = {
  intro: "您好！我是 Beard Chou 的 AI 導覽助理。很高興能為您服務。我可以為您介紹我的視覺合成特效作品、合作經歷或聯絡管道，您想先看哪一部分呢？",
  
  brands: `Beard 擁有超過 13 年的後期合成資歷，合作過眾多知名頂級品牌：
• **交通工具：** Audi, Foxtron, Gogoro (Pulse/JEGO/EZZY), Škoda Kodiaq, Mazda, 中華航空, 長榮航空
• **3C與家電：** Samsung (Galaxy S22, Z Fold/Flip 系列), Panasonic 全系列, Sony Xperia
• **食品與飲料：** TOBLERONE 三角巧克力, UCC 咖啡, 噶瑪蘭威士忌, 柏克金啤酒, 金門高粱, 瑞穗鮮乳, 桂格
• **生活百貨：** Foodpanda, UberEats, 犀牛盾, 新光三越, 東和鋼鐵
• **美妝健康：** 1028 睫毛膏, LUX 髮的補給, 三得利, 合利他命

想觀看這些廣告專案的特效片段嗎？可以滑動至頁面的 **「03 視覺合成」** 區段，點擊卡片直接播放！`,

  projects: `Beard 參與過超過 300 個廣告專案，代表作品包含：
• **Gogoro Pulse** - 極致的速度感與科技流光合成，展現前衛科技感。
• **Audi** - 完美融合車體反射與大氣粒子環境的合成特效。
• **TOBLERONE 三角巧克力** - 趣味而精緻的特效，細節處理得不著痕跡。
• **Samsung Galaxy S22** - 科技質感與極致光學微粒的完美結合。
• **長榮航空** - 展現壯闊天空與光影交織的宏大商業質感。

您可以在網頁的 **「03 視覺合成」** 找到這些專案的影片播放！`,

  experience: `Beard Chou 目前已累積：
• **13年+** 的後期資歷，立足於感性與理性的視覺呈現。
• **300+** 廣告專案洗禮。
• **1000+** 播放版本交付。
他擅長精準收攏導演天馬行空的想像，在有限時程內交付無可挑剔的視覺畫面。`,

  contact: `您想與 Beard 合作或交流嗎？
您可以直接滑到網頁最下方的 **「CONTACT」** 區段填寫聯絡表單。
或者透過以下管道直接聯繫他：
• **Email:** beardchou@gmail.com
我們期待您的來信！`,

  categories: `Beard 的作品主要分為以下幾大領域：
1. **食品與飲料** (如：UCC、三角巧克力、噶瑪蘭威士忌)
2. **3C與家電** (如：Samsung S22、Panasonic、Sony)
3. **交通工具** (如：Audi、Gogoro Pulse、長榮航空)
4. **生活與百貨** (如：新光三越、Foodpanda、犀牛盾)
5. **美妝與健康** (如：LUX、1028、三得利)
6. **金融與保險** (如：中國信託、台灣Pay、富達投信)

您可以輸入想了解的類別，或直接點選網頁分類標籤瀏覽！`,

  fallback: `我了解了！關於這個問題，您可以嘗試問我：
• 「你合作過哪些大品牌？」
• 「推薦一些代表作品」
• 「Beard 的後期合成經歷？」
• 「如何聯絡 Beard 進行合作？」
或者，您也可以點擊底下的快捷問答按鈕，讓我為您詳細解說！`
};

// 快捷問題清單
const QUICK_QUESTIONS = [
  { text: "🌟 合作大品牌", type: "brands" },
  { text: "🍿 代表作推薦", type: "projects" },
  { text: "⏳ Beard 的經歷", type: "experience" },
  { text: "✉️ 如何聯絡合作", type: "contact" }
];

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: KNOWLEDGE_BASE.intro, isNew: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 模擬打字流效果
  const simulateStreamingResponse = (text) => {
    setIsTyping(true);
    
    // 先加入一筆空的 assistant 訊息
    setMessages(prev => [...prev, { role: 'assistant', content: '', isNew: true }]);
    
    let currentIndex = 0;
    const intervalTime = 15; // 每個字 15 毫秒
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        const char = text[currentIndex];
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content += char;
          }
          return updated;
        });
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, intervalTime);
  };

  // 關鍵字分析匹配引擎
  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase().trim();
    
    if (input.includes('品牌') || input.includes('合作') || input.includes('公司') || input.includes('客戶') || input.includes('品牌客戶') || input.includes('大廠') || input.includes('廠商')) {
      return KNOWLEDGE_BASE.brands;
    }
    if (input.includes('作品') || input.includes('代表作') || input.includes('專案') || input.includes('推薦') || input.includes('影片') || input.includes('秀') || input.includes('showreel') || input.includes('特效')) {
      return KNOWLEDGE_BASE.projects;
    }
    if (input.includes('經歷') || input.includes('資歷') || input.includes('年資') || input.includes('經驗') || input.includes('多久') || input.includes('幾年') || input.includes('自我介紹') || input.includes('是誰') || input.includes('介紹') || input.includes('簡介')) {
      return KNOWLEDGE_BASE.experience;
    }
    if (input.includes('聯絡') || input.includes('聯繫') || input.includes('聯絡方式') || input.includes('信箱') || input.includes('email') || input.includes('mail') || input.includes('管道') || input.includes('line')) {
      return KNOWLEDGE_BASE.contact;
    }
    if (input.includes('類別') || input.includes('分類') || input.includes('食品') || input.includes('飲料') || input.includes('3c') || input.includes('車') || input.includes('汽車') || input.includes('美妝') || input.includes('金融') || input.includes('保險')) {
      return KNOWLEDGE_BASE.categories;
    }
    
    // 如果都沒匹配到，回傳備用語，但如果是特定的問候，給予溫暖回覆
    if (input.includes('你好') || input.includes('您好') || input.includes('哈囉') || input.includes('hello') || input.includes('hi')) {
      return `您好！很高興與您對話。我是 Beard 的 AI 導覽助理。您可以隨意點擊下方的快捷按鈕，或問我關於「Beard 的代表作品」、「合作過的品牌」或「如何聯絡他」。`;
    }
    
    return KNOWLEDGE_BASE.fallback;
  };

  // 發送訊息處理
  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isTyping) return;

    // 新增使用者訊息
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputValue('');

    // 模擬網絡延遲後開始回覆
    setTimeout(() => {
      const response = getBotResponse(text);
      simulateStreamingResponse(response);
    }, 600);
  };

  // 處理按下 Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {/* 聊天對話視窗 */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-[90vw] sm:w-[380px] h-[520px] rounded-[24px] overflow-hidden flex flex-col mb-4 border border-white/[0.08] shadow-2xl relative"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(5, 5, 5, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)'
            }}
          >
            {/* 對話框頂部裝飾霓虹條 */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600" />

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 relative">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Beard's AI Assistant</h3>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mono flex items-center">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                    Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all duration-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 訊息展示區 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/[0.05] scrollbar-track-transparent">
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* 頭像 */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0 mt-0.5 text-xs font-bold
                      ${msg.role === 'user' 
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {msg.role === 'user' ? 'U' : 'AI'}
                    </div>

                    {/* 氣泡 */}
                    <div 
                      className={`px-4 py-2.5 rounded-[18px] text-xs font-light leading-relaxed whitespace-pre-wrap select-text
                        ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-semibold rounded-tr-none'
                          : 'bg-white/[0.03] text-zinc-200 border border-white/[0.05] rounded-tl-none'
                        }`}
                    >
                      {msg.content}
                      {/* 流式打字的光標效果 */}
                      {msg.isNew && isTyping && index === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI 思考中動畫 */}
              {isTyping && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">
                      AI
                    </div>
                    <div className="px-4 py-3 rounded-[18px] rounded-tl-none bg-white/[0.03] border border-white/[0.05] flex space-x-1.5 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 快捷推薦按鈕區 */}
            {!isTyping && (
              <div className="px-6 py-2 flex flex-wrap gap-2 border-t border-white/[0.03] bg-black/[0.15]">
                {QUICK_QUESTIONS.map((qq, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(qq.text)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide bg-white/[0.04] hover:bg-gradient-to-r hover:from-cyan-400 hover:to-indigo-500 hover:text-black border border-white/[0.08] hover:border-cyan-400 text-zinc-300 transition-all duration-300 ease-out active:scale-95"
                  >
                    {qq.text}
                  </button>
                ))}
              </div>
            )}

            {/* 輸入欄 */}
            <div className="p-4 border-t border-white/[0.06] flex items-center space-x-2 bg-black/[0.2]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isTyping ? "AI 正在回覆中..." : "問問關於 Beard 的專案或經歷..."}
                disabled={isTyping}
                className="flex-1 bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-cyan-400 focus:bg-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all duration-300 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-indigo-500 text-cyan-400 hover:text-black border border-cyan-500/20 hover:border-cyan-400 flex items-center justify-center transition-all duration-300 ease-out active:scale-95 disabled:opacity-30 disabled:hover:bg-cyan-500/10 disabled:hover:text-cyan-400 disabled:hover:border-cyan-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 懸浮發光按鈕 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white relative group"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)'
        }}
      >
        {/* 按鈕外圈炫光 hover 特效 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 scale-110" />
        
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
