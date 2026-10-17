import React, { useState } from 'react';
import { CreditCard, CheckCircle2, ShieldAlert, Plus, X } from 'lucide-react';
import { Customer, Invoice, Payment } from '../types';

interface PaymentsViewProps {
  payments: Payment[];
  invoices: Invoice[];
  customers: Customer[];
  onRegisterPayment: (paymentData: any) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ 
  payments, invoices, customers, onRegisterPayment 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [method, setMethod] = useState<'TRANSFER' | 'CASH' | 'SPEI' | 'CARD' | 'STRIPE'>('TRANSFER');
  const [provider, setProvider] = useState<'STRIPE' | 'MERCADOPAGO' | 'PAYPAL' | 'SPEI_DIRECT' | 'MANUAL'>('STRIPE');
  const [reference, setReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterPayment({
      invoice_id: invoiceId || (invoices[0] ? invoices[0].id : 'inv_1'),
      amount: Number(amount),
      method,
      provider,
      reference: reference || `REF-${Math.floor(Math.random() * 900000 + 100000)}`
    });
    setShowModal(false);
    setReference('');
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Pagos & Cobros</h2>
          <p className="text-sm text-slate-400">Conciliación de pagos online (Stripe, Mercado Pago) y transferencias SPEI manuales.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pago Manual</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400 uppercase">
                <th className="p-4">Referencia / ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4">Método</th>
                <th className="p-4">Importe</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {payments.map((p) => {
                const cust = customers.find(c => c.id === p.customer_id);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4 font-mono font-bold text-lime-400">{p.reference}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{cust ? cust.name : 'Cliente'}</p>
                      <p className="text-xs text-slate-400">{cust?.company}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {p.provider}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono text-xs">{p.method}</td>
                    <td className="p-4 font-mono font-bold text-white">${p.amount.toLocaleString()} {p.currency}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Registrar Pago</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Factura Asociada</label>
                <select
                  value={invoiceId}
                  onChange={e => setInvoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>{i.number} — Total: ${i.total}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Monto ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Referencia / Folio</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                    placeholder="Ej. SPEI-998231"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Proveedor</label>
                  <select
                    value={provider}
                    onChange={(e: any) => setProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  >
                    <option value="STRIPE">Stripe</option>
                    <option value="MERCADOPAGO">Mercado Pago</option>
                    <option value="SPEI_DIRECT">SPEI Banxico</option>
                    <option value="MANUAL">Manual / Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Método</label>
                  <select
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  >
                    <option value="TRANSFER">Transferencia</option>
                    <option value="SPEI">SPEI</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="STRIPE">Stripe Gateway</option>
                  </select>
                </div>
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
                  Guardar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
