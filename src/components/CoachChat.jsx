import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { generateCoachResponse, STARTER_PROMPTS } from '../engine/coachEngine';
import { addChatMessage, getState } from '../data/store';

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function CoachChat({ assessment }) {
  const state = getState();
  const [messages, setMessages] = useState(() => {
    const saved = state.chatHistory || [];
    if (saved.length === 0) {
      return [{
        id: 0, role: 'coach',
        content: assessment
          ? `Hi! I'm **Aria**, your AI Credit Coach 👋\n\nI've analysed your profile. Your score is **${assessment.scoreTotal}/100** — ${assessment.band.label}.\n\nI'm here to help you understand every aspect of your score and create a clear path to bankability. What would you like to explore?`
          : `Hi! I'm **Aria**, your AI Credit Coach 👋\n\nComplete your credit assessment first, and I'll give you personalised insights. Head to the **Assessment** tab to get started!`,
        timestamp: new Date().toISOString(),
      }];
    }
    return saved;
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text) => {
    const msg = text.trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    addChatMessage('user', msg);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    const delay = 800 + Math.random() * 700;
    setTimeout(() => {
      const response = generateCoachResponse(msg, assessment);
      const coachMsg = { id: Date.now() + 1, role: 'coach', content: response.text, suggestions: response.suggestions, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, coachMsg]);
      addChatMessage('coach', response.text);
      setIsTyping(false);
    }, delay);
  };

  const clearChat = () => {
    const init = {
      id: 0, role: 'coach',
      content: `Chat cleared! I'm Aria — ask me anything about your credit score or how to improve it.`,
      timestamp: new Date().toISOString(),
    };
    setMessages([init]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm">Aria — AI Credit Coach</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Active • Personalised to your profile</span>
          </div>
        </div>
        <button onClick={clearChat} className="text-slate-400 hover:text-slate-600 p-1.5">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'coach' ? 'bg-gradient-to-br from-teal-500 to-teal-600' : 'bg-slate-200'}`}>
              {msg.role === 'coach' ? <Bot size={15} className="text-white" /> : <User size={15} className="text-slate-600" />}
            </div>
            <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'coach'
                  ? 'bg-white shadow-sm border border-slate-100 text-slate-700 rounded-tl-sm'
                  : 'bg-teal-600 text-white rounded-tr-sm'
              }`}
                dangerouslySetInnerHTML={{ __html: formatText(msg.content) }}
              />
              {msg.suggestions && msg.role === 'coach' && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s, i) => (
                    <button key={i} onClick={() => send(s)}
                      className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors font-medium">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts (only when few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-slate-400 mb-2 font-medium">Suggested questions:</p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => send(p)}
                className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-teal-400 hover:text-teal-700 transition-colors">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
          <input
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
            placeholder="Ask Aria anything…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          />
          <button onClick={() => send(input)} disabled={!input.trim() || isTyping}
            className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0">
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
