import React from 'react';
import { 
  LayoutDashboard, Users, FileText, Receipt, CreditCard, 
  BookOpen, Building2, Bot, Workflow, ShieldCheck, 
  BarChart3, Landmark, FileCheck, HelpCircle, LogOut, Sparkles, Wallet, ShoppingBag, Cpu, Award, QrCode, Activity, Settings
} from 'lucide-react';
import { UserProfile } from '../hooks/useSupabaseAuth';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  unreadCount: number;
  userProfile?: UserProfile | null;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  unreadCount,
  userProfile,
  onSignOut
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Clientes & CRM', icon: Users },
    { id: 'account_settings', label: 'Mi Cuenta & Perfil', icon: Settings, highlight: true },
    { id: 'spei_monitor', label: 'Monitor de Cobros', icon: Activity, highlight: true },
    { id: 'reyplace_pos', label: 'Reyplace.Shop (POS)', icon: QrCode, highlight: true },
    { id: 'shop', label: 'ReyShop Store & POS', icon: ShoppingBag },
    { id: 'loyalty', label: 'Lealtad & Gamificación', icon: Award, highlight: true },
    { id: 'quotes', label: 'Cotizaciones', icon: FileText },
    { id: 'invoices', label: 'Facturas', icon: FileCheck },
    { id: 'payments', label: 'Pagos & Cobros', icon: CreditCard },
    { id: 'web3', label: 'Web3 & Blockchain', icon: Wallet },
    { id: 'receipts', label: 'Recibos & QR', icon: Receipt },
    { id: 'ledger', label: 'Ledger Contable', icon: BookOpen },
    { id: 'banking', label: 'Cuentas & Bancos', icon: Landmark },
    { id: 'ai', label: 'REY AI Assistant', icon: Bot, highlight: true },
    { id: 'emman_ai', label: 'EmmanAI Governance', icon: Cpu, highlight: true },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'credit', label: 'Crédito y Riesgo', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics y Reportes', icon: BarChart3 },
    { id: 'admin', label: 'Admin & Seguridad', icon: Building2 },
  ];

  const displayName = userProfile?.name || 'Alejandro Rey';
  const displayRole = userProfile?.role || 'OWNER';
  const displayOrg = userProfile?.organization_name || 'Rey Fintech';
  const displayAvatar = userProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/20 text-slate-950 font-extrabold text-xl">
            R
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-white flex items-center gap-1.5">
              REYPASS
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/30">PRO</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Economía Digital</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-lime-500/15 to-emerald-500/10 text-lime-300 border border-lime-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Profile & Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img 
              src={displayAvatar} 
              alt={displayName} 
              className="w-9 h-9 rounded-full object-cover border border-slate-700" 
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-lime-400 font-mono uppercase">{displayRole}</p>
            </div>
          </div>
          {onSignOut && (
            <button 
              onClick={onSignOut}
              title="Cerrar Sesión"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 truncate">{displayOrg}</span>
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </aside>
  );
};
