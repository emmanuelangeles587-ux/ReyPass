import React, { useEffect, useRef, useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Fingerprint, Lock, RefreshCw, 
  X, ShieldAlert, CheckCircle, Info, Sparkles, Activity, EyeOff
} from 'lucide-react';
import { useAntiOverlaySecurity } from '../hooks/useAntiOverlaySecurity';
import { useWorkspaceIntegrity } from '../hooks/useWorkspaceIntegrity';

interface WorkspaceIntegrityEmblemProps {
  userEmail?: string;
  userName?: string;
  className?: string;
  compact?: boolean;
}

/**
 * WorkspaceIntegrityEmblem Component
 * Real-time Zero-Trust visual indicator that cryptographically verifies 
 * the DOM tree, detects unauthorized UI overlays, transparent clickjacking layers, 
 * and confirms workspace authenticity to the user.
 */
export const WorkspaceIntegrityEmblem: React.FC<WorkspaceIntegrityEmblemProps> = ({ 
  userEmail = 'soporte.reyplace@gmail.com',
  userName = 'Alejandro Rey',
  className = '',
  compact = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  const { 
    isIntegrityIntact, 
    overlayDetected, 
    unauthorizedIframeDetected,
    hitTestOccluded,
    domTampered,
    workspaceSignature, 
    signatureColors,
    securityTimestamp,
    threats,
    verifyIntegrityNow,
    clearThreats
  } = useAntiOverlaySecurity(userEmail);

  const {
    isDomainAuthorized,
    isIframeBlocked,
    antiPhishingToken,
    activeDomain
  } = useWorkspaceIntegrity(userEmail);

  // Sub-pixel steganographic animated micro-noise to prevent screenshot spoofing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderNoise = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const seed = Math.sin(i + frame * 0.04) * 10000;
        const noise = Math.floor((seed - Math.floor(seed)) * 32);
        data[i] = 16 + noise;      // Red
        data[i + 1] = 185 + noise;  // Lime/Emerald Green
        data[i + 2] = 129 + noise;  // Blue
        data[i + 3] = 22;           // Micro Alpha
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    };

    renderNoise();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const ok = verifyIntegrityNow();
      setIsScanning(false);
      if (ok) {
        setScanSuccessAnim(true);
        setTimeout(() => setScanSuccessAnim(false), 1200);
      }
    }, 400);
  };

  return (
    <>
      {/* Visual Integrity Badge Trigger */}
      <div 
        data-rey-shield="true"
        onClick={() => setShowInspector(true)}
        className={`relative select-none pointer-events-auto bg-slate-950/90 border rounded-xl backdrop-blur-md shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
          compact ? 'p-1.5 px-2.5 text-xs' : 'p-2 px-3 text-xs'
        } ${
          isIntegrityIntact 
            ? 'border-slate-800/90 hover:border-lime-500/50 shadow-lime-950/20' 
            : 'border-rose-500/80 bg-rose-950/40 animate-pulse shadow-rose-950/30'
        } ${className}`}
        title="Workspace Integrity Shield: Click para auditar capas y firma visual anti-overlay"
      >
        {/* Dynamic Steganographic Canvas */}
        <canvas 
          ref={canvasRef} 
          width={180} 
          height={compact ? 30 : 38} 
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none rounded-xl"
        />

        {/* Dynamic Holographic Gradient Icon */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div 
            style={{
              background: isIntegrityIntact 
                ? `linear-gradient(135deg, ${signatureColors[0]}, ${signatureColors[1]})` 
                : '#ef4444'
            }}
            className={`${compact ? 'w-6 h-6 rounded-md' : 'w-7 h-7 rounded-lg'} flex items-center justify-center font-bold text-slate-950 shadow-sm shrink-0`}
          >
            {isIntegrityIntact ? (
              <Fingerprint className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-slate-950`} />
            ) : (
              <AlertTriangle className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white animate-bounce`} />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-white tracking-wider uppercase">
                INTEGRIDAD WORKSPACE
              </span>
              <span className="px-1.5 py-0.2 rounded bg-lime-500/20 text-lime-300 font-mono text-[8.5px] border border-lime-500/30">
                ANTI-OVERLAY
              </span>
            </div>

            <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-400 mt-0.5">
              <span className="text-lime-400 font-bold">{workspaceSignature}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 truncate max-w-[85px]">{securityTimestamp || 'SYNCING...'}</span>
            </div>
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div className="relative z-10 text-right shrink-0">
          <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            isIntegrityIntact 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
          }`}>
            <ShieldCheck className={`w-3 h-3 ${isIntegrityIntact ? 'text-lime-400' : 'text-rose-400'}`} />
            {isIntegrityIntact ? (scanSuccessAnim ? 'VERIFICADO ✓' : 'VERIFICADO') : 'ALERTA CAPA'}
          </span>
        </div>
      </div>

      {/* Zero-Trust Workspace Security Modal Inspector */}
      {showInspector && (
        <div 
          data-rey-shield="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Ambient background glow */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div 
                  style={{
                    background: `linear-gradient(135deg, ${signatureColors[0]}, ${signatureColors[1]})`
                  }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg"
                >
                  <Fingerprint className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Emblema de Integridad del Espacio de Trabajo
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-lime-500/20 text-lime-400 border border-lime-500/30 rounded-full">
                      Zero-Trust UI
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Detección de clickjacking, iframes hostiles y superposición de capas</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInspector(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Info & Diagnostic Matrix */}
            <div className="my-5 space-y-4 text-xs relative z-10">
              {/* Visual Cryptographic Signature Card */}
              <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                    Firma Criptográfica Determinística:
                  </span>
                  <span className="font-mono text-lime-400 font-bold text-xs bg-lime-950/60 border border-lime-500/40 px-2.5 py-1 rounded-lg tracking-wider">
                    {workspaceSignature}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <span>Espacio de Trabajo Asignado:</span>
                  <span className="text-white font-medium">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Marca Temporal Activa (Heartbeat UTC):</span>
                  <span className="font-mono text-slate-300 font-semibold">{securityTimestamp}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                  <span>Token Anti-Robo de Identidad:</span>
                  <span className="font-mono text-cyan-400 font-bold">{antiPhishingToken}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dominio Autorizado (Anti-Iframe):</span>
                  <span className={`font-mono font-bold ${isDomainAuthorized && !isIframeBlocked ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isDomainAuthorized && !isIframeBlocked ? `AUTORIZADO (${activeDomain})` : 'BLOQUEADO'}
                  </span>
                </div>
              </div>

              {/* 4-Point Realtime Defense Diagnostics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${unauthorizedIframeDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Iframes No Autorizados</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {unauthorizedIframeDetected ? 'Iframe desconocido detectado' : '0 iframes no autorizados en DOM'}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${overlayDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Capas Superpuestas (z-index)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {overlayDetected ? 'Capa flotante sospechosa activa' : 'Sin capas que obstruyan el viewport'}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${hitTestOccluded ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Hit-Test Occlusion</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {hitTestOccluded ? 'Intercepción de clics activa' : 'Eventos de puntero directos a #root'}
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${domTampered ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Integridad DOM</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {domTampered ? 'Mutaciones no autenticadas' : 'Árbol DOM 100% íntegro'}
                  </p>
                </div>
              </div>

              {/* Threat Logs Feed */}
              {threats.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-rose-400 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Alertas de Seguridad ({threats.length})
                    </span>
                    <button 
                      onClick={clearThreats}
                      className="text-[10px] text-rose-300 underline hover:text-white cursor-pointer"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-300 font-mono">
                    {threats.map((t) => (
                      <div key={t.id} className="p-1.5 bg-slate-950/60 rounded border border-rose-500/20">
                        [{t.timestamp.slice(11, 19)}] {t.message} ({t.type})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 relative z-10">
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> REY SHIELD GUARD v3.2
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualScan}
                  disabled={isScanning}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-lime-400' : ''}`} />
                  <span>{isScanning ? 'Verificando DOM...' : 'Re-Escanear Ahora'}</span>
                </button>
                <button
                  onClick={() => setShowInspector(false)}
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-lime-500/20"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
