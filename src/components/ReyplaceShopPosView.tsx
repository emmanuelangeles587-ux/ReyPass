import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, QrCode, MapPin, Receipt, ArrowRight, 
  RotateCcw, User, Phone, ShieldCheck, Download, ExternalLink, Info
} from 'lucide-react';

interface TicketItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const ReyplaceShopPosView: React.FC = () => {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [clientInput, setClientInput] = useState('');
  const [registeredClient, setRegisteredClient] = useState<string | null>(null);
  const [isVip, setIsVip] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const catalogProducts = [
    { name: 'Torta Especial', price: 85, category: 'Especialidades' },
    { name: 'Refresco 600ml', price: 25, category: 'Bebidas' },
    { name: 'Combo Rey', price: 130, category: 'Combos' },
    { name: 'Café Americano', price: 35, category: 'Cafetería' },
    { name: 'Tacos al Pastor (Ord.)', price: 90, category: 'Antojitos' },
    { name: 'Agua Fresca 1L', price: 30, category: 'Bebidas' }
  ];

  const total = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  // Regla de Puntos: $10 MXN = 1 Punto Reyplace
  const earnedPoints = Math.floor(total / 10);

  const addItem = (name: string, price: number) => {
    setIsPaid(false);
    setShowQr(false);
    setItems(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing) {
        return prev.map(i => i.name === name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: 'it_' + Date.now() + Math.random(), name, price, qty: 1 }];
    });
  };

  const removeItem = (name: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.name === name);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.name === name ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.name !== name);
    });
  };

  const clearTicket = () => {
    setItems([]);
    setShowQr(false);
    setIsPaid(false);
  };

  const registerClient = () => {
    if (!clientInput.trim()) {
      setNotification('Por favor ingresa un nombre o teléfono válido.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setRegisteredClient(clientInput.trim());
    setIsVip(true);
    setClientInput('');
    setNotification(`Cliente "${clientInput.trim()}" registrado con Nivel VIP.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const generateQR = () => {
    if (total === 0) {
      setNotification('Por favor agrega al menos un producto al ticket.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShowQr(true);
    setIsPaid(false);
  };

  const simulatePaymentReceived = () => {
    setIsPaid(true);
    setNotification(`¡Pago CoDi / SPEI confirmado! +${earnedPoints} Puntos Reyplace acreditados a ${registeredClient || 'Público General'}. Factura CFDI 4.0 generada.`);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-full py-8 px-4 flex flex-col items-center select-none font-sans" style={{
      background: 'linear-gradient(135deg, #180e29 0%, #0d1830 50%, #082138 100%)',
      color: '#ffffff'
    }}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 z-50 bg-[#0d1326] border border-[#00d2ff] text-[#00d2ff] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-[#ff7b00]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <header className="text-center mb-6">
        <div className="text-4xl font-extrabold tracking-wider">
          Reyplace<span style={{ color: '#ff7b00' }}>.Shop</span>
        </div>
        <div className="text-[11px] tracking-widest uppercase mt-1 font-bold" style={{ color: '#00d2ff' }}>
          Conectamos · Innovamos · Transformamos
        </div>
      </header>

      {/* Main 2-Panel Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[950px]">
        {/* Panel 1: Catálogo y Acceso al Mapa / Tarjeta Web */}
        <div className="rounded-2xl p-6 shadow-2xl flex flex-col justify-between" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <div>
            <h2 className="text-lg font-bold mb-4 flex justify-between items-center" style={{ color: '#00d2ff' }}>
              <span>1. Menú & Ecosistema</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-[#00d2ff]">
                POS RÁPIDO
              </span>
            </h2>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {catalogProducts.map((prod) => (
                <button
                  key={prod.name}
                  onClick={() => addItem(prod.name, prod.price)}
                  className="p-3.5 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00d2ff';
                    e.currentTarget.style.color = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <span className="font-semibold text-sm leading-tight">{prod.name}</span>
                  <span className="text-xs font-mono font-bold mt-2 opacity-90">${prod.price} MXN</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            {/* Botón Tarjeta Web / Mapa */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="w-full p-3 rounded-xl font-bold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: showMap ? '#00d2ff' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid #00d2ff',
                color: showMap ? '#000000' : '#00d2ff'
              }}
            >
              <MapPin className="w-4 h-4" />
              <span>📍 Ver Tarjeta Web en el Mapa (Los Mochis)</span>
            </button>

            {/* Sección del Mapa Desplegable */}
            {showMap && (
              <div className="mt-3 p-4 rounded-xl text-left text-xs space-y-2 animate-in fade-in" style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(0, 210, 255, 0.2)'
              }}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-white text-sm">Fonda El Rey</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Negocio Asociado:</strong> Fonda El Rey<br />
                  <strong>Ubicación:</strong> Los Mochis, Sinaloa, México<br />
                  <strong>Estado:</strong> Activo en el Ecosistema Digital Global
                </p>
                <div className="pt-2 flex items-center justify-between font-mono" style={{ color: '#00d2ff' }}>
                  <span>✔ Sincronizado con POS y Red de Pagos</span>
                  <span className="text-[10px] text-slate-400">STP / SPEI Habilitado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Caja, Registro de Cliente y Cobro */}
        <div className="rounded-2xl p-6 shadow-2xl flex flex-col justify-between" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
          <div>
            <div className="flex items-center justify-between mb-4 pb-1">
              <h2 className="text-lg font-bold" style={{ color: '#00d2ff' }}>
                2. Caja y Lealtad Reyplace
              </h2>
              {items.length > 0 && (
                <button
                  onClick={clearTicket}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 font-mono cursor-pointer"
                  title="Vaciar ticket"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              )}
            </div>

            {/* Ticket / Resumen */}
            <div className="rounded-xl p-3.5 mb-3 min-h-[110px] max-h-[160px] overflow-y-auto space-y-1.5" style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {items.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-xs font-mono">
                  Selecciona productos del menú...
                </p>
              ) : (
                items.map((i) => (
                  <div key={i.id} className="flex justify-between items-center text-sm font-mono py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">{i.qty}x</span>
                      <span className="text-white">{i.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">${i.price * i.qty} MXN</span>
                      <button
                        onClick={() => removeItem(i.name)}
                        className="text-slate-500 hover:text-rose-400 text-xs px-1 cursor-pointer"
                        title="Quitar uno"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Box */}
            <div className="border-t border-white/20 pt-2.5 flex justify-between items-center text-xl font-bold mb-3" style={{
              color: '#ff7b00'
            }}>
              <span className="text-base text-white font-medium">Total a Cobrar:</span>
              <span id="total-val">${total} MXN</span>
            </div>

            {/* Sección de Cliente y Registro */}
            <div className="rounded-xl p-3 mb-3 flex flex-col gap-2" style={{
              background: 'rgba(0, 210, 255, 0.05)',
              border: '1px dashed #00d2ff'
            }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="clientName"
                  value={clientInput}
                  onChange={(e) => setClientInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && registerClient()}
                  placeholder="Nombre o Teléfono del Cliente"
                  className="flex-1 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 outline-none"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                />
                <button
                  onClick={registerClient}
                  className="px-3 py-2 rounded-lg text-xs font-bold text-black cursor-pointer transition-all hover:opacity-90"
                  style={{ background: '#00d2ff' }}
                >
                  Registrar
                </button>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span id="client-display" className="text-slate-300">
                  Cliente: <strong className="text-white">{registeredClient || 'Público General'}</strong> {isVip && <span className="text-[#00d2ff] font-bold">(VIP)</span>}
                </span>
                <div className="font-bold text-xs px-2.5 py-0.5 rounded-full text-black flex items-center gap-1" style={{
                  background: '#ff7b00'
                }}>
                  <Sparkles className="w-3 h-3 text-black" />
                  <span>+{earnedPoints} Pts</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Botón de Cobro */}
            <button
              onClick={generateQR}
              disabled={total === 0}
              className="w-full py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #e0007b, #00d2ff)',
                color: '#ffffff'
              }}
            >
              Generar QR CoDi / SPEI
            </button>

            {/* Contenedor QR Dinámico */}
            {showQr && (
              <div className="mt-3 p-4 rounded-xl text-center space-y-2 animate-in fade-in" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 210, 255, 0.3)'
              }}>
                <p className="text-xs font-semibold" style={{ color: '#00d2ff' }}>
                  Escanea con la App de tu Banco (CoDi / SPEI)
                </p>

                <div className="w-36 h-36 bg-white mx-auto p-2 rounded-xl flex items-center justify-center shadow-lg relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=CODIPAY_REYPLACE_AMOUNT_${total}_REF_8829`}
                    alt="QR de Pago CoDi"
                    className="w-full h-full object-contain"
                  />
                  {isPaid && (
                    <div className="absolute inset-0 bg-emerald-950/90 rounded-xl flex flex-col items-center justify-center text-emerald-400 p-2 animate-in zoom-in-90">
                      <CheckCircle2 className="w-10 h-10 mb-1" />
                      <span className="font-black text-xs uppercase">PAGADO</span>
                    </div>
                  )}
                </div>

                <div className="font-mono text-[11px] text-slate-300 space-y-1">
                  <div>Monto exacto: <strong className="text-white">${total} MXN</strong></div>
                  <div className="text-[10px] text-slate-400">CFDI 4.0 y Puntos abonados al instante</div>
                </div>

                {!isPaid ? (
                  <button
                    onClick={simulatePaymentReceived}
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold text-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    style={{ background: '#00d2ff' }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simular Pago Bancario Confirmado</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                    ✔ Factura SAT CFDI 4.0 emitida & recibo enviado por WhatsApp al cliente.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
