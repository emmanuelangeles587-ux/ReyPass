import React, { useState } from 'react';
import { Search, Bell, Shield, Sparkles, Building2, CheckCircle2, AlertCircle, X, ChevronDown, LogOut } from 'lucide-react';
import { NotificationItem, Organization } from '../types';
import { WorkspaceIntegrityEmblem } from './WorkspaceIntegrityEmblem';
import { UserProfile } from '../hooks/useSupabaseAuth';

interface TopbarProps {
  organization: Organization;
  organizations: Organization[];
  activeOrganizationId: string;
  onSwitchOrganization: (id: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onQuickAction: (action: string) => void;
  userProfile?: UserProfile | null;
  onSignOut?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  organization, organizations, activeOrganizationId, onSwitchOrganization, 
  notifications, onMarkNotificationRead, onQuickAction,
  userProfile, onSignOut
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;
  const userEmail = userProfile?.email || 'soporte.reyplace@gmail.com';
  const userName = userProfile?.name || 'Alejandro Rey';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <button
          onClick={() => setShowSearch(true)}
          className="w-full max-w-xs bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm flex items-center justify-between transition-all shadow-inner cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">Buscar clientes, facturas, pagos...</span>
          </div>
          <kbd className="bg-slate-800 text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700 shrink-0">⌘K</kbd>
        </button>

        {/* Dynamic Anti-Spoofing User Emblem & Watermark */}
        <div className="hidden xl:block">
          <WorkspaceIntegrityEmblem userEmail={userEmail} userName={userName} />
        </div>
      </div>



      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => onQuickAction('new_invoice')}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
          >
            <span>+ Nueva Factura</span>
          </button>
          <button 
            onClick={() => onQuickAction('new_payment')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          >
            <span>Registrar Pago</span>
          </button>
        </div>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowOrgDropdown(false); }}
            className="relative p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-lime-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Notificaciones Financieras</h3>
                <span className="text-xs font-mono text-lime-400">{unreadCount} nuevas</span>
              </div>
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay notificaciones</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        n.read ? 'bg-slate-950/40 border-slate-800/60 opacity-70' : 'bg-slate-800/40 border-lime-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-white">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-lime-400"></span>}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="relative hidden lg:block">
          <button
            onClick={() => { setShowOrgDropdown(!showOrgDropdown); setShowNotifications(false); }}
            className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-lime-400" />
            <span className="text-xs font-semibold text-slate-200">{organization.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Cambiar Organización</p>
              </div>
              <div className="space-y-1">
                {organizations.map((org) => {
                  const isActive = org.id === activeOrganizationId;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        onSwitchOrganization(org.id);
                        setShowOrgDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
                        <span>{org.name}</span>
                      </div>
                      {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal (Command Palette) */}
      {showSearch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-lime-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca clientes, facturas, pagos, cotizaciones..."
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
                autoFocus
              />
              <button 
                onClick={() => setShowSearch(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs font-mono text-slate-500">ACCESOS RÁPIDOS RECOMENDADOS</p>
              <div className="space-y-1">
                <div onClick={() => setShowSearch(false)} className="p-2.5 hover:bg-slate-800/80 rounded-xl cursor-pointer text-sm text-slate-200 flex items-center justify-between">
                  <span>Listado de Facturas Activas</span>
                  <span className="text-xs font-mono text-lime-400">⌘1</span>
                </div>
                <div onClick={() => setShowSearch(false)} className="p-2.5 hover:bg-slate-800/80 rounded-xl cursor-pointer text-sm text-slate-200 flex items-center justify-between">
                  <span>Ledger y Movimientos Contables</span>
                  <span className="text-xs font-mono text-lime-400">⌘2</span>
                </div>
                <div onClick={() => setShowSearch(false)} className="p-2.5 hover:bg-slate-800/80 rounded-xl cursor-pointer text-sm text-slate-200 flex items-center justify-between">
                  <span>Asistente REY AI</span>
                  <span className="text-xs font-mono text-lime-400">⌘3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
