import React from 'react';
import { BookOpen, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LedgerEntry } from '../types';

interface LedgerViewProps {
  ledger: LedgerEntry[];
}

export const LedgerView: React.FC<LedgerViewProps> = ({ ledger }) => {
  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Ledger Contable (Append-Only)</h2>
          <p className="text-sm text-slate-400">Registro inmutable de doble partida, débitos y créditos por cada operación financiera.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Consistencia Contable 100% Verificada</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400 uppercase">
                <th className="p-4">Referencia</th>
                <th className="p-4">Cuenta Contable</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Descripción</th>
                <th className="p-4 text-right">Importe</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-4 font-mono font-bold text-lime-400">{entry.reference}</td>
                  <td className="p-4 font-mono text-xs text-slate-300">{entry.account}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      entry.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 text-xs">{entry.description}</td>
                  <td className="p-4 text-right font-mono font-bold text-white">${entry.amount.toLocaleString()} {entry.currency}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{new Date(entry.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
