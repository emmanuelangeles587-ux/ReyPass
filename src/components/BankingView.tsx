import React, { useState } from 'react';
import { Landmark, Plus, CheckCircle2, ShieldCheck, Upload, ArrowRightLeft, DollarSign, Globe } from 'lucide-react';
import { BankAccount } from '../types';

interface BankingViewProps {
  banking: BankAccount[];
}

export const BankingView: React.FC<BankingViewProps> = ({ banking }) => {
  const [amount, setAmount] = useState(1000);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MXN');

  // Exchange rates relative to USD
  const rates: Record<string, number> = {
    USD: 1.0,
    MXN: 17.15,
    EUR: 0.92,
    GBP: 0.79,
    BTC: 0.000015
  };

  const convertedAmount = (amount / rates[fromCurrency]) * rates[toCurrency];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Cuentas Bancarias & Divisas</h2>
          <p className="text-sm text-slate-400">Gestión de cuentas corporativas, pasarelas de pago y conversor multidivisa en tiempo real.</p>
        </div>
        <button
          onClick={() => alert('Para conectar cuentas bancarias adicionales, configure las credenciales SPEI o Open Banking en Admin.')}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Vincular Cuenta Bancaria</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {banking.map((acc) => (
          <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{acc.bank_name}</h3>
                  <p className="text-xs font-mono text-slate-400">{acc.account_number}</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {acc.status}
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-mono">Saldo Disponible</p>
                <p className="text-3xl font-extrabold text-white font-mono mt-1">${acc.balance.toLocaleString()} <span className="text-sm text-slate-400">{acc.currency}</span></p>
              </div>
              <button
                onClick={() => alert(`Importando extracto CSV para ${acc.bank_name}...`)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-lime-400" />
                <span>Importar CSV</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Currency Exchange Calculator Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-lime-400" />
          <h3 className="text-lg font-bold text-white">Calculadora & Conversor Multidivisa</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">Simula conversiones de divisas corporativas en tiempo real basadas en tipos de cambio interbancarios.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Monto</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-lime-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Moneda Origen</label>
            <select
              value={fromCurrency}
              onChange={e => setFromCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-lime-500 outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="MXN">MXN ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BTC">BTC (₿)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Moneda Destino</label>
            <select
              value={toCurrency}
              onChange={e => setToCurrency(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-lime-500 outline-none"
            >
              <option value="MXN">MXN ($)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="BTC">BTC (₿)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">RESULTADO DE CONVERSIÓN</span>
            <p className="text-2xl font-extrabold text-lime-400 font-mono mt-1">
              {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toCurrency}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-mono">Tipo de Cambio</span>
            <p className="text-xs text-slate-300 font-mono mt-1">1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
