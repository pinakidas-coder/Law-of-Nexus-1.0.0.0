import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Scale, Loader2, Calendar } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: t('chat.welcome') }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are a legal assistant for LAW OF NEXUS (Advocate Debdip Mandal). Answer professionally and guide users to book appointments. Be concise and helpful. Do not mention any specific consultation fees. Answer in the language the user is using (Bengali or English).",
        }
      });

      const reply = response.text || t('chat.error');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      let errorMessage = t('chat.error');
      
      // Check for specific API errors
      if (error && typeof error === 'object') {
        const errorString = JSON.stringify(error) + error.message;
        if (errorString.includes('403') || errorString.includes('PERMISSION_DENIED')) {
          errorMessage = "It looks like your API key is missing permissions. Please check the API key in the **Settings > Secrets** panel and make sure the Generative Language API is enabled for it.";
        } else if (errorString.includes('400') || errorString.includes('API_KEY_INVALID')) {
          errorMessage = "Your API key is invalid or missing. Please check your **Settings > Secrets** panel.";
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="legal-gradient p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-gold-500" />
                <div>
                  <h3 className="text-sm font-bold font-serif">{t('chat.title')}</h3>
                  <p className="text-[10px] text-gold-400 uppercase tracking-widest">{t('hero.title')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-neutral-900 text-white rounded-tr-none' 
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-neutral-200 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-gold-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-neutral-100">
              <Link 
                to="/appointment" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center space-x-2 w-full mb-3 py-2 bg-gold-50 text-gold-700 rounded-lg text-xs font-bold border border-gold-200 hover:bg-gold-100 transition-colors"
              >
                <Calendar className="h-3 w-3" />
                <span>{t('nav.appointment')}</span>
              </Link>
              <form onSubmit={handleSend} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chat.placeholder')}
                  className="flex-grow p-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none"
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-neutral-950 text-white p-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gold-600 text-white p-4 rounded-full shadow-2xl hover:bg-gold-700 transition-all hover:scale-110 flex items-center justify-center border-4 border-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
