import React from 'react';
import { BarChart3, Download, TrendingUp, DollarSign } from 'lucide-react';
import { Payment, Invoice } from '../types';

interface AnalyticsViewProps {
  payments: Payment[];
  invoices: Invoice[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ payments, invoices }) => {
  const totalRev = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalInv = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Analytics & Reportes Financieros</h2>
          <p className="text-sm text-slate-400">Métricas avanzadas de ingresos, conversión, morosidad y flujos de caja.</p>
        </div>
        <button
          onClick={() => alert('Exportando reporte contable CSV consolidado...')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-lime-400" />
          <span>Exportar CSV / PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs font-mono text-slate-400">Volumen Total Facturado</p>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">${totalInv.toLocaleString()} <span className="text-sm text-slate-400">USD</span></p>
          <p className="text-xs text-emerald-400 mt-2 font-medium">+14% vs periodo previo</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs font-mono text-slate-400">Ingresos Efectivos Cobrados</p>
          <p className="text-3xl font-extrabold text-lime-400 font-mono mt-2">${totalRev.toLocaleString()} <span className="text-sm text-slate-400">USD</span></p>
          <p className="text-xs text-slate-400 mt-2">{payments.length} transacciones liquidadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <p className="text-xs font-mono text-slate-400">Ratio de Conversión de Cobro</p>
          <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-2">92.4%</p>
          <p className="text-xs text-slate-400 mt-2">Excelente salud de cartera</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Desglose de Ingresos por Método de Pago</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
              <span>Stripe Gateway (USD)</span>
              <span>$5,000.00 (34%)</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
              <div className="bg-lime-400 h-2.5 rounded-full" style={{ width: '34%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-mono">
              <span>SPEI / Transferencias Directas (MXN/USD)</span>
              <span>$9,860.00 (66%)</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
              <div className="bg-cyan-400 h-2.5 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
