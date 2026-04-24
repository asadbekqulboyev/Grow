'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      parts: [{ text: "Salom! Men sizning shaxsiy AI Mentoringizman. Soft skill'larni rivojlantirish (masalan: vaqtni boshqarish, ommaviy nutq, muloqot madaniyati) bo'yicha qanday savollaringiz bor?" }]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load chat history from Supabase
  useEffect(() => {
    let isMounted = true;
    
    const initChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id || null;
        
        if (currentUserId && isMounted) {
          setUserId(currentUserId);
          
          const { data: dbMessages, error: dbError } = await supabase
            .from('ai_chat_messages')
            .select('*')
            .eq('user_id', currentUserId)
            .order('created_at', { ascending: true });
            
          if (!dbError && dbMessages && dbMessages.length > 0) {
            const loadedHistory = dbMessages.map(msg => ({
              id: msg.id,
              role: msg.role as 'user' | 'model',
              parts: [{ text: msg.content }]
            }));
            setMessages(loadedHistory);
          } else if (dbError) {
            console.warn("Chat tarixi yuklanmadi:", dbError.message);
          }
        }
        
        if (isMounted) setIsReady(true);
        
      } catch (err: any) {
        if (isMounted) setError(err.message || 'AI Mentorni ishga tushirishda xatolik.');
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !isReady) return;

    const userText = inputValue;
    setInputValue('');
    setError(null);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: userText }],
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Save user message to Supabase
      if (userId) {
        await supabase.from('ai_chat_messages').insert({
          user_id: userId,
          role: 'user',
          content: userText
        });
      }

      // Prepare history for API (exclude welcome message)
      const historyForAPI = updatedMessages
        .filter(m => m.id !== 'welcome')
        .slice(0, -1) // exclude the current user message (it goes as 'message')
        .map(m => ({ role: m.role, parts: m.parts }));

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyForAPI,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server xatosi');
      }

      const aiResponseMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        parts: [{ text: data.text }],
      };

      setMessages(prev => [...prev, aiResponseMsg]);
      
      // Save AI message to Supabase
      if (userId && data.text) {
        await supabase.from('ai_chat_messages').insert({
          user_id: userId,
          role: 'model',
          content: data.text
        });
      }
      
    } catch (err: any) {
      console.error('Chat xatosi:', err);
      setError("Uzur, javob olishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#111827] transition-colors duration-300 relative">
      
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 shrink-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Mentor</h2>
            <p className="text-xs text-[#2D5A27] dark:text-[#A8E6CF] font-semibold">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Warning/Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-3 px-8 flex items-center gap-3 text-red-600 dark:text-red-400">
           <AlertCircle className="w-5 h-5" />
           <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] shrink-0 border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center">
                   <span className="text-white font-bold font-serif text-sm">G</span>
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-[#2D5A27] text-white border-transparent rounded-tr-sm' 
                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-800 rounded-tl-sm'
              }`}>
                <div className={`markdown-body text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : ''} prose dark:prose-invert max-w-none`}>
                  <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center overflow-hidden">
                   <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A8E6CF] to-[#2D5A27] shrink-0 border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center">
                   <span className="text-white font-bold font-serif text-sm">G</span>
               </div>
               <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl rounded-tl-sm p-5 shadow-sm flex items-center justify-center gap-2">
                 <Loader2 className="w-5 h-5 text-[#2D5A27] dark:text-[#A8E6CF] animate-spin" />
                 <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">O&apos;ylanmoqda...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 sm:pb-0 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6] dark:from-[#111827] dark:via-[#111827] to-transparent pt-10 px-4 sm:px-8 pb-4">
         <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-end bg-white dark:bg-gray-900 rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-800 p-2 transition-colors duration-300"
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Savolingizni yozing..."
                className="w-full max-h-40 min-h-[56px] bg-transparent resize-none border-none focus:ring-0 px-6 py-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm outline-none"
                rows={1}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="w-12 h-12 shrink-0 bg-[#A8E6CF] hover:bg-[#96d5be] disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-[#2D5A27] rounded-full flex items-center justify-center m-1 shadow-sm transition-all"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-3 font-medium px-4">
              AI Mentor xato javob berishi mumkin. Foydali maslahatlarni haqiqiy holatga solishtiring.
            </p>
         </div>
      </div>
    
    </div>
  );
}
