// src/modules/cmeGenerator/pages/ChatView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatCommand } from '../services/claudeService';
import { useCme } from '../context/CmeContext';
import type { ChatMessage } from '../types';

interface ChatViewProps { selectedId: string | null }

export function ChatView({ selectedId }: ChatViewProps) {
  const { state, getEffectiveResult, dispatch } = useCme();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const result = selectedId ? getEffectiveResult(selectedId) : null;
  const history = selectedId ? (state.chatHistory.get(selectedId) ?? []) : [];

  useEffect(() => {
    setLocalMessages(history);
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  async function send() {
    if (!input.trim() || !selectedId || !result || busy) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...localMessages, userMsg];
    setLocalMessages(newMessages);
    dispatch({ type: 'ADD_CHAT_MSG', payload: { id: selectedId, msg: userMsg } });
    setInput('');
    setBusy(true);

    try {
      const { mensagem, alteracoes } = await chatCommand(selectedId, userMsg.content, result, history);
      const aiMsg: ChatMessage = { role: 'assistant', content: mensagem, timestamp: new Date().toISOString() };
      setLocalMessages(prev => [...prev, aiMsg]);
      dispatch({ type: 'ADD_CHAT_MSG', payload: { id: selectedId, msg: aiMsg } });
      if (Object.keys(alteracoes).length > 0) {
        dispatch({ type: 'APPLY_OVERRIDE', payload: { id: selectedId, changes: alteracoes } });
      }
    } catch (e) {
      const errMsg: ChatMessage = { role: 'assistant', content: `Erro: ${String(e)}`, timestamp: new Date().toISOString() };
      setLocalMessages(prev => [...prev, errMsg]);
    } finally {
      setBusy(false);
    }
  }

  if (!selectedId || !result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-4">
        <Bot size={48} className="opacity-30" />
        <p className="text-sm">Clique em um elemento na aba Computo para iniciar o chat</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Context banner */}
      <div className="px-6 py-3 border-b border-white/5 bg-[#0F3460]/20">
        <p className="text-xs text-white/40 uppercase tracking-widest">Elemento selecionado</p>
        <p className="text-white font-bold text-sm truncate">{result.descrizioneElemento}</p>
        <p className="text-white/40 text-xs">{result.edificio} / {result.livello} · €{result.total.toFixed(2)} · {result.status}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {localMessages.length === 0 && (
          <div className="text-center text-white/30 text-sm pt-8">
            <p>Pergunte sobre este elemento ou corrija os dados.</p>
            <p className="text-xs mt-2 text-white/20">Ex: "Muda o valore para 3.50" · "Por que está ALERT?" · "Dobra a quantidade"</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {localMessages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'user' ? 'bg-[#E94560]/20 border border-[#E94560]/30' : 'bg-white/10 border border-white/10'}`}>
                {msg.role === 'user' ? <User size={14} className="text-[#E94560]" /> : <Bot size={14} className="text-white/60" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-[#E94560]/15 border border-[#E94560]/20 text-white ml-auto'
                  : 'bg-white/5 border border-white/10 text-white/80'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <Bot size={14} className="text-white/60" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-white/5">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={busy}
            placeholder="Digite um comando ou pergunta..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E94560]/40"
          />
          <button
            onClick={send}
            disabled={busy || !input.trim()}
            className="w-12 h-12 bg-gradient-to-br from-[#0F3460] to-[#E94560] rounded-xl flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
