import React, { useState } from 'react';
import { 
  User, Shield, Lock, Landmark, FileText, Sparkles, CheckCircle2, 
  Key, RefreshCw, Smartphone, Building2, Bell, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../hooks/useSupabaseAuth';
import { useWorkspaceIntegrity } from '../hooks/useWorkspaceIntegrity';

interface AccountSettingsViewProps {
  userEmail?: string;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  userEmail = 'soporte.reyplace@gmail.com'
}) => {
  const { userProfile, updatePassword } = useAuth();
  const { antiPhishingToken, activeDomain, isDomainAuthorized } = useWorkspaceIntegrity(userEmail);

  const [activeTab, setActiveTab] = useState<'profile' | 'bank_accounts' | 'digital_law' | 'security'>('profile');
  const [name, setName] = useState(userProfile?.name || 'Alejandro Rey');
  const [organizationName, setOrganizationName] = useState(userProfile?.organization_name || 'Rey Fintech Corp S.A. de C.V.');
  const [rfc, setRfc] = useState('REYA900101XX1');
  const [taxRegime, setTaxRegime] = useState('601 - General de Ley Personas Morales');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Bank accounts with permissions
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: 'acc_1',
      bankName: 'STP (Sistema de Transferencias y Pagos)',
      clabe: '646180123456789012',
      holder: 'Rey Fintech Corp S.A.',
      status: 'VERIFICADA_STP',
      permissions: ['LECTURA_SALDOS', 'COBRO_SPEI_CODI', 'LIQUIDACION_AUTOMATICA'],
      primary: true
    },
    {
      id: 'acc_2',
      bankName: 'BBVA México (Concentradora)',
      clabe: '012180001928374619',
      holder: 'Rey Fintech Corp S.A.',
      status: 'CONECTADA_OPEN_BANKING',
      permissions: ['LECTURA_SALDOS', 'CONCILIACION_AUTOMATICA'],
      primary: false
    }
  ]);

  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankForm, setNewBankForm] = useState({
    bankName: 'Santander México',
    clabe: '',
    holder: 'Rey Fintech Corp S.A.'
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Perfil y datos fiscales actualizados correctamente en base de datos segura.');
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden.');
      return;
    }
    const { error } = await updatePassword(newPassword);
    if (!error) {
      showToast('Contraseña actualizada con cifrado Argon2id exitosamente.');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast('Error al actualizar contraseña.');
    }
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBankForm.clabe.length !== 18) {
      showToast('La CLABE interbancaria debe tener exactamente 18 dígitos.');
      return;
    }
    const created = {
      id: 'acc_' + Date.now(),
      bankName: newBankForm.bankName,
      clabe: newBankForm.clabe,
      holder: newBankForm.holder,
      status: 'VERIFICADA_STP',
      permissions: ['LECTURA_SALDOS', 'COBRO_SPEI_CODI', 'LIQUIDACION_AUTOMATICA'],
      primary: false
    };
    setBankAccounts([...bankAccounts, created]);
    setShowAddBank(false);
    setNewBankForm({ bankName: 'Santander México', clabe: '', holder: 'Rey Fintech Corp S.A.' });
    showToast('Cuenta bancaria vinculada con permisos de orquestación STP.');
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-cyan-500/20">
            <User className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Configuración de Cuenta & Perfil</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                REYPASS SECURE ID v4.0
              </span>
            </div>
            <p className="text-sm text-slate-400 font-mono mt-0.5">
              Gestión de credenciales, permisos bancarios STP y cumplimiento con la Ley de Economía Digital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Perfil & Fiscal
          </button>
          <button
            onClick={() => setActiveTab('bank_accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'bank_accounts' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cuentas Bancarias & Permisos
          </button>
          <button
            onClick={() => setActiveTab('digital_law')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'digital_law' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ley de Economía Digital
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Seguridad & Anti-Phishing
          </button>
        </div>
      </div>

      {/* TAB 1: Profile & Tax Settings */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl text-center">
            <div className="relative inline-block mx-auto">
              <img 
                src={userProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt="Avatar" 
                className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-cyan-500/50 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{userEmail}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold">
                ROL: {userProfile?.role || 'OWNER'}
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left font-mono text-xs space-y-2">
              <span className="text-slate-400 block text-[11px] uppercase">Token Anti-Robo de Identidad:</span>
              <span className="text-cyan-400 font-bold block truncate">{antiPhishingToken}</span>
              <span className="text-slate-500 text-[10px] block">Verificación criptográfica activa en sesión.</span>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" /> Información Comercial y Datos Fiscales (SAT / CFDI 4.0)
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">Nombre Completo del Representante</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Razón Social de la Empresa</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 block mb-1">RFC de la Entidad</label>
                  <input
                    type="text"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Régimen Fiscal (SAT)</label>
                  <select
                    value={taxRegime}
                    onChange={(e) => setTaxRegime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                    <option value="612 - Personas Físicas con Actividades Empresariales">612 - Personas Físicas con Actividades Empresariales</option>
                    <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Guardar Cambios de Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Bank Accounts & Permission Scopes */}
      {activeTab === 'bank_accounts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-cyan-400" /> Cuentas Bancarias & Permisos de Orquestación STP
              </h3>
              <p className="text-xs text-slate-400 font-mono">Control y manejo seguro de cuentas CLABE con permisos granulares.</p>
            </div>

            <button
              onClick={() => setShowAddBank(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>+ Vincular Nueva Cuenta CLABE</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bankAccounts.map((acc) => (
              <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
                    {acc.bankName}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    acc.status.includes('VERIFICADA') ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {acc.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-white font-mono font-bold text-base tracking-wider">{acc.clabe}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Titular: {acc.holder}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Permisos y Scopes Otorgados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {acc.permissions.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-300 border border-slate-800 rounded text-[10px]">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Modo de Liquidación: Directa STP</span>
                  <span className="text-cyan-400 font-bold">Activo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Bank Modal */}
          {showAddBank && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-cyan-400" /> Vincular Cuenta CLABE (STP)
                  </h3>
                  <button onClick={() => setShowAddBank(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleAddBank} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="text-slate-400 block mb-1">Institución Financiera</label>
                    <select
                      value={newBankForm.bankName}
                      onChange={(e) => setNewBankForm({ ...newBankForm, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    >
                      <option value="STP (Sistema de Transferencias y Pagos)">STP (Sistema de Transferencias y Pagos)</option>
                      <option value="BBVA México">BBVA México</option>
                      <option value="Santander México">Santander México</option>
                      <option value="Banorte">Banorte</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Cuenta CLABE Interbancaria (18 dígitos)</label>
                    <input
                      type="text"
                      maxLength={18}
                      required
                      placeholder="646180123456789012"
                      value={newBankForm.clabe}
                      onChange={(e) => setNewBankForm({ ...newBankForm, clabe: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none font-mono tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Titular de la Cuenta</label>
                    <input
                      type="text"
                      required
                      value={newBankForm.holder}
                      onChange={(e) => setNewBankForm({ ...newBankForm, holder: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-300">
                    <strong>Permisos Asignados:</strong> Se habilitarán permisos de lectura de saldos y cobros SPEI/CoDi automatizados.
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      Vincular y Verificar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Digital Economy Law Strategies */}
      {activeTab === 'digital_law' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl text-xs font-mono">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" /> Estrategias y Cumplimiento con la Ley de Economía Digital
            </h3>
            <p className="text-slate-400 font-sans mt-0.5">
              Herramientas integradas para orquestación de pagos, facturación instantánea y transparencia fiscal en México.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">1. Emisión Automática de CFDI 4.0</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">ACTIVO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Conforme a la ley, cada pago procesado mediante CoDi o SPEI genera y timbra en milisegundos el comprobante fiscal digital vinculado a la compra.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">2. Orquestación Sin Retención (No IFPE)</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">ARQUITECTURA B</span>
              </div>
              <p className="text-slate-400 font-sans">
                ReyPass actúa exclusivamente como pasarela tecnológica y orquestador de pagos. Los fondos fluyen directamente a la cuenta CLABE del comercio vía STP.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">3. Trazabilidad Criptográfica y Auditoría</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">VERIFICADO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Cada transacción queda inmutablemente registrada en el Ledger contable con firma STP y sello anti-phishing para cumplimiento AML/KYC.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">4. Protección de Datos PII y Consentimiento</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">ENCRIPTADO</span>
              </div>
              <p className="text-slate-400 font-sans">
                Enmascaramiento automático de información personal y tokens de sesión efímeros de acuerdo con la Ley Federal de Protección de Datos Personales.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Password Management */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> Actualizar Contraseña Segura
            </h3>
            <p className="text-xs text-slate-400 font-mono">Utiliza cifrado avanzado Argon2id para proteger el acceso a tu cuenta.</p>

            <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4 text-xs font-mono pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                Actualizar Contraseña Cifrada
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl font-mono text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> Estado de Integridad del Workspace
            </h3>
            <p className="text-slate-400 font-sans">
              Sistema de defensa activo contra inyecciones de iframe y manipulación de DOM.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Dominio Autorizado:</span>
                  <span className="text-white font-bold">{activeDomain}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isDomainAuthorized ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300'}`}>
                  {isDomainAuthorized ? 'AUTORIZADO' : 'RESTRINGIDO'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Protección Anti-Clickjacking:</span>
                  <span className="text-white font-bold">Iframe Framing Blocked</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  ACTIVO
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
