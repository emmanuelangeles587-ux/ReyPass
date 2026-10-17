import React, { useState } from 'react';
import { FileCheck, Plus, ExternalLink, QrCode, CheckCircle2, Clock, X } from 'lucide-react';
import { Customer, Invoice } from '../types';

interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  onAddInvoice: (invoiceData: any) => void;
  onRegisterPaymentFromInvoice: (invoiceId: string, amount: number) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ 
  invoices, customers, onAddInvoice, onRegisterPaymentFromInvoice 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState(0);

  const [customerId, setCustomerId] = useState('');
  const [itemDesc, setItemDesc] = useState('Servicios Enterprise Cloud');
  const [totalAmount, setTotalAmount] = useState(5000);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = totalAmount / 1.16;
    const tax = totalAmount - subtotal;
    onAddInvoice({
      customer_id: customerId || (customers[0] ? customers[0].id : 'cust_1'),
      items: [{ description: itemDesc, quantity: 1, unit_price: subtotal, total: subtotal }],
      subtotal,
      tax,
      discount: 0,
      total: Number(totalAmount),
      currency: 'USD',
      status: 'SENT',
      due_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    });
    setShowModal(false);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payModalInvoice) {
      onRegisterPaymentFromInvoice(payModalInvoice.id, payAmount);
      setPayModalInvoice(null);
    }
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Facturas Corporativas</h2>
          <p className="text-sm text-slate-400">Control de facturación, emisión, plazos de vencimiento y links de pago.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Factura</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400 uppercase">
                <th className="p-4">Folio</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Pagado</th>
                <th className="p-4">Vencimiento</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {invoices.map((inv) => {
                const cust = customers.find(c => c.id === inv.customer_id);
                const paid = inv.paid_amount || 0;
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4 font-mono font-bold text-lime-400">{inv.number}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{cust ? cust.name : 'Cliente'}</p>
                      <p className="text-xs text-slate-400">{cust?.company}</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">${inv.total.toLocaleString()} {inv.currency}</td>
                    <td className="p-4 font-mono text-emerald-400">${paid.toLocaleString()} {inv.currency}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{inv.due_date}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        inv.status === 'PARTIALLY_PAID' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setPayModalInvoice(inv);
                            setPayAmount(inv.total - (inv.paid_amount || 0));
                          }}
                          className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shadow"
                        >
                          Registrar Pago
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Enlace de pago seguro copiado: https://reywallet.app/pay/${inv.id}`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Link de Pago
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Registrar Pago para {payModalInvoice.number}</h3>
              <button onClick={() => setPayModalInvoice(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePaySubmit} className="space-y-4 pt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto a Abonar ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-lime-500/20"
                >
                  Confirmar Pago & Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Nueva Factura</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
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
              <div>
                <label className="text-xs text-slate-400 block mb-1">Concepto Principal</label>
                <input
                  type="text"
                  required
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Importe Total con IVA ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={totalAmount}
                  onChange={e => setTotalAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
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
                  Emitir Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
