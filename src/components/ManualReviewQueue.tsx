import React, { useState } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, AlertTriangle, ArrowRight, 
  DollarSign, Clock, UserCheck, Lock, Eye, FileText, Activity, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';

export interface PendingReviewItem {
  id: string;
  transactionType: 'SPEI_TRANSFER' | 'HIGH_VALUE_CREDIT' | 'WEB3_SETTLEMENT' | 'AUTO_INVOICE_PAYMENT';
  amount: number;
  currency: string;
  customerName: string;
  customerRfc: string;
  aiModelName: string;
  riskScore: number; // 0 to 100
  flaggedReason: string;
  detectedAnomalies: string[];
  timestamp: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  metadata: {
    ipAddress?: string;
    location?: string;
    piiSanitized: boolean;
    suggestedAction: string;
  };
}

interface ManualReviewQueueProps {
  onApproveToLedger?: (item: PendingReviewItem) => void;
  onRejectTransaction?: (item: PendingReviewItem) => void;
}

export const ManualReviewQueue: React.FC<ManualReviewQueueProps> = ({
  onApproveToLedger,
  onRejectTransaction
}) => {
  const [items, setItems] = useState<PendingReviewItem[]>([
    {
      id: 'tx_rev_101',
      transactionType: 'SPEI_TRANSFER',
      amount: 45000.00,
      currency: 'USD',
      customerName: 'Logística Global S.A.',
      customerRfc: 'LOG180212AB4',
      aiModelName: 'FraudGuard Risk Engine (gemini-1.5-pro)',
      riskScore: 88,
      flaggedReason: 'Monto de transferencia excede umbral de seguridad ($10,000 USD) y dirección IP proviene de nueva ubicación geográfica.',
      detectedAnomalies: [
        'Monto excede promedio histórico por 3.2x',
        'Cambio reciente de cuenta CLABE de destino',
        'Firma de sesión con z-index auditado'
      ],
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      metadata: {
        ipAddress: '187.210.44.12',
        location: 'Guadalajara, JAL, MX',
        piiSanitized: true,
        suggestedAction: 'Requiere firma criptográfica de rol OWNER para enviar fondos.'
      }
    },
    {
      id: 'tx_rev_102',
      transactionType: 'HIGH_VALUE_CREDIT',
      amount: 125000.00,
      currency: 'USD',
      customerName: 'TechFlow Solutions',
      customerRfc: 'TEC190520XY9',
      aiModelName: 'CashFlow Prophet & Risk AI',
      riskScore: 74,
      flaggedReason: 'Solicitud de ampliación de línea de crédito automatizada por IA para cliente Tier 2.',
      detectedAnomalies: [
        'Incremento de límite de crédito > $50k USD',
        'Ratio de apalancamiento estimado en 1.8x'
      ],
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'PENDING',
      metadata: {
        piiSanitized: true,
        suggestedAction: 'Aprobar previa revisión de Estados Financieros Q3.'
      }
    },
    {
      id: 'tx_rev_103',
      transactionType: 'WEB3_SETTLEMENT',
      amount: 18400.00,
      currency: 'USDC',
      customerName: 'Krypton Labs Ltd',
      customerRfc: 'KRY220110999',
      aiModelName: 'ReyAI Web3 Audit Agent',
      riskScore: 65,
      flaggedReason: 'Liquidación en Smart Contract con interacción en mempool de alta volatilidad de gas.',
      detectedAnomalies: [
        'Smart contract no verificado en Etherscan (Testnet)',
        'Slippage configurado al 2.5%'
      ],
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'PENDING',
      metadata: {
        piiSanitized: true,
        suggestedAction: 'Verificar hash de transacción en Explorer antes de registrar en Ledger.'
      }
    }
  ]);

  const [selectedItem, setSelectedItem] = useState<PendingReviewItem | null>(items[0] || null);
  const [adminNote, setAdminNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleApprove = (item: PendingReviewItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'APPROVED' } : i));
    if (onApproveToLedger) onApproveToLedger(item);
    setActionSuccess(`Transacción #${item.id} aprobada con éxito e ingresada al Ledger Contable.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleReject = (item: PendingReviewItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'REJECTED' } : i));
    if (onRejectTransaction) onRejectTransaction(item);
    setActionSuccess(`Transacción #${item.id} rechazada y bloqueada. Evento registrado en auditoría.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const pendingCount = items.filter(i => i.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Alert Banner for Admin Approval */}
      {actionSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-4 rounded-2xl text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Cola de Revisión Humana (HITL)</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[11px] font-bold">
                {pendingCount} PENDIENTES
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Intercepción obligatoria de transacciones financieras generadas o evaluadas por IA clasificadas de alto riesgo previo al registro en el Ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <Lock className="w-4 h-4 text-lime-400" />
          <span>Firma de Autorización: <strong className="text-white">Rol OWNER / ADMIN</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Items List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Operaciones Interceptadas ({items.length})
          </h3>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedItem?.id === item.id 
                    ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
                  <span className="text-slate-400">{item.id}</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse' :
                    item.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    'bg-rose-950 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold text-white text-sm mb-1">
                  <span>{item.customerName}</span>
                  <span className="font-mono text-lime-400">
                    ${item.amount.toLocaleString()} {item.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800">
                  <span>Riesgo IA: <strong className="text-rose-400">{item.riskScore}/100</strong></span>
                  <span className="text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item Review & Action Console */}
        {selectedItem ? (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    {selectedItem.transactionType}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedItem.customerName}</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  RFC: <strong className="text-slate-200">{selectedItem.customerRfc}</strong> | ID: <strong className="text-slate-200">{selectedItem.id}</strong>
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Monto en Revisión</span>
                <span className="text-2xl font-black text-lime-400">
                  ${selectedItem.amount.toLocaleString()} {selectedItem.currency}
                </span>
              </div>
            </div>

            {/* AI Risk Score Breakdown */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Evaluación de Riesgo por Motor IA
                </span>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                  Score de Riesgo: {selectedItem.riskScore} / 100
                </span>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs text-rose-200 font-mono leading-relaxed">
                <strong>Motivo de Intercepción:</strong> {selectedItem.flaggedReason}
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Anomalías Detectadas ({selectedItem.detectedAnomalies.length}):
                </span>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {selectedItem.detectedAnomalies.map((an, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{an}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Metadata & PII Masking */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <span className="text-slate-400 block mb-1">Motor IA Evaluador:</span>
                <span className="text-white font-medium">{selectedItem.aiModelName}</span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-2xl">
                <span className="text-slate-400 block mb-1">Protección PII / Datos Sensibles:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enmascaramiento Activo
                </span>
              </div>
            </div>

            {/* Admin Decision Action Panel */}
            {selectedItem.status === 'PENDING' ? (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block mb-2">
                    Nota de Auditoría Administrativa (Obligatoria para Registro Ledger)
                  </label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ej. Transferencia confirmada vía llamada de validación con representante legal..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-mono focus:border-lime-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(selectedItem)}
                    className="flex-1 bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-lime-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprobar e Ingressar al Ledger</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedItem)}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Rechazar y Bloquear Transacción</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border text-center font-mono text-xs space-y-1 bg-slate-950 border-slate-800">
                <span className="text-slate-400">Esta transacción ya ha sido procesada con estado:</span>
                <span className={`block font-bold text-sm ${
                  selectedItem.status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedItem.status === 'APPROVED' ? '✓ APROBADA E INGRESADA EN LEDGER' : '✕ RECHAZADA Y BLOQUEADA'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 font-mono text-xs">
            Selecciona una transacción de la cola para revisar los detalles de riesgo y autorizar su ingreso al Ledger.
          </div>
        )}
      </div>
    </div>
  );
};
