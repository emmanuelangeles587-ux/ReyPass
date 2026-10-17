import React from 'react';
import { Receipt, QrCode, Download, CheckCircle2 } from 'lucide-react';
import { Customer, Receipt as ReceiptType } from '../types';

interface ReceiptsViewProps {
  receipts: ReceiptType[];
  customers: Customer[];
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({ receipts, customers }) => {
  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Recibos Verificables con QR</h2>
        <p className="text-sm text-slate-400">Comprobantes de pago oficiales con código QR de verificación criptográfica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {receipts.map((rec) => {
          const cust = customers.find(c => c.id === rec.customer_id);
          return (
            <div key={rec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-mono font-bold text-lime-400">{rec.number}</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full">VERIFIED</span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold text-white">{cust ? cust.name : 'Cliente'}</p>
                  <p className="text-xs text-slate-400">{cust?.company}</p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Importe Recibido:</span>
                    <span className="font-mono font-bold text-lg text-white">${rec.amount.toLocaleString()} {rec.currency}</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center gap-4">
                  <img src={rec.qr_code_url} alt="QR Code" className="w-20 h-20 rounded bg-white p-1" />
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-white">Código Verificable</p>
                    <p className="font-mono text-[10px] text-lime-400">reywallet.app/pay/{rec.id}</p>
                    <p>Escanea para validar autenticidad.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => alert(`Descargando comprobante PDF para ${rec.number}...`)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-lime-400" />
                  <span>Descargar Comprobante PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
