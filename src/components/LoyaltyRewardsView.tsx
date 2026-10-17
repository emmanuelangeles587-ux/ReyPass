import React, { useState } from 'react';
import { 
  Award, Sparkles, Star, Trophy, Gift, Zap, ShieldCheck, TrendingUp, 
  Store, QrCode, CheckCircle2, ChevronRight, Crown, Target, Tag
} from 'lucide-react';

interface LoyaltyRewardsViewProps {
  userEmail?: string;
}

interface RewardItem {
  id: string;
  title: string;
  merchant: string;
  pointsCost: number;
  category: string;
  image: string;
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  max: number;
  unlocked: boolean;
  icon: string;
}

export const LoyaltyRewardsView: React.FC<LoyaltyRewardsViewProps> = ({ 
  userEmail = 'soporte.reyplace@gmail.com' 
}) => {
  const [userPoints, setUserPoints] = useState<number>(3450);
  const [userTier, setUserTier] = useState<'ORO' | 'PLATINO' | 'VIP'>('PLATINO');
  const [activeTab, setActiveTab] = useState<'rewards' | 'badges' | 'merchants' | 'history'>('rewards');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [rewards, setRewards] = useState<RewardItem[]>([
    {
      id: 'rw_1',
      title: '20% de Descuento en Consumo Local',
      merchant: 'Café & Bistro Reyplace',
      pointsCost: 800,
      category: 'Gastronomía',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400'
    },
    {
      id: 'rw_2',
      title: 'Envío Gratis en Pedidos ReyShop',
      merchant: 'Red Logística ReyLogistics',
      pointsCost: 500,
      category: 'Logística',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'
    },
    {
      id: 'rw_3',
      title: 'Acceso VIP a Sala de Coworking Financiero',
      merchant: 'Rey Fintech Hub',
      pointsCost: 1500,
      category: 'Experiencias',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
    },
    {
      id: 'rw_4',
      title: 'Cashback del 5% en Próxima Factura SPEI',
      merchant: 'Reywallet Core',
      pointsCost: 2000,
      category: 'Finanzas',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400'
    }
  ]);

  const [badges, setBadges] = useState<BadgeItem[]>([
    {
      id: 'bg_1',
      title: 'Explorador Gastronómico',
      description: 'Paga en 3 comercios gastronómicos locales diferentes este mes.',
      progress: 3,
      max: 3,
      unlocked: true,
      icon: '🍕'
    },
    {
      id: 'bg_2',
      title: 'Pionero Web3 & SPEI',
      description: 'Realiza 5 transacciones combinando pagos QR y liquidaciones en red.',
      progress: 5,
      max: 5,
      unlocked: true,
      icon: '⚡'
    },
    {
      id: 'bg_3',
      title: 'Rey del Cashback',
      description: 'Acumula más de 5,000 Puntos Reyplace en el trimestre.',
      progress: 3450,
      max: 5000,
      unlocked: false,
      icon: '👑'
    },
    {
      id: 'bg_4',
      title: 'Comprador Frecuente Local',
      description: 'Visita el mismo comercio aliado 4 veces en el mismo mes.',
      progress: 2,
      max: 4,
      unlocked: false,
      icon: '🏬'
    }
  ]);

  const handleRedeem = (reward: RewardItem) => {
    if (userPoints < reward.pointsCost) {
      setSuccessMessage(`Puntos insuficientes. Necesitas ${reward.pointsCost} Puntos Reyplace.`);
      setTimeout(() => setSuccessMessage(null), 3500);
      return;
    }

    setUserPoints(prev => prev - reward.pointsCost);
    setSuccessMessage(`¡Recompensa "${reward.title}" canjeada con éxito! Cupón enviado a tu perfil.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Notification Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-lime-500/50 text-lime-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-lime-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header & Tier Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-lime-500/20 text-2xl">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">Reyplace Rewards & Gamification</h1>
              <span className="px-3 py-0.5 rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30 text-[11px] font-mono font-bold uppercase">
                Nivel {userTier}
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-1">
              Programa de lealtad integrado con pagos SPEI / QR en comercios locales de la red.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl relative z-10">
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono block">Puntos Disponibles</span>
            <span className="text-2xl font-black text-lime-400 font-mono">{userPoints.toLocaleString()} PTS</span>
          </div>
          <div className="w-px h-10 bg-slate-800"></div>
          <div className="text-left font-mono text-[11px] text-slate-300">
            <span className="text-emerald-400 font-bold block">Cashback 3.5%</span>
            <span>Activo en red local</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rewards' ? 'bg-lime-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Canjear Recompensas</span>
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'badges' ? 'bg-lime-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Logros & Badges</span>
        </button>
        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'merchants' ? 'bg-lime-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Mapa de Comercios Destacados</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-lime-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Historial de Puntos</span>
        </button>
      </div>

      {/* TAB 1: Rewards Catalog */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewards.map((rw) => (
            <div key={rw.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-lime-500/50 transition-all">
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img src={rw.image} alt={rw.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-800 text-lime-400 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold">
                    {rw.category}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-xs text-slate-400 font-mono block">{rw.merchant}</span>
                  <h3 className="font-bold text-white text-sm leading-snug">{rw.title}</h3>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-4">
                <span className="font-mono text-lime-400 font-black text-sm">
                  {rw.pointsCost} PTS
                </span>
                <button
                  onClick={() => handleRedeem(rw)}
                  className="bg-slate-800 hover:bg-lime-500 hover:text-slate-950 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer border border-slate-700"
                >
                  Canjear
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Badges & Gamification */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {badges.map((bg) => (
            <div key={bg.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                {bg.icon}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{bg.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    bg.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {bg.unlocked ? '✓ DESBLOQUEADO' : `${bg.progress} / ${bg.max}`}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{bg.description}</p>

                {!bg.unlocked && (
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-lime-400 h-full rounded-full transition-all"
                      style={{ width: `${(bg.progress / bg.max) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Featured Merchants & Monetization */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-lime-400" /> Comercios Aliados con Patrocinio Destacado
              </h3>
              <p className="text-xs text-slate-400 font-mono">Los negocios pagan una pequeña cuota mensual para aparecer en los primeros pines del mapa.</p>
            </div>

            <button 
              onClick={() => setSuccessMessage('¡Solicitud de patrocinio de comercio enviada al equipo comercial de Reyplace!')}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
            >
              Destacar mi Comercio ($499 MXN/mes)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-lime-500/40 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <span className="absolute top-4 right-4 bg-lime-500 text-slate-950 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                ★ DESTACADO VIP
              </span>
              <div className="w-12 h-12 rounded-2xl bg-lime-500/10 text-lime-400 flex items-center justify-center font-bold">
                ☕
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Café & Bistro Reyplace</h4>
                <p className="text-xs text-slate-400 font-mono">Zona Financiera • 4.9 ★ (1,240 pagos SPEI)</p>
              </div>
              <p className="text-xs text-slate-300">Ofrece 2x1 en café y 5% de cashback instantáneo pagando con QR Reyplace.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                🛒
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Supermercado Express Norte</h4>
                <p className="text-xs text-slate-400 font-mono">Av. Insurgentes • 4.8 ★ (890 pagos)</p>
              </div>
              <p className="text-xs text-slate-300">Aliado con patrocinios de marcas de consumo masivo.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Tecnología & Servidores S.A.</h4>
                <p className="text-xs text-slate-400 font-mono">Polanco • 4.9 ★ (410 pagos)</p>
              </div>
              <p className="text-xs text-slate-300">Facturación automática CFDI 4.0 en cada transacción.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Points History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl font-mono text-xs">
          <h3 className="text-sm font-bold text-white mb-2">Historial de Acumulación y Canje</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Pago SPEI en Café & Bistro Reyplace</span>
                <span className="text-[11px] text-slate-400">Hace 2 horas • QR Dinámico #REF-88910</span>
              </div>
              <span className="text-lime-400 font-bold text-sm">+150 PTS</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Canje de Cupón Descuento 20%</span>
                <span className="text-[11px] text-slate-400">Ayer • Cafetería Aliada</span>
              </div>
              <span className="text-rose-400 font-bold text-sm">-800 PTS</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Logro Desbloqueado: Pionero Web3</span>
                <span className="text-[11px] text-slate-400">Hace 3 días • Bono de Bienvenida</span>
              </div>
              <span className="text-lime-400 font-bold text-sm">+500 PTS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
