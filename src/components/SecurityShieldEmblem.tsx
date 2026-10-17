import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertTriangle, Fingerprint, Lock, RefreshCw, X, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { useAntiOverlaySecurity } from '../hooks/useAntiOverlaySecurity';

interface SecurityShieldEmblemProps {
  userEmail?: string;
  userName?: string;
}

export const SecurityShieldEmblem: React.FC<SecurityShieldEmblemProps> = ({ 
  userEmail = 'soporte.reyplace@gmail.com',
  userName = 'Alejandro Rey'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  // Render sub-pixel steganographic micro-noise canvas
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
        const noise = Math.floor((seed - Math.floor(seed)) * 30);
        data[i] = 20 + noise;     // R
        data[i + 1] = 190 + noise; // G (Lime/Emerald)
        data[i + 2] = 130 + noise; // B
        data[i + 3] = 22;          // Subdued Alpha
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
      verifyIntegrityNow();
      setIsScanning(false);
    }, 450);
  };

  return (
    <>
      <div 
        data-rey-shield="true"
        onClick={() => setShowDetails(true)}
        className={`relative select-none pointer-events-auto bg-slate-950/90 border rounded-xl p-2 px-3 backdrop-blur-md shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] hover:border-lime-500/50 ${
          isIntegrityIntact 
            ? 'border-slate-800/80 shadow-lime-950/20' 
            : 'border-rose-500/80 bg-rose-950/30 animate-pulse'
        }`}
        title="Clic para verificar la integridad del espacio de trabajo y firma visual"
      >
        {/* Background Anti-Spoofing Canvas Watermark */}
        <canvas 
          ref={canvasRef} 
          width={180} 
          height={38} 
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none rounded-xl"
        />

        {/* Workspace Visual Signature Emblem */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div 
            style={{
              background: isIntegrityIntact 
                ? `linear-gradient(135deg, ${signatureColors[0]}, ${signatureColors[1]})` 
                : '#ef4444'
            }}
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-sm shrink-0"
          >
            {isIntegrityIntact ? (
              <Fingerprint className="w-4 h-4 text-slate-950" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold text-white tracking-wider uppercase">
                EMBLEMA DE INTEGRIDAD
              </span>
              <span className="px-1.5 py-0.2 rounded bg-lime-500/20 text-lime-300 font-mono text-[8.5px] border border-lime-500/30">
                ANTI-OVERLAY
              </span>
            </div>

            <div className="flex items-center gap-2 text-[9.5px] font-mono text-slate-400 mt-0.5">
              <span className="text-lime-400 font-bold">{workspaceSignature}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 truncate max-w-[90px]">{securityTimestamp || 'SYNCING...'}</span>
            </div>
          </div>
        </div>

        {/* Integrity Badge Status */}
        <div className="relative z-10 text-right shrink-0">
          <span className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
            isIntegrityIntact 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
          }`}>
            <ShieldCheck className={`w-3 h-3 ${isIntegrityIntact ? 'text-lime-400' : 'text-rose-400'}`} />
            {isIntegrityIntact ? 'INTEGRO' : 'ALERTA CAPA'}
          </span>
        </div>
      </div>

      {/* Security Inspector Modal */}
      {showDetails && (
        <div 
          data-rey-shield="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{
                    background: `linear-gradient(135deg, ${signatureColors[0]}, ${signatureColors[1]})`
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md"
                >
                  <Fingerprint className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Escudo Anti-Overlay & Clickjacking
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-lime-500/20 text-lime-400 border border-lime-500/30 rounded-full">
                      Zero-Trust UI
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Verificación de Integridad del Contenedor de Trabajo</p>
                </div>
              </div>

              <button 
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs">
              {/* Visual Signature Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[11px]">Firma Criptográfica Determinística:</span>
                  <span className="font-mono text-lime-400 font-bold text-xs bg-lime-950/40 border border-lime-500/30 px-2 py-0.5 rounded">
                    {workspaceSignature}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Usuario Verificado:</span>
                  <span className="text-white font-medium">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Marca Temporal Activa:</span>
                  <span className="font-mono text-slate-300">{securityTimestamp}</span>
                </div>
              </div>

              {/* Status Diagnostics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${unauthorizedIframeDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Iframes Embebidos</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {unauthorizedIframeDetected ? 'Iframe sospechoso detectado' : '0 iframes no autorizados'}
                  </p>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${overlayDetected ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Capas Superpuestas</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {overlayDetected ? 'Capa z-index sospechosa' : 'Ninguna capa sobrepuesta'}
                  </p>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${hitTestOccluded ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Hit-Testing Occlusion</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {hitTestOccluded ? 'Intercepción de clics activa' : 'Eventos de puntero directos'}
                  </p>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-slate-300 mb-1">
                    <CheckCircle className={`w-3.5 h-3.5 ${domTampered ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span className="font-semibold text-[11px]">Integridad DOM</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {domTampered ? 'Mutaciones no reconocidas' : 'Árbol DOM 100% íntegro'}
                  </p>
                </div>
              </div>

              {/* Threat Logs if any */}
              {threats.length > 0 && (
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-rose-400 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Amenazas Registradas ({threats.length})
                    </span>
                    <button 
                      onClick={clearThreats}
                      className="text-[10px] text-rose-300 underline hover:text-white cursor-pointer"
                    >
                      Limpiar Historial
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

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono">
                Protegido por REY SHIELD GUARD v3.0
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleManualScan}
                  disabled={isScanning}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-lime-400' : ''}`} />
                  <span>{isScanning ? 'Escaneando DOM...' : 'Re-Escanear Ahora'}</span>
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
