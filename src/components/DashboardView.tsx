import React from 'react';
import { 
  DollarSign, TrendingUp, Users, FileCheck, ArrowUpRight, 
  ArrowDownRight, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus 
} from 'lucide-react';
import { Customer, Invoice, Payment, Quote, NotificationItem } from '../types';
import { NotificationToastBanner } from './NotificationToastBanner';

interface DashboardViewProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  quotes: Quote[];
  notifications: NotificationItem[];
  onNavigate: (view: string) => void;
  onQuickAction: (action: string) => void;
  onMarkNotificationRead: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  customers, invoices, payments, quotes, notifications, onNavigate, onQuickAction, onMarkNotificationRead 
}) => {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const pendingInvoices = invoices.filter(i => i.status !== 'PAID');
  const totalOutstanding = pendingInvoices.reduce((sum, i) => sum + (i.total - (i.paid_amount || 0)), 0);
  const averageTicket = payments.length > 0 ? totalRevenue / payments.length : 0;
  const collectionRate = invoices.length > 0 
    ? Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100) 
    : 100;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      {/* Live Financial Notification Toast Banner */}
      <NotificationToastBanner 
        notifications={notifications}
        onMarkRead={onMarkNotificationRead}
        onNavigate={onNavigate}
      />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 font-mono text-xs">
              REYPASS ECONOMÍA DIGITAL • SUPABASE RLS
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Centro de Operaciones Financieras</h2>
          <p className="text-sm text-slate-400 mt-1">
            Bienvenido, Alejandro Rey. Resumen ejecutivo y métricas en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuickAction('new_invoice')}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Factura</span>
          </button>
          <button
            onClick={() => onNavigate('ai')}
            className="bg-slate-800 hover:bg-slate-700 text-lime-400 border border-lime-500/30 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Preguntar a REY AI</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ingresos del Periodo</span>
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white font-mono">${totalRevenue.toLocaleString()} <span className="text-sm text-slate-400">USD</span></h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs mes anterior</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Cuentas por Cobrar</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white font-mono">${totalOutstanding.toLocaleString()} <span className="text-sm text-slate-400">USD</span></h3>
            <p className="text-xs text-slate-400 mt-2">{pendingInvoices.length} facturas pendientes de cobro</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white font-mono">${averageTicket.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm text-slate-400">USD</span></h3>
            <p className="text-xs text-slate-400 mt-2">Basado en {payments.length} transacciones</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tasa de Cobro</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-white font-mono">{collectionRate}%</h3>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-lime-400 h-2 rounded-full" style={{ width: `${collectionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Recent Payments & Quick Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Últimos Pagos Confirmados</h3>
              <p className="text-xs text-slate-400">Transacciones validadas mediante proveedores y webhooks</p>
            </div>
            <button 
              onClick={() => onNavigate('payments')} 
              className="text-xs text-lime-400 hover:text-lime-300 font-semibold"
            >
              Ver todos →
            </button>
          </div>
          
          <div className="space-y-3">
            {payments.slice(0, 5).map((pay) => {
              const cust = customers.find(c => c.id === pay.customer_id);
              return (
                <div key={pay.id} className="flex items-center justify-between p-3.5 bg-slate-950/50 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{cust ? cust.name : 'Cliente Corporativo'}</p>
                      <p className="text-xs text-slate-400 font-mono">Ref: {pay.reference} • {pay.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-lime-400 font-mono">+${pay.amount.toLocaleString()} {pay.currency}</p>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">COMPLETED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations & AI Summary Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-lime-400" />
              <h3 className="text-lg font-bold text-white">REY AI Operations</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Tu asistente inteligente analiza continuamente flujos de caja, cuentas por cobrar vencidas y anomalías en pasarelas de pago.
            </p>
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <p className="text-xs font-mono text-lime-400">ESTADO DE SALUD FINANCIERA</p>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Conciliación Bancaria</span>
                <span className="text-emerald-400 font-bold">100% OK</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Webhooks Activos</span>
                <span className="text-emerald-400 font-bold">Stripe / SPEI</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Seguridad RLS DB</span>
                <span className="text-emerald-400 font-bold">Blindado</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onNavigate('ai')}
            className="w-full mt-6 bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
          >
            <span>Abrir Consola REY AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
