import React, { useState } from 'react';
import { ShieldCheck, Plus, Clock, CheckCircle2, X } from 'lucide-react';
import { CreditApplication, Customer } from '../types';

interface CreditViewProps {
  creditApps: CreditApplication[];
  customers: Customer[];
  onAddCreditApp: (app: any) => void;
}

export const CreditView: React.FC<CreditViewProps> = ({ creditApps, customers, onAddCreditApp }) => {
  const [showModal, setShowModal] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState(15000);
  const [termMonths, setTermMonths] = useState(6);
  const [purpose, setPurpose] = useState('Expansión comercial y capital de trabajo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCreditApp({
      customer_id: customerId || (customers[0] ? customers[0].id : 'cust_1'),
      amount: Number(amount),
      term_months: Number(termMonths),
      purpose
    });
    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Solicitudes de Crédito & Riesgo</h2>
          <p className="text-sm text-slate-400">Evaluación, revisión y aprobación de líneas de crédito corporativo para clientes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400 uppercase">
                <th className="p-4">Cliente</th>
                <th className="p-4">Línea Solicitada</th>
                <th className="p-4">Plazo</th>
                <th className="p-4">Propósito</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Revisado por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {creditApps.map((ca) => {
                const cust = customers.find(c => c.id === ca.customer_id);
                return (
                  <tr key={ca.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4">
                      <p className="font-bold text-white">{cust ? cust.name : 'Cliente'}</p>
                      <p className="text-xs text-slate-400">{cust?.company}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-lime-400">${ca.amount.toLocaleString()} USD</td>
                    <td className="p-4 font-mono text-xs text-slate-300">{ca.term_months} meses</td>
                    <td className="p-4 text-slate-300 text-xs">{ca.purpose}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {ca.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-slate-400">{ca.reviewed_by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Nueva Solicitud de Crédito</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Cliente</label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto Línea ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Plazo (Meses)</label>
                  <input
                    type="number"
                    required
                    value={termMonths}
                    onChange={e => setTermMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Propósito del Crédito</label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-lime-500/20"
                >
                  Enviar a Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
