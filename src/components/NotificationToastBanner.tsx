import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, X, Sparkles, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationToastBannerProps {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({ 
  notifications, onMarkRead, onNavigate 
}) => {
  const unreadAlerts = notifications.filter(n => !n.read);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (unreadAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % unreadAlerts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [unreadAlerts.length]);

  if (unreadAlerts.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Sistema al día. Sin alertas financieras pendientes de revisión.</span>
        </div>
        <span className="font-mono text-[10px] text-lime-400">SECURE RLS ACTIVE</span>
      </div>
    );
  }

  const currentAlert = unreadAlerts[currentIndex] || unreadAlerts[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-lime-500/30 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shrink-0">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-lime-400 font-bold uppercase">ALERTA FINANCIERA • {currentIndex + 1} de {unreadAlerts.length}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-0.5">{currentAlert.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5">{currentAlert.message}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onNavigate('invoices')}
          className="bg-slate-800 hover:bg-slate-700 text-lime-400 border border-lime-500/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Revisar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMarkRead(currentAlert.id)}
          className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Marcar como leída"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
