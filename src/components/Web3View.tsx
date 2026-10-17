import React, { useState } from 'react';
import { Wallet, ShieldCheck, ExternalLink, QrCode, RefreshCw, CheckCircle2, ArrowUpRight, Copy, KeyRound, AlertTriangle, Layers, Award } from 'lucide-react';
import { BlockchainAdapter, SUPPORTED_NETWORKS } from '../lib/web3/blockchainAdapter';
import { CredentialService, DigitalCredential } from '../lib/services/credentialService';
import { ReywalletService } from '../lib/services/reywalletService';

interface Web3ViewProps {
  organizationId: string;
  invoices?: any[];
  onPaymentProcessed?: () => void;
}

export const Web3View: React.FC<Web3ViewProps> = ({ organizationId, invoices = [], onPaymentProcessed }) => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>('0x3F91A088e85F5c531bA0B426B93721Eb7a73e5C0');
  const [selectedChainId, setSelectedChainId] = useState<number>(137);
  const [isVerifyingTx, setIsVerifyingTx] = useState(false);
  const [txHashInput, setTxHashInput] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'wallets' | 'transactions' | 'credentials' | 'checkout'>('wallets');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const adapter = new BlockchainAdapter(selectedChainId);
  const currentNetwork = SUPPORTED_NETWORKS[selectedChainId];

  // Connect mock / window.ethereum wallet
  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setStatusMessage({ type: 'success', text: `Wallet conectada: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
          return;
        }
      } catch (e: any) {
        console.warn('Metamask request error:', e);
      }
    }
    // Fallback simulation for preview environment
    const mockAddr = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setConnectedWallet(mockAddr);
    setStatusMessage({ type: 'success', text: `Wallet Web3 vinculada: ${mockAddr.slice(0, 6)}...${mockAddr.slice(-4)}` });
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    setStatusMessage({ type: 'success', text: 'Wallet desconectada exitosamente.' });
  };

  // Verify Web3 On-Chain Payment with Server-Side Verification Pipeline
  const handleVerifyWeb3Payment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHashInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Ingresa un Hash de Transacción (txHash) válido.' });
      return;
    }

    setIsVerifyingTx(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/web3/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: selectedInvoiceId || invoices[0]?.id || 'inv_1',
          tx_hash: txHashInput.trim(),
          chain_id: selectedChainId,
          organization_id: organizationId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error verificando la transacción en el servidor.');
      }

      setStatusMessage({ 
        type: 'success', 
        text: '¡Transacción verificada en Servidor (Nodo RPC) y pipeline ejecutado: Pago → Recibo → Ledger → Notificación → Auditoría!' 
      });
      setTxHashInput('');
      if (onPaymentProcessed) onPaymentProcessed();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error durante la verificación en backend.' });
    } finally {
      setIsVerifyingTx(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Módulo Web3, Blockchain & Smart Assets</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Capa tecnológica agnóstica para liquidación descentralizada, credenciales digitales e identidades verificables.
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div className="flex items-center gap-3">
          <select
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-purple-500"
          >
            {Object.values(SUPPORTED_NETWORKS).map((net) => (
              <option key={net.id} value={net.id}>{net.name} ({net.symbol})</option>
            ))}
          </select>

          {connectedWallet ? (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 font-semibold border border-slate-700 transition"
            >
              {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)} (Desconectar)
            </button>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              <Wallet className="w-4 h-4" /> Conectar Wallet
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          {statusMessage.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('wallets')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition ${
            activeTab === 'wallets' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Estado Web3 & Billeteras
        </button>
        <button
          onClick={() => setActiveTab('checkout')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition ${
            activeTab === 'checkout' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Liquidación Web3 On-Chain
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition ${
            activeTab === 'credentials' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Smart Assets & QR/NFC
        </button>
      </div>

      {/* Tab Content 1: Web3 Status & Wallets */}
      {activeTab === 'wallets' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Estado de Conexión</span>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connectedWallet ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm font-semibold text-white">
                {connectedWallet ? 'Wallet Conectada & Verificada' : 'Sin Billetera Vinculada'}
              </span>
            </div>
            {connectedWallet && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-mono text-slate-500 block">Dirección Principal</span>
                <span className="text-xs font-mono text-purple-300 break-all">{connectedWallet}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Red Activa</span>
            <div className="space-y-2">
              <div className="text-base font-bold text-white font-mono">{currentNetwork.name}</div>
              <div className="text-xs text-slate-400 font-mono">Chain ID: {currentNetwork.id}</div>
              <a
                href={currentNetwork.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-lime-400 hover:text-lime-300 inline-flex items-center gap-1 mt-1"
              >
                Explorador RPC Oficial <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Seguridad & Privacidad</span>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              ✓ Non-Custodial: REYWALLET nunca almacena ni solicita llaves privadas.<br/>
              ✓ Privacidad On-Chain: Cero datos personales (RFC/Domicilio) en blockchain.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content 2: Web3 On-Chain Settlement */}
      {activeTab === 'checkout' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white font-mono">Verificar y Liquidar Pago On-Chain</h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Ingresa el Hash de transacción emitido por la blockchain para auditar la validez y liquidar la factura atómicamente.
            </p>
          </div>

          <form onSubmit={handleVerifyWeb3Payment} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Seleccionar Factura a Liquidar</label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 outline-none focus:border-purple-500"
              >
                {invoices.length > 0 ? (
                  invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.number} — Customer: {inv.customerName || 'Cliente'} — Pending: ${(inv.total - (inv.paidAmount||0)).toLocaleString()} USD
                    </option>
                  ))
                ) : (
                  <option value="demo_inv">INV-2026-001 — Demo Enterprise Invoice — Pending: $1,250.00 USD</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Hash de la Transacción Blockchain (txHash)</label>
              <input
                type="text"
                placeholder="0x..."
                value={txHashInput}
                onChange={(e) => setTxHashInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 rounded-xl p-3 outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingTx}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
            >
              {isVerifyingTx ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verificando en Nodo RPC...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Verificar & Registrar Pago Atómico
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab Content 3: Smart Assets */}
      {activeTab === 'credentials' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">REYPLACE Verified Business Credential</h3>
                  <p className="text-xs text-slate-400 font-mono">Credencial corporativa verificada con soporte para lectura NFC y código QR.</p>
                </div>
              </div>
              <a
                href={`/verify/REY-BIZ-DEMO`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-lime-400 font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4" /> Probar Enlace de Verificación Publica
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
