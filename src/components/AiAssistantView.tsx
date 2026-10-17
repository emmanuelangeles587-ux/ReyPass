import React, { useState } from 'react';
import { Bot, Sparkles, Send, User, ArrowRight } from 'lucide-react';

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; source?: string }>>([
    {
      role: 'assistant',
      text: 'Hola soy **REY AI**, tu asistente financiero corporativo. Estoy conectado a los registros de REYWALLET. ¿En qué puedo ayudarte hoy?',
      source: 'Sistema operativo inicializado correctamente.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    '¿Cuánto cobré este mes?',
    '¿Cuánto tengo pendiente de cobrar?',
    '¿Qué clientes tienen facturas vencidas?',
    '¿Cuál es mi ticket promedio?'
  ];

  const handleSend = async (queryText?: string) => {
    const promptToSend = queryText || input;
    if (!promptToSend.trim()) return;

    const userMsg = { role: 'user' as const, text: promptToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToSend })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply, source: data.source }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión con REY AI server.', source: 'Error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-4rem)] flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-lime-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            REY AI Assistant
            <span className="text-xs bg-lime-500/20 text-lime-400 px-2 py-0.5 rounded font-mono border border-lime-500/30">GEMINI 2.5 FLASH</span>
          </h2>
          <p className="text-sm text-slate-400">Asistente operativo inteligente con control estricto sobre datos financieros reales.</p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="py-4 flex flex-wrap gap-2">
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sp)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-lime-500/40 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-lime-400" />
            <span>{sp}</span>
          </button>
        ))}
      </div>

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-lime-500 text-slate-950 font-medium rounded-tr-none' 
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg'
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.source && m.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <span className="text-lime-400 font-bold">Fuente: </span> {m.source}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono py-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
            REY AI analizando base de datos y calculando métricas...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-4 border-t border-slate-800 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Pregunta sobre ingresos, facturación, clientes o morosidad..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-lime-500 outline-none"
        />
        <button
          type="submit"
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <span>Enviar</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
