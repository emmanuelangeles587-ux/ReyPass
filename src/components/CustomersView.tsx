import React, { useState } from 'react';
import { 
  Users, Plus, Search, Mail, Phone, MapPin, FileText, CheckCircle2, 
  X, Filter, Archive, RotateCcw, Trash2, Edit3, Eye, Building2, 
  Tag, ShieldCheck, DollarSign, ArrowUpRight, LayoutGrid, List
} from 'lucide-react';
import { Customer, Invoice, Quote, Payment } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  quotes: Quote[];
  payments?: Payment[];
  onAddCustomer: (customerData: any) => void;
  onUpdateCustomer?: (id: string, customerData: any) => void;
  onArchiveCustomer?: (id: string) => void;
  onRestoreCustomer?: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectCustomer?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ 
  customers, 
  invoices, 
  quotes,
  payments = [],
  onAddCustomer, 
  onUpdateCustomer,
  onArchiveCustomer,
  onRestoreCustomer,
  onDeleteCustomer,
  onSelectCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    rfc: '',
    notes: '',
    website: '',
    industry: 'Tecnología & Servicios',
    contact_person: '',
    credit_limit: 50000,
    payment_terms: 'Net 30',
    tags: 'Corporativo'
  });

  // Filter customers by search term and status
  const filteredCustomers = customers.filter(c => {
    const matchesStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.rfc?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.tags?.some(t => t.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'ACTIVE').length;
  const archivedCustomers = customers.filter(c => c.status === 'ARCHIVED').length;
  const totalPendingBalance = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      rfc: '',
      notes: '',
      website: '',
      industry: 'Tecnología & Servicios',
      contact_person: '',
      credit_limit: 50000,
      payment_terms: 'Net 30',
      tags: 'Corporativo'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      company: c.company || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      rfc: c.rfc || '',
      notes: c.notes || '',
      website: c.metadata?.website || '',
      industry: c.metadata?.industry || 'Tecnología & Servicios',
      contact_person: c.metadata?.contact_person || '',
      credit_limit: c.metadata?.credit_limit || 50000,
      payment_terms: c.metadata?.payment_terms || 'Net 30',
      tags: c.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      name: formData.name,
      company: formData.company,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      rfc: formData.rfc.toUpperCase(),
      notes: formData.notes,
      tags: tagsArray,
      metadata: {
        website: formData.website,
        industry: formData.industry,
        contact_person: formData.contact_person,
        credit_limit: Number(formData.credit_limit),
        payment_terms: formData.payment_terms
      }
    };

    if (editingCustomer && onUpdateCustomer) {
      onUpdateCustomer(editingCustomer.id, payload);
    } else {
      onAddCustomer(payload);
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-lime-400" />
            <span>Módulo de Clientes & CRM Corporativo</span>
          </h2>
          <p className="text-sm text-slate-400">
            Administra cartera de clientes, expedientes fiscales, balances por cobrar y perfiles comerciales 360.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block">Total Cartera</span>
          <p className="text-xl font-black text-white mt-1">{totalCustomers}</p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Cuentas registradas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block">Clientes Activos</span>
          <p className="text-xl font-black text-emerald-400 mt-1">{activeCustomers}</p>
          <span className="text-[11px] text-emerald-500/70 font-mono mt-0.5 block">Operaciones en curso</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block">Archivados / Inactivos</span>
          <p className="text-xl font-black text-amber-400 mt-1">{archivedCustomers}</p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Disponibles para reactivar</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs font-mono text-slate-400 block">Balance Total Pendiente</span>
          <p className="text-xl font-black text-lime-400 mt-1">${totalPendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Cuentas por cobrar</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, empresa, email, RFC, teléfono o etiqueta..."
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-500"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & View Switch */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-lime-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({totalCustomers})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ACTIVE' ? 'bg-lime-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos ({activeCustomers})
            </button>
            <button
              onClick={() => setStatusFilter('ARCHIVED')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'ARCHIVED' ? 'bg-lime-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Archivados ({archivedCustomers})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'hover:text-white'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'hover:text-white'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customers List Render */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No se encontraron clientes</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm ? `No hay resultados para la búsqueda "${searchTerm}".` : 'No hay clientes registrados en esta sección.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primer Cliente</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((cust) => {
            const custInvoices = invoices.filter(i => i.customer_id === cust.id);
            const custQuotes = quotes.filter(q => q.customer_id === cust.id);
            const isArchived = cust.status === 'ARCHIVED';

            return (
              <div 
                key={cust.id}
                onClick={() => onSelectCustomer && onSelectCustomer(cust)}
                className={`bg-slate-900 border hover:border-lime-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all cursor-pointer group relative overflow-hidden ${
                  isArchived ? 'border-amber-900/30 opacity-80' : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-white text-base group-hover:text-lime-400 transition-colors truncate">
                        {cust.name}
                      </h3>
                      <p className="text-xs text-lime-400 font-mono mt-0.5 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{cust.company}</span>
                      </p>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${
                      isArchived
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {cust.status}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                    {cust.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{cust.phone}</span>
                      </div>
                    )}
                    {cust.rfc && (
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500 text-[10px]">RFC:</span>
                        <span className="text-slate-200 font-bold">{cust.rfc}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {cust.tags && cust.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {cust.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metrics Box */}
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px]">Facturas</span>
                      <span className="text-white font-bold">{custInvoices.length}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px]">Balance</span>
                      <span className="text-lime-400 font-bold">${Number(cust.balance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-lime-400 font-bold flex items-center gap-1 group-hover:underline">
                    <span>Ver Expediente 360</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenEditModal(cust, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar cliente"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isArchived ? (
                      onRestoreCustomer && (
                        <button
                          onClick={() => onRestoreCustomer(cust.id)}
                          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 transition-colors"
                          title="Restaurar cliente"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      onArchiveCustomer && (
                        <button
                          onClick={() => onArchiveCustomer(cust.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Archivar cliente"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Cliente / Razón Social</th>
                  <th className="p-4">RFC</th>
                  <th className="p-4">Contacto</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCustomers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    onClick={() => onSelectCustomer && onSelectCustomer(cust)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white text-sm font-sans">{cust.name}</div>
                      <div className="text-lime-400 text-xs">{cust.company}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold">{cust.rfc || '—'}</td>
                    <td className="p-4 text-slate-300">
                      <div>{cust.email}</div>
                      <div className="text-slate-500 text-[11px]">{cust.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        cust.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-lime-400">
                      ${Number(cust.balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectCustomer && onSelectCustomer(cust)}
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800"
                          title="Ver detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleOpenEditModal(cust, e)}
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {cust.status === 'ACTIVE' ? (
                          onArchiveCustomer && (
                            <button
                              onClick={() => onArchiveCustomer(cust.id)}
                              className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                              title="Archivar"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          onRestoreCustomer && (
                            <button
                              onClick={() => onRestoreCustomer(cust.id)}
                              className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900"
                              title="Restaurar"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-400" />
                <span>{editingCustomer ? `Editar Cliente: ${editingCustomer.name}` : 'Registrar Nuevo Cliente'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sofía Martínez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Empresa / Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Logística Global S.A. de C.V."
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="smartinez@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Teléfono Directo</label>
                  <input
                    type="text"
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">RFC / Identificación Fiscal</label>
                  <input
                    type="text"
                    placeholder="LOG180212AB4"
                    value={formData.rfc}
                    onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Sector / Industria</label>
                  <input
                    type="text"
                    placeholder="Logística, Finanzas, Software"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 block mb-1">Dirección Fiscal / Envío</label>
                  <input
                    type="text"
                    placeholder="Paseo de la Reforma 250, Piso 14, CDMX"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Términos de Pago</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  >
                    <option value="Contado / Inmediato">Contado / Inmediato</option>
                    <option value="Net 15">Net 15 días</option>
                    <option value="Net 30">Net 30 días</option>
                    <option value="Net 60">Net 60 días</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Etiquetas (separadas por coma)</label>
                  <input
                    type="text"
                    placeholder="Corporativo, Tier 1, Alta Prioridad"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 block mb-1">Notas Comerciales y de Seguimiento</label>
                  <textarea
                    rows={3}
                    placeholder="Información relevante sobre negociaciones, SLA o acuerdos especiales..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-lime-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
                >
                  {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
