import React, { useState } from 'react';
import { FileText, Plus, CheckCircle, Send, ArrowRight, X } from 'lucide-react';
import { Customer, Quote } from '../types';

interface QuotesViewProps {
  quotes: Quote[];
  customers: Customer[];
  onAddQuote: (quoteData: any) => void;
  onUpdateQuoteStatus: (id: string, status: string) => void;
}

export const QuotesView: React.FC<QuotesViewProps> = ({ 
  quotes, customers, onAddQuote, onUpdateQuoteStatus 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [itemDesc, setItemDesc] = useState('Licenciamiento Software Enterprise');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(5000);
  const [notes, setNotes] = useState('Válido por 15 días.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = quantity * unitPrice;
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    onAddQuote({
      customer_id: customerId || (customers[0] ? customers[0].id : 'cust_1'),
      items: [{ description: itemDesc, quantity: Number(quantity), unit_price: Number(unitPrice), total }],
      subtotal,
      tax,
      discount: 0,
      total,
      currency: 'USD',
      status: 'SENT',
      expires_at: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
      notes
    });

    setShowModal(false);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Cotizaciones Comerciales</h2>
          <p className="text-sm text-slate-400">Crea, envía, aprueba y convierte cotizaciones en facturas automáticamente.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cotización</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-mono text-slate-400 uppercase">
                <th className="p-4">Folio</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Concepto</th>
                <th className="p-4">Total</th>
                <th className="p-4">Vencimiento</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {quotes.map((q) => {
                const cust = customers.find(c => c.id === q.customer_id);
                return (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4 font-mono font-bold text-lime-400">{q.number}</td>
                    <td className="p-4">
                      <p className="font-bold text-white">{cust ? cust.name : 'Cliente'}</p>
                      <p className="text-xs text-slate-400">{cust?.company}</p>
                    </td>
                    <td className="p-4 text-slate-300">
                      {q.items[0]?.description || 'Servicios Profesionales'}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">${q.total.toLocaleString()} {q.currency}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{q.expires_at}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        q.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        q.status === 'SENT' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                      {q.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => onUpdateQuoteStatus(q.id, 'ACCEPTED')}
                          className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Aprobar & Facturar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-white">Cotización {selectedQuote.number}</h3>
                <p className="text-xs font-mono text-lime-400">Estado actual: {selectedQuote.status}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="text-xs font-mono text-slate-400 uppercase">Conceptos y Líneas</p>
                {selectedQuote.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-white">
                    <span>{it.quantity}x {it.description}</span>
                    <span className="font-mono">${it.total.toLocaleString()} USD</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-lime-400">
                  <span>Total con IVA (16%):</span>
                  <span className="font-mono">${selectedQuote.total.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedQuote(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quote Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Nueva Cotización</h3>
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
              <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción del Servicio</label>
                <input
                  type="text"
                  required
                  value={itemDesc}
                  onChange={e => setItemDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Precio Unitario ($ USD)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Notas Comerciales</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  rows={2}
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
                  Crear Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
