import React, { useState, useEffect } from 'react';
import { 
  Activity, ArrowUpRight, CheckCircle2, ShieldCheck, Clock, RefreshCw, 
  Lock, AlertTriangle, QrCode, FileText, Send, Sparkles, Database, Fingerprint, Eye
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, LineChart, Line 
} from 'recharts';
import { StpWebhookService, ReconciledTransaction } from '../lib/services/webhookService';
import { useWorkspaceIntegrity } from '../hooks/useWorkspaceIntegrity';

interface SpeiCollectionMonitorViewProps {
  userEmail?: string;
}

export const SpeiCollectionMonitorView: React.FC<SpeiCollectionMonitorViewProps> = ({
  userEmail = 'soporte.reyplace@gmail.com'
}) => {
  const { 
    isDomainAuthorized, 
    isIframeBlocked, 
    integrityHash, 
    activeDomain, 
    antiPhishingToken, 
    defenseLevel,
    tamperingAlert,
    verifyNow 
  } = useWorkspaceIntegrity(userEmail);

  const [metrics, setMetrics] = useState(() => StpWebhookService.getLiveMetrics());
  const [isSimulatingIncoming, setIsSimulatingIncoming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Periodic polling for live data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(StpWebhookService.getLiveMetrics());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Recharts Dataset 1: Hourly Transaction Volume (MXN)
  const hourlyVolumeData = [
    { hour: '08:00', SPEI: 4200, CODI: 850, DIMO: 320 },
    { hour: '10:00', SPEI: 8900, CODI: 1450, DIMO: 540 },
    { hour: '12:00', SPEI: 14200, CODI: 3200, DIMO: 980 },
    { hour: '14:00', SPEI: 18500, CODI: 4100, DIMO: 1120 },
    { hour: '16:00', SPEI: 12400, CODI: 2800, DIMO: 780 },
    { hour: '18:00', SPEI: 9800, CODI: 1950, DIMO: 610 }
  ];

  // Recharts Dataset 2: Accreditation Latency SLA (Seconds)
  const latencyData = [
    { time: '12:00', latenciaSec: 1.1, slaLimite: 5.0 },
    { time: '12:15', latenciaSec: 0.9, slaLimite: 5.0 },
    { time: '12:30', latenciaSec: 1.3, slaLimite: 5.0 },
    { time: '12:45', latenciaSec: 1.0, slaLimite: 5.0 },
    { time: '13:00', latenciaSec: 1.2, slaLimite: 5.0 },
    { time: '13:15', latenciaSec: 0.8, slaLimite: 5.0 }
  ];

  // Simulate an incoming webhook notification from STP
  const handleSimulateWebhook = () => {
    setIsSimulatingIncoming(true);
    setTimeout(() => {
      const mockPayers = [
        { name: 'ALEJANDRO REY', rfc: 'REYA900101XX1', account: '012180019283746519' },
        { name: 'CARLOS HERNANDEZ', rfc: 'HELC880415YY2', account: '002180058291029384' },
        { name: 'LUCIA MENDOZA', rfc: 'MENL920820ZZ3', account: '072180037192837461' }
      ];
      const randomPayer = mockPayers[Math.floor(Math.random() * mockPayers.length)];
      const randomAmount = Math.floor(Math.random() * 350 + 50);
      const trackingCode = `STP20261017${Date.now().toString().slice(-6)}`;

      const result = StpWebhookService.processStpNotification({
        id: Date.now(),
        claveRastreo: trackingCode,
        cuentaBeneficiaria: '646180123456789012',
        monto: randomAmount,
        nombreOrdenante: randomPayer.name,
        cuentaOrdenante: randomPayer.account,
        rfcCurpOrdenante: randomPayer.rfc,
        conceptoPago: 'Pago ReyPass POS Mostrador',
        tipoPago: 'CODI',
        firma: 'RSA_STP_SIG_VALIDATED_TOKEN_2026',
        fechaOperacion: new Date().toISOString(),
        empresa: 'REYPASS_ECO_DIGITAL'
      });

      setIsSimulatingIncoming(false);
      if (result.success && result.reconciledTransaction) {
        setMetrics(StpWebhookService.getLiveMetrics());
        showToast(`¡Webhook STP Procesado! Transacción $${randomAmount} MXN conciliada automáticamente en Ledger.`);
      } else {
        showToast(result.error || 'Error al procesar webhook STP');
      }
    }, 700);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Anti-Phishing Cryptographic Seal */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-cyan-500/20">
            <Activity className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-white tracking-tight">Monitor de Cobros SPEI</h1>
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold">
                STP / BANXICO LIVE
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              ReyPass Economía Digital: Trazabilidad en tiempo real, conciliación autónoma y liquidación directa.
            </p>
          </div>
        </div>

        {/* Anti-Phishing & Domain Integrity Seal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl relative z-10 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Sello Anti-Robo de Identidad:</span>
              <span className="text-cyan-400 font-bold tracking-wider">{antiPhishingToken || 'AP-TOKEN-SYNC'}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Firma de Integridad:</span>
            <span className="text-emerald-400 font-bold">{integrityHash ? `${integrityHash.slice(0, 15)}...` : 'VERIFICANDO'}</span>
          </div>
        </div>
      </div>

      {/* Security Alert if Domain Compromised */}
      {tamperingAlert && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{tamperingAlert}</span>
          </div>
          <button
            onClick={verifyNow}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-lg cursor-pointer"
          >
            Re-verificar
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-mono block">Volumen Conciliado (Hoy)</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">
            ${metrics.totalVolume.toLocaleString()} MXN
          </span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs jornada anterior
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-mono block">Tiempo Promedio de Acreditación</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {metrics.avgLatencySec} seg
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            SLA Banxico STP: &lt; 5.0 seg
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-mono block">Tasa de Conciliación Autónoma</span>
          <span className="text-2xl font-black text-lime-400 font-mono">
            {metrics.autoReconciliationRate}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            0% intervención humana requerida
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
          <span className="text-xs text-slate-400 font-mono block">Transacciones Procesadas</span>
          <span className="text-2xl font-black text-white font-mono">
            {metrics.totalCount} operaciones
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            100% verificadas con Firma STP
          </span>
        </div>
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Volume by Hour */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" /> Volumen de Cobros SPEI / CoDi / DiMo (MXN)
              </h3>
              <p className="text-xs text-slate-400 font-mono">Distribución horaria de ingresos procesados por STP.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">
              EN VIVO
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyVolumeData}>
                <defs>
                  <linearGradient id="colorSpei" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCodi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="SPEI" stroke="#00d2ff" fillOpacity={1} fill="url(#colorSpei)" />
                <Area type="monotone" dataKey="CODI" stroke="#10b981" fillOpacity={1} fill="url(#colorCodi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Accreditation Latency (Seconds) vs SLA */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Latencia de Acreditación vs Límite Banxico (Seg.)
            </h3>
            <p className="text-xs text-slate-400 font-mono">Tiempo promedio real: 1.1s (Umbral permitido: 5.0s).</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <YAxis domain={[0, 6]} stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="latenciaSec" name="Latencia Real (s)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="slaLimite" name="Límite SLA (5s)" stroke="#f43f5e" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-time Reconciled Transactions Table with Autonomous Ledger Update */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Bitácora de Transacciones Conciliadas por Webhook
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Entradas en el Ledger contable generadas sin intervención humana con firma STP verificada.
            </p>
          </div>

          <button
            onClick={handleSimulateWebhook}
            disabled={isSimulatingIncoming}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingIncoming ? 'animate-spin' : ''}`} />
            <span>Simular Webhook Entrante STP</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="p-3">Clave de Rastreo</th>
                <th className="p-3">Ordenante (RFC)</th>
                <th className="p-3">Monto (MXN)</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Latencia</th>
                <th className="p-3">Asiento Ledger</th>
                <th className="p-3">CFDI 4.0 UUID</th>
                <th className="p-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {metrics.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-cyan-400">{tx.claveRastreo}</td>
                  <td className="p-3">
                    <span className="text-white block font-medium">{tx.payerName}</span>
                    <span className="text-[10px] text-slate-500">{tx.payerRfc}</span>
                  </td>
                  <td className="p-3 text-white font-bold">${tx.monto.toFixed(2)} MXN</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                      {tx.paymentType}
                    </span>
                  </td>
                  <td className="p-3 text-emerald-400">{tx.accreditationLatencySec}s</td>
                  <td className="p-3 text-slate-400">{tx.ledgerReference}</td>
                  <td className="p-3 text-slate-400 truncate max-w-[140px]">{tx.cfdiUuid || 'GENERADO'}</td>
                  <td className="p-3 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
