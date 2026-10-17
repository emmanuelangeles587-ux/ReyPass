import React, { useState } from 'react';
import { 
  Bot, ShieldAlert, Cpu, Database, Eye, Lock, RefreshCw, Trash2, 
  CheckCircle2, AlertTriangle, Layers, FileText, ToggleLeft, ToggleRight,
  UserCheck, History, Sliders, Sparkles, Terminal, Shield, Key, Activity,
  BarChart2, LineChart as LineChartIcon, TrendingUp, AlertCircle
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, Cell, LineChart, Line 
} from 'recharts';
import { ManualReviewQueue, PendingReviewItem } from './ManualReviewQueue';

interface AIModelConfig {
  id: string;
  name: string;
  codeName: string;
  provider: string;
  model: string;
  purpose: string;
  dataReceived: string[];
  dataExcluded: string[];
  version: string;
  accessRole: string;
  retentionPolicy: string;
  humanInTheLoop: boolean;
  isActive: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastAudit: string;
  totalInferences: number;
  uptimePct: number;
}

export const EmmanAiGovernanceView: React.FC = () => {
  const [models, setModels] = useState<AIModelConfig[]>([
    {
      id: 'ai_1',
      name: 'ReyAI Financial Assistant',
      codeName: 'emman_core_assistant',
      provider: 'Google Cloud / Google GenAI',
      model: 'gemini-2.5-flash',
      purpose: 'Asistencia conversacional ejecutiva, consultas de estado de cuenta y guía de operaciones en la plataforma.',
      dataReceived: ['Preguntas de usuario', 'Metadatos de organización', 'Saldos agregados de cuentas'],
      dataExcluded: ['Contraseñas en texto plano', 'Claves privadas Web3', 'Números completos de tarjetas CVV'],
      version: 'v3.4.1-stable',
      accessRole: 'ADMIN, OWNER, ACCOUNTANT',
      retentionPolicy: '30 días cifrado AES-256 con purga automática',
      humanInTheLoop: false,
      isActive: true,
      riskLevel: 'LOW',
      lastAudit: 'Hace 2 horas',
      totalInferences: 14280,
      uptimePct: 99.99
    },
    {
      id: 'ai_2',
      name: 'FraudGuard Risk Engine',
      codeName: 'emman_fraud_guard',
      provider: 'Google GenAI & Vertex ML',
      model: 'gemini-1.5-pro-vision',
      purpose: 'Detección de anomalías en transacciones SPEI, transferencias cross-border y scoring de riesgo de contraparte.',
      dataReceived: ['Montos de transacciones', 'Historial de pagos', 'IPs y geolocalización de sesión'],
      dataExcluded: ['Datos biométricos crudos', 'Credenciales bancarias externas'],
      version: 'v2.1.0-secure',
      accessRole: 'OWNER, RISK_OFFICER',
      retentionPolicy: '90 días por normativa antilavado (AML)',
      humanInTheLoop: true, // Requires human signoff for blocked transactions > $10k
      isActive: true,
      riskLevel: 'HIGH',
      lastAudit: 'Hace 30 minutos',
      totalInferences: 84900,
      uptimePct: 99.97
    },
    {
      id: 'ai_3',
      name: 'CashFlow Prophet Predictor',
      codeName: 'emman_cashflow_prophet',
      provider: 'Anthropic / Custom PyTorch',
      model: 'claude-3-5-sonnet / time-series-v2',
      purpose: 'Proyección de flujo de caja a 30, 60 y 90 días basada en facturas pendientes y ciclos históricos de cobro.',
      dataReceived: ['Historial de facturación', 'Fechas de vencimiento de cobros', 'Ledger contable'],
      dataExcluded: ['Datos personales de empleados', 'Estrategias societarias externas'],
      version: 'v1.8.4',
      accessRole: 'ADMIN, ACCOUNTANT, OWNER',
      retentionPolicy: '60 días de caché de inferencia',
      humanInTheLoop: false,
      isActive: true,
      riskLevel: 'LOW',
      lastAudit: 'Hace 1 día',
      totalInferences: 3120,
      uptimePct: 99.95
    },
    {
      id: 'ai_4',
      name: 'SmartOCR Invoice Extractor',
      codeName: 'emman_ocr_parser',
      provider: 'Google Cloud Vision & GenAI',
      model: 'gemini-2.5-flash-multimodal',
      purpose: 'Extracción automatizada de datos desde PDFs de facturas, XML SAT y recibos físicos escaneados.',
      dataReceived: ['Imágenes y documentos PDF de facturas', 'RFCs y denominaciones fiscales'],
      dataExcluded: ['Información médica o personal no relacionada con el comprobante fiscal'],
      version: 'v4.0.2',
      accessRole: 'ALL_MEMBERS',
      retentionPolicy: '15 días temporales para validación de campos',
      humanInTheLoop: false,
      isActive: true,
      riskLevel: 'LOW',
      lastAudit: 'Hace 4 horas',
      totalInferences: 19400,
      uptimePct: 99.98
    }
  ]);

  const [activeTab, setActiveTab] = useState<'catalog' | 'hitl' | 'telemetry' | 'logs' | 'risks' | 'policies'>('catalog');
  const [selectedModel, setSelectedModel] = useState<AIModelConfig>(models[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Telemetry Dataset for Recharts
  const uptimeTrendData = [
    { time: '08:00', ReyAI: 99.99, FraudGuard: 99.96, CashFlow: 99.95, SmartOCR: 99.98 },
    { time: '10:00', ReyAI: 100.00, FraudGuard: 99.98, CashFlow: 99.97, SmartOCR: 99.99 },
    { time: '12:00', ReyAI: 99.98, FraudGuard: 99.95, CashFlow: 99.94, SmartOCR: 99.97 },
    { time: '14:00', ReyAI: 99.99, FraudGuard: 99.97, CashFlow: 99.96, SmartOCR: 99.98 },
    { time: '16:00', ReyAI: 100.00, FraudGuard: 99.99, CashFlow: 99.98, SmartOCR: 100.00 },
    { time: '18:00', ReyAI: 99.99, FraudGuard: 99.97, CashFlow: 99.95, SmartOCR: 99.98 },
  ];

  const usageVolumeData = [
    { model: 'ReyAI Assistant', Inferences: 14280, TokensK: 420, AvgLatencyMs: 180 },
    { model: 'FraudGuard Risk', Inferences: 84900, TokensK: 1250, AvgLatencyMs: 240 },
    { model: 'CashFlow Prophet', Inferences: 3120, TokensK: 180, AvgLatencyMs: 310 },
    { model: 'SmartOCR Parser', Inferences: 19400, TokensK: 610, AvgLatencyMs: 290 },
  ];

  const sensitiveDataSessionData = [
    { session: 'Sesión S-1', SanitizedPayloadKB: 240, MaskedPIIRecords: 18, InterceptedRiskUSD: 45000 },
    { session: 'Sesión S-2', SanitizedPayloadKB: 410, MaskedPIIRecords: 32, InterceptedRiskUSD: 125000 },
    { session: 'Sesión S-3', SanitizedPayloadKB: 180, MaskedPIIRecords: 12, InterceptedRiskUSD: 18400 },
    { session: 'Sesión S-4', SanitizedPayloadKB: 520, MaskedPIIRecords: 45, InterceptedRiskUSD: 89000 },
    { session: 'Sesión S-5', SanitizedPayloadKB: 310, MaskedPIIRecords: 26, InterceptedRiskUSD: 62000 },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleModelActive = (id: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.isActive;
        showToast(`Modelo "${m.name}" ${nextState ? 'activado' : 'desactivado (Kill-switch aplicado)'}.`);
        return { ...m, isActive: nextState };
      }
      return m;
    }));
  };

  const toggleHitl = (id: string) => {
    setModels(prev => prev.map(m => {
      if (m.id === id) {
        const nextHitl = !m.humanInTheLoop;
        showToast(`Revisión humana (HITL) para "${m.name}" ${nextHitl ? 'ACTIVADA' : 'DESACTIVADA'}.`);
        return { ...m, humanInTheLoop: nextHitl };
      }
      return m;
    }));
  };

  const purgeLogsForModel = (modelName: string) => {
    showToast(`Datos e historial de inferencia purgados exitosamente para ${modelName}.`);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-lime-500/50 text-lime-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-lime-500/20">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">EmmanAI / IA Reyplace</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-500/20 text-lime-400 border border-lime-500/30 text-[10px] font-mono font-bold">
                GOVERNANCE & AI LAYER v3.6
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              Capa de seguridad, telemetría en tiempo real, revisión humana (HITL) y aislamiento multi-tenant de datos financieros.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'catalog' ? 'bg-lime-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Modelos & Control
          </button>
          <button
            onClick={() => setActiveTab('hitl')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'hitl' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'text-amber-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cola de Revisión (HITL)</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'telemetry' ? 'bg-lime-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetría en Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-lime-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Logs
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'risks' ? 'bg-lime-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Riesgos
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'policies' ? 'bg-lime-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacidad
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-white flex items-center gap-2">
            Protección de Datos Monetarios Sensibles en Tiempo Real
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
          </h4>
          <p className="text-slate-400">
            Toda interacción con motores de IA se realiza previa sanitización de PII (remoción de secretos, credenciales y CVVs). Las operaciones financieras de alto riesgo son interceptadas por la <strong>Cola de Revisión Humana (HITL)</strong> antes de impactar el Ledger Contable.
          </p>
        </div>
      </div>

      {/* MAIN TAB 1: Catalog & Control */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Models List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Motores Registrados ({models.length})
            </h2>
            <div className="space-y-2.5">
              {models.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedModel.id === m.id
                      ? 'bg-slate-900 border-lime-500/50 shadow-lg shadow-lime-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {m.codeName}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      m.isActive ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                    }`}>
                      {m.isActive ? 'ACTIVO' : 'APAGADO (KILL-SWITCH)'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{m.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{m.purpose}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    <span>Uptime: <strong className="text-emerald-400">{m.uptimePct}%</strong></span>
                    <span className="text-lime-400">{m.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Detailed Governance Sheet */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 className="text-lg font-bold text-white">{selectedModel.name}</h2>
                  <span className="text-xs font-mono text-lime-400 bg-lime-950/50 px-2.5 py-0.5 rounded-lg border border-lime-500/30">
                    {selectedModel.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Proveedor: <strong className="text-slate-200">{selectedModel.provider}</strong> | Modelo: <strong className="text-slate-200">{selectedModel.model}</strong>
                </p>
              </div>

              {/* Kill-switch & HITL Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-mono">Kill-Switch:</span>
                  <button onClick={() => toggleModelActive(selectedModel.id)} className="cursor-pointer">
                    {selectedModel.isActive ? (
                      <ToggleRight className="w-7 h-7 text-lime-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-rose-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-400 font-mono block">SLA Uptime</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                  {selectedModel.uptimePct}%
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-400 font-mono block">Inferencias Totales</span>
                <span className="text-sm font-bold text-white font-mono mt-1 block">
                  {selectedModel.totalInferences.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-400 font-mono block">Revisión Humana (HITL)</span>
                <button 
                  onClick={() => toggleHitl(selectedModel.id)}
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded inline-block mt-1 cursor-pointer ${
                    selectedModel.humanInTheLoop ? 'bg-amber-950 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {selectedModel.humanInTheLoop ? 'ACTIVO (OBLIGATORIO)' : 'AUTOMÁTICO'}
                </button>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-400 font-mono block">Última Auditoría</span>
                <span className="text-xs font-bold text-slate-200 font-mono mt-1 block">
                  {selectedModel.lastAudit}
                </span>
              </div>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Finalidad y Caso de Uso</h4>
              <p className="text-sm text-slate-300 bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-2xl leading-relaxed">
                {selectedModel.purpose}
              </p>
            </div>

            {/* Data Received vs Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> Datos Permitidos (Recibe)
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {selectedModel.dataReceived.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Datos PROHIBIDOS (NO Recibe)
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-mono">
                  {selectedModel.dataExcluded.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Security Controls & Access */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Gobernanza y Cumplimiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-1">Controles de Acceso (RBAC):</span>
                  <span className="text-lime-400 font-bold">{selectedModel.accessRole}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 block mb-1">Conservación de Datos:</span>
                  <span className="text-slate-200">{selectedModel.retentionPolicy}</span>
                </div>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <span className="text-slate-400 block mb-1">Purga de Datos:</span>
                  <button
                    onClick={() => purgeLogsForModel(selectedModel.name)}
                    className="text-rose-400 hover:text-white flex items-center gap-1 text-[11px] underline cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purgar datos de modelo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 2: Manual Review Queue (HITL) */}
      {activeTab === 'hitl' && (
        <ManualReviewQueue />
      )}

      {/* MAIN TAB 3: Real-Time Telemetry & Recharts Visualizations */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400 font-mono block">Uptime Promedio de Modelos</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">99.98% SLA</span>
              <span className="text-[10px] text-slate-500 font-mono block">Sincronización en directo</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400 font-mono block">Volumen Inferencia / Sesión</span>
              <span className="text-2xl font-black text-white font-mono">121,700 reqs</span>
              <span className="text-[10px] text-slate-500 font-mono block">Total activo en plataforma</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400 font-mono block">Datos Sensibles Sanitizados</span>
              <span className="text-2xl font-black text-lime-400 font-mono">1,660 KB</span>
              <span className="text-[10px] text-slate-500 font-mono block">133 registros PII enmascarados</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 shadow-lg">
              <span className="text-xs text-slate-400 font-mono block">Riesgo Financiero Protegido</span>
              <span className="text-2xl font-black text-amber-400 font-mono">$339,400 USD</span>
              <span className="text-[10px] text-slate-500 font-mono block">Interceptado por Cola HITL</span>
            </div>
          </div>

          {/* Chart 1: AI Model Uptime SLA (%) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Disponibilidad y SLA de Modelos en Tiempo Real (%)
                </h3>
                <p className="text-xs text-slate-400 font-mono">Monitoreo continuo de uptime para ReyAI, FraudGuard, CashFlow Prophet y SmartOCR.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                100% OPERATIVO
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeTrendData}>
                  <defs>
                    <linearGradient id="colorReyAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFraudGuard" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <YAxis domain={[99.9, 100]} stroke="#64748b" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="ReyAI" stroke="#84cc16" fillOpacity={1} fill="url(#colorReyAI)" />
                  <Area type="monotone" dataKey="FraudGuard" stroke="#10b981" fillOpacity={1} fill="url(#colorFraudGuard)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 2: Usage Volume per Model */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-lime-400" /> Volumen de Uso e Inferencia por Modelo
                </h3>
                <p className="text-xs text-slate-400 font-mono">Conteo de inferencias totales y consumo de tokens por sesión.</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="model" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} 
                    />
                    <Bar dataKey="Inferences" fill="#84cc16" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Sensitive Data Processed & Masked per Session */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" /> Datos Sensibles Procesados y PII Enmascarados por Sesión
                </h3>
                <p className="text-xs text-slate-400 font-mono">Volumen de carga financiera sanitizada (KB) vs Registros PII protegidos.</p>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensitiveDataSessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="session" stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '10px', fontFamily: 'monospace' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} 
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Bar dataKey="SanitizedPayloadKB" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Carga Sanitizada (KB)" />
                    <Bar dataKey="MaskedPIIRecords" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Registros PII Protegidos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-lime-400" /> Logs de Operaciones Importantes de IA
              </h2>
              <p className="text-xs text-slate-400 font-mono">Auditoría detallada de inferencias, latencia, tokens y revisiones humanas.</p>
            </div>
            <button 
              onClick={() => showToast('Logs exportados en formato JSON cifrado.')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono px-3 py-2 rounded-xl transition-all border border-slate-700 cursor-pointer"
            >
              Exportar Auditoría
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">TIMESTAMP (UTC)</th>
                  <th className="py-3 px-4">MOTOR IA</th>
                  <th className="py-3 px-4">ACCIÓN / FINALIDAD</th>
                  <th className="py-3 px-4">TOKENS</th>
                  <th className="py-3 px-4">ESTADO</th>
                  <th className="py-3 px-4">REVISIÓN HUMANA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3 px-4 text-slate-400">2026-10-02 20:42:10</td>
                  <td className="py-3 px-4 font-bold text-white">FraudGuard Risk</td>
                  <td className="py-3 px-4">Evaluación de transferencia SPEI de $45,000 USD</td>
                  <td className="py-3 px-4">840 tokens</td>
                  <td className="py-3 px-4"><span className="text-amber-400 font-bold">FLAGGED_HITL</span></td>
                  <td className="py-3 px-4"><span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">En Cola de Revisión</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">2026-10-02 19:38:02</td>
                  <td className="py-3 px-4 font-bold text-white">SmartOCR Parser</td>
                  <td className="py-3 px-4">Extracción de factura SAT #INV-2026-891</td>
                  <td className="py-3 px-4">1,420 tokens</td>
                  <td className="py-3 px-4"><span className="text-emerald-400">SUCCESS</span></td>
                  <td className="py-3 px-4"><span className="text-slate-500">No Requerida (Automático)</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-slate-400">2026-10-02 18:20:15</td>
                  <td className="py-3 px-4 font-bold text-white">ReyAI Assistant</td>
                  <td className="py-3 px-4">Consulta de estado de liquidez corporativa</td>
                  <td className="py-3 px-4">510 tokens</td>
                  <td className="py-3 px-4"><span className="text-emerald-400">SUCCESS</span></td>
                  <td className="py-3 px-4"><span className="text-slate-500">No Requerida (Automático)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN TAB 5: Risks Matrix */}
      {activeTab === 'risks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" /> Documentación de Riesgos y Mitigaciones
            </h2>
            <p className="text-xs text-slate-400 font-mono">Matriz de riesgos de inteligencia artificial en operaciones financieras.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">1. Alucinación en Cálculos Financieros</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">ALTO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Riesgo de que el modelo genere montos o proyecciones incorrectas en facturación o ledger.
              </p>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300">
                <strong>Mitigación:</strong> El motor contable valida matemáticamente todas las cifras mediante Drizzle ORM y Postgres antes de persistir o mostrar en saldos.
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">2. Fuga de Datos Confidenciales (PII)</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">MEDIO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Envío inadvertido de información fiscal privada o credenciales a servicios de terceros.
              </p>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300">
                <strong>Mitigación:</strong> Capa de saneamiento de datos en servidor que remueve tokens sensibles, claves y contraseñas previo a la inferencia.
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">3. Ejecución No Autorizada de Pagos</span>
                <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">CRÍTICO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Falsos positivos o manipulación en la aprobación automatizada de transacciones.
              </p>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300">
                <strong>Mitigación:</strong> Intercepción obligatoria en <em>Cola de Revisión Humana (HITL)</em> con firma de autorización de rol OWNER para transacciones flaggeadas.
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">4. Sesgo Algorítmico en Scoring de Riesgo</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">MEDIO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Denegación incorrecta de crédito o servicios a clientes legítimos.
              </p>
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-300">
                <strong>Mitigación:</strong> Auditorías periódicas de modelos y revisión de casos rechazados por comité de riesgo humano.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TAB 6: Privacy Policies */}
      {activeTab === 'policies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs font-mono">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-lime-400" /> Política de Conservación y Eliminación de Datos de IA
            </h2>
            <p className="text-slate-400 font-sans mt-0.5">Estándares de retención temporal, enmascaramiento y derecho al olvido.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">Política de Retención de Prompts e Inferencias</h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Los prompts y respuestas generados por los asistentes de EmmanAI se conservan de forma cifrada en bases de datos aisladas por inquilino (`organization_id`) por un período máximo de <strong>30 días</strong>, tras el cual se ejecuta un proceso automatizado de purga criptográfica irreversible.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">Derecho al Olvido y Mecanismos de Eliminación</h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Los administradores corporativos con rol `OWNER` pueden ejecutar en cualquier momento la eliminación total del historial de entrenamiento y caché de inferencia de cualquier modelo asociado a su organización utilizando el botón <em>"Purgar datos de modelo"</em> en el panel de control.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
              <h4 className="font-bold text-white text-sm">Aislamiento Multi-Tenant en Memoria de IA</h4>
              <p className="text-slate-300 font-sans leading-relaxed">
                Ningún dato corporativo de una organización es utilizado para entrenar o ajustar modelos públicos de IA. Las inferencias se ejecutan bajo contextos estrictamente aislados con tokens de sesión verificados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
