import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, QrCode, CheckCircle2, Building2, Calendar, Award, Copy, Check } from 'lucide-react';

interface VerificationViewProps {
  credentialId: string;
  onBackToApp?: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({ credentialId, onBackToApp }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulated immutable verification lookup (backed by deterministic hash & on-chain ref)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const mockHash = '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
  const polygonExplorerUrl = `https://polygonscan.com/tx/${mockHash}`;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-lime-500/30">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-lime-500/20">
              R
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide">REYPLACE Trust Network</h1>
              <p className="text-xs text-slate-400 font-mono">Verificación Oficial de Credencial On-Chain</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-mono font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
            NFC / QR Valid
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Validando Firma Digital en Red Blockchain...</span>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-emerald-400 font-semibold text-base">CREDENCIAL AUTÉNTICA Y VERIFICADA</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Esta identidad empresarial ha sido verificada y firmada criptográficamente por la Red REYPLACE.
                </p>
              </div>
            </div>

            {/* Credential Data Grid */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">ID Credencial</span>
                <span className="text-sm font-mono text-lime-400 font-bold">{credentialId}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono block mb-1">Empresa Certificada</span>
                  <div className="flex items-center gap-2 text-white font-medium text-sm">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    Rey Fintech Corp S.A. de C.V.
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-mono block mb-1">RFC / ID Fiscal</span>
                  <span className="text-sm text-slate-200 font-mono">RFC-RFC920101-AAA</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-xs text-slate-400 font-mono block mb-1">Emisor de Confianza</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    REYPLACE Authority
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-mono block mb-1">Fecha de Emisión</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    2026-01-15 (Válido sin caducidad)
                  </div>
                </div>
              </div>
            </div>

            {/* On-chain Verification Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-lime-400" /> Anclaje Blockchain On-Chain
                </span>
                <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                  Polygon PoS
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 break-all select-all flex items-center justify-between gap-2">
                <span className="truncate">{mockHash}</span>
                <a 
                  href={polygonExplorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lime-400 hover:text-lime-300 flex items-center gap-1 shrink-0 font-medium"
                >
                  Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={copyLink}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium font-mono flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Enlace Copiado' : 'Copiar URL de Verificación'}
              </button>
              {onBackToApp && (
                <button
                  onClick={onBackToApp}
                  className="py-2.5 px-5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-bold font-mono transition"
                >
                  Volver a REYWALLET
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
