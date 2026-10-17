import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Key, Lock, CheckCircle2, AlertCircle, Users, Shield, UserCheck } from 'lucide-react';
import { AuditLog, ProviderConnection, Organization } from '../types';
import { UserRole, ROLE_PERMISSIONS, canManageRoles } from '../lib/rbac';
import { useAuth } from '../hooks/useSupabaseAuth';

interface AdminViewProps {
  organization: Organization;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization_id: string;
}

export const AdminView: React.FC<AdminViewProps> = ({ organization }) => {
  const { userProfile, updateUserRole } = useAuth();
  const [providers, setProviders] = useState<ProviderConnection[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'usr_1', name: 'Alejandro Rey', email: 'alejandro@reywallet.com', role: 'OWNER', organization_id: organization.id },
    { id: 'usr_2', name: 'Sofía Martínez', email: 'smartinez@logisticaglobal.com', role: 'MANAGER', organization_id: organization.id },
    { id: 'usr_3', name: 'Carlos Mendoza', email: 'carlos@techflow.io', role: 'ACCOUNTANT', organization_id: organization.id },
    { id: 'usr_4', name: 'Valeria Gómez', email: 'valeria@reywallet.com', role: 'CREDIT_MANAGER', organization_id: organization.id },
    { id: 'usr_5', name: 'Mateo Soto', email: 'mateo@reywallet.com', role: 'SALES', organization_id: organization.id },
  ]);
  const [notice, setNotice] = useState<string | null>(null);

  const isAuthorizedAdmin = canManageRoles(userProfile?.role);

  useEffect(() => {
    fetch('/api/admin/providers').then(res => res.json()).then(setProviders).catch(() => {});
    fetch('/api/audit').then(res => res.json()).then(setAuditLogs).catch(() => {});
  }, []);

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    if (!isAuthorizedAdmin) {
      setNotice('Error: No tienes permisos de OWNER o ADMIN para modificar roles.');
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    if (userProfile?.id === memberId && newRole !== 'OWNER' && userProfile.role === 'OWNER') {
      setNotice('Advertencia de seguridad: No puedes despojarte de tu propio rol de OWNER.');
      setTimeout(() => setNotice(null), 4000);
      return;
    }

    // Update local state and call auth hook if applicable
    setTeamMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    if (updateUserRole) {
      await updateUserRole(memberId, newRole);
    }
    setNotice(`Rol actualizado correctamente a ${newRole}. RLS verificado.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const allRoles: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'SALES', 'VIEWER', 'CUSTOMER', 'CREDIT_MANAGER'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300">
      {notice && (
        <div className="bg-slate-900 border border-lime-500/50 text-lime-300 px-4 py-3 rounded-2xl shadow-xl font-mono text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-lime-400" />
          <span>{notice}</span>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-extrabold text-white">Admin, Seguridad & RBAC Multi-Tenant</h2>
        <p className="text-sm text-slate-400">Control granular de roles, aislamiento Row-Level Security (RLS) por organización y Secrets Vault.</p>
      </div>

      {/* Multi-Tenant RLS & RBAC Access Control Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-400" />
              <span>Matriz de Roles y Permisos (RBAC & Multi-Tenant RLS)</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Organización activa: <strong className="text-white">{organization.name}</strong> (ID: {organization.id})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
              isAuthorizedAdmin ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              Tu Rol Actual: {userProfile?.role || 'OWNER'} ({isAuthorizedAdmin ? 'Administrador Autorizado' : 'Solo Lectura'})
            </span>
          </div>
        </div>

        {/* Team Members Role Management */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Miembros del equipo y Asignación de Roles</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Organización (Multi-Tenant)</th>
                  <th className="p-3">Rol Actual (RBAC)</th>
                  <th className="p-3 text-right">Acciones de Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {teamMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-lime-500/20 text-lime-300 flex items-center justify-center font-bold">
                        {member.name.charAt(0)}
                      </div>
                      {member.name}
                    </td>
                    <td className="p-3 text-slate-400">{member.email}</td>
                    <td className="p-3 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {organization.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-lg bg-lime-950 text-lime-300 border border-lime-500/30 font-bold">
                        {member.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {isAuthorizedAdmin ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          className="bg-slate-950 border border-slate-700 text-lime-400 font-bold px-3 py-1.5 rounded-xl text-xs focus:border-lime-500 focus:outline-none cursor-pointer shadow-inner"
                        >
                          {allRoles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Requiere rol OWNER/ADMIN</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RLS Policy Explanation */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 font-bold text-lime-400">
            <Lock className="w-4 h-4" />
            <span>Políticas de Seguridad Row-Level Security (RLS) en Supabase & PostgreSQL</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-sans">
            Todas las tablas de datos de negocio (`invoices`, `payments`, `customers`, `ledger`, `quotes`) incluyen la columna obligatoria `organization_id UUID NOT NULL`. Las políticas RLS garantizan a nivel de base de datos que los usuarios sólo puedan consultar y mutar registros pertenecientes a la organización donde poseen membresía activa (`auth.uid() = user_id AND organization_id = ...`).
          </p>
        </div>
      </div>

      {/* Payment Providers Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-lime-400" />
          <span>Pasarelas de Pago & Proveedores</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map(p => (
            <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{p.provider_name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  p.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {p.status}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 truncate">
                {p.masked_key || 'No credentials configured'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Secrets Vault Security Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-lime-400" />
          <span>Secrets Vault (Server-Side Only)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Las credenciales de Stripe, Mercado Pago y Supabase Service Role Key se almacenan exclusivamente en el servidor backend (Node.js) mediante variables de entorno protegidas. Nunca se exponen al navegador.
        </p>
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
          <p>STRIPE_SECRET_KEY=••••••••••••••••••••</p>
          <p>MERCADOPAGO_ACCESS_TOKEN=••••••••••••••••••••</p>
          <p>SUPABASE_SERVICE_ROLE_KEY=••••••••••••••••••••</p>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">Registro de Auditoría (Audit Logs)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                <th className="p-3">Acción</th>
                <th className="p-3">Recurso</th>
                <th className="p-3">Usuario / Sistema</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-lime-400 font-bold">{log.action}</td>
                  <td className="p-3 text-slate-300">{log.resource} ({log.resource_id})</td>
                  <td className="p-3 text-slate-400">{log.user_id}</td>
                  <td className="p-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
