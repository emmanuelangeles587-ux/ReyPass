import React, { useState } from 'react';
import { 
  ArrowLeft, Building2, Mail, Phone, MapPin, FileText, DollarSign, 
  Clock, CheckCircle2, AlertCircle, Plus, Archive, RotateCcw, 
  Trash2, Edit3, ShieldCheck, Download, ExternalLink, Calendar,
  CreditCard, Receipt as ReceiptIcon, FileCheck, Tag, Globe, Briefcase,
  User, X
} from 'lucide-react';
import { Customer, Invoice, Quote, Payment, Receipt, CustomerDocument } from '../types';

interface CustomerDetailViewProps {
  customer: Customer;
  invoices: Invoice[];
  quotes: Quote[];
  payments: Payment[];
  receipts: Receipt[];
  onBack: () => void;
  onUpdateCustomer: (id: string, updatedData: Partial<Customer>) => void;
  onArchiveCustomer: (id: string) => void;
  onRestoreCustomer: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
  onAddDocument: (customerId: string, docData: any) => void;
  onDeleteDocument: (customerId: string, docId: string) => void;
  onQuickInvoice: (customerId: string) => void;
  onQuickQuote: (customerId: string) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  customer,
  invoices,
  quotes,
  payments,
  receipts,
  onBack,
  onUpdateCustomer,
  onArchiveCustomer,
  onRestoreCustomer,
  onDeleteCustomer,
  onAddDocument,
  onDeleteDocument,
  onQuickInvoice,
  onQuickQuote
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'quotes' | 'payments' | 'documents' | 'activity'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  // Filter linked records for this customer
  const customerInvoices = invoices.filter(i => i.customer_id === customer.id);
  const customerQuotes = quotes.filter(q => q.customer_id === customer.id);
  const customerPayments = payments.filter(p => p.customer_id === customer.id);
  const customerReceipts = receipts.filter(r => r.customer_id === customer.id);
  const documents = customer.documents || [];

  // Financial calculations
  const totalInvoiced = customerInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalPaid = customerPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const balanceDue = Math.max(0, totalInvoiced - totalPaid);
  const paidRatio = totalInvoiced > 0 ? Math.min(100, Math.round((totalPaid / totalInvoiced) * 100)) : 100;

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: customer.name || '',
    company: customer.company || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    rfc: customer.rfc || '',
    notes: customer.notes || '',
    website: customer.metadata?.website || '',
    industry: customer.metadata?.industry || '',
    contact_person: customer.metadata?.contact_person || '',
    credit_limit: customer.metadata?.credit_limit || 50000,
    payment_terms: customer.metadata?.payment_terms || 'Net 30',
    tags: customer.tags?.join(', ') || ''
  });

  // Doc form state
  const [docFormData, setDocFormData] = useState({
    name: '',
    type: 'CONTRACT' as 'CONTRACT' | 'TAX_ID' | 'PROPOSAL' | 'INVOICE_COPY' | 'SLA_AGREEMENT' | 'OTHER',
    file_size: '2.1 MB'
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = editFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
    onUpdateCustomer(customer.id, {
      name: editFormData.name,
      company: editFormData.company,
      email: editFormData.email,
      phone: editFormData.phone,
      address: editFormData.address,
      rfc: editFormData.rfc.toUpperCase(),
      notes: editFormData.notes,
      tags: tagsArray,
      metadata: {
        ...customer.metadata,
        website: editFormData.website,
        industry: editFormData.industry,
        contact_person: editFormData.contact_person,
        credit_limit: Number(editFormData.credit_limit),
        payment_terms: editFormData.payment_terms
      }
    });
    setShowEditModal(false);
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFormData.name) return;
    onAddDocument(customer.id, {
      name: docFormData.name,
      type: docFormData.type,
      file_size: docFormData.file_size,
      status: 'VERIFIED',
      file_url: `https://reywallet.app/docs/${customer.id}/${encodeURIComponent(docFormData.name)}`
    });
    setDocFormData({ name: '', type: 'CONTRACT', file_size: '2.1 MB' });
    setShowAddDocModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-white">{customer.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                customer.status === 'ACTIVE' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {customer.status === 'ACTIVE' ? 'ACTIVO' : 'ARCHIVADO'}
              </span>
            </div>
            <p className="text-sm font-mono text-lime-400 mt-0.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{customer.company}</span>
              {customer.rfc && (
                <span className="text-slate-400 text-xs bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  RFC: {customer.rfc}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickInvoice(customer.id)}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Factura</span>
          </button>
          <button
            onClick={() => onQuickQuote(customer.id)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-lime-400" />
            <span>Cotizar</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-800 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </button>
          {customer.status === 'ACTIVE' ? (
            <button
              onClick={() => onArchiveCustomer(customer.id)}
              className="bg-slate-900 hover:bg-amber-950/40 text-slate-400 hover:text-amber-300 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-slate-800 hover:border-amber-500/30 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivar</span>
            </button>
          ) : (
            <button
              onClick={() => onRestoreCustomer(customer.id)}
              className="bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`¿Estás seguro de eliminar permanentemente al cliente ${customer.name}?`)) {
                onDeleteCustomer(customer.id);
                onBack();
              }
            }}
            className="bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 p-2 rounded-xl text-xs flex items-center transition-all border border-slate-800 hover:border-rose-500/30 cursor-pointer"
            title="Eliminar cliente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Facturado</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-black text-white mt-1.5">${totalInvoiced.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{customerInvoices.length} facturas emitidas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Cobrado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1.5">${totalPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-emerald-500/80 font-mono mt-0.5 block">{paidRatio}% de cumplimiento</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Balance Pendiente</span>
            <DollarSign className="w-4 h-4 text-lime-400" />
          </div>
          <p className="text-xl font-black text-lime-400 mt-1.5">${balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">{balanceDue > 0 ? 'Saldo por liquidar' : 'Al corriente'}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Expediente Digital</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-white mt-1.5">{documents.length} Archivos</p>
          <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">Documentos verificados</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Resumen & Datos', count: null },
          { id: 'invoices', label: 'Facturas', count: customerInvoices.length },
          { id: 'quotes', label: 'Cotizaciones', count: customerQuotes.length },
          { id: 'payments', label: 'Pagos & Recibos', count: customerPayments.length },
          { id: 'documents', label: 'Documentos', count: documents.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-lime-500/15 text-lime-300 border border-lime-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-lime-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Box */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Details Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-lime-400" />
                Información de Contacto y Fiscal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Correo Electrónico</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-lime-400" />
                    <span className="font-sans font-medium">{customer.email}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Teléfono Directo</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-lime-400" />
                    <span className="font-sans font-medium">{customer.phone || 'No especificado'}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Registro Federal de Contribuyentes (RFC)</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-white">{customer.rfc || 'No registrado'}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Contacto Principal</span>
                  <div className="flex items-center gap-2 text-slate-200">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-sans font-medium">{customer.metadata?.contact_person || customer.name}</span>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Dirección Fiscal y de Entrega</span>
                  <div className="flex items-start gap-2 text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-sans leading-relaxed">{customer.address || 'Sin dirección registrada'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-lime-400" />
                Notas y Acuerdos Comerciales
              </h3>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                {customer.notes ? (
                  <p>{customer.notes}</p>
                ) : (
                  <p className="text-slate-500 italic">No hay notas registradas para este cliente. Haz clic en "Editar" para añadir condiciones particulares o notas de seguimiento.</p>
                )}
              </div>
            </div>
          </div>

          {/* Side Info Box */}
          <div className="space-y-6">
            {/* Commercial Profile Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-lime-400" />
                Perfil Comercial
              </h3>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500">Industria</span>
                  <span className="text-slate-200 font-bold">{customer.metadata?.industry || 'General / Servicios'}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500">Términos de Pago</span>
                  <span className="text-lime-400 font-bold">{customer.metadata?.payment_terms || 'Net 30'}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-500">Límite de Crédito</span>
                  <span className="text-white font-bold">${(customer.metadata?.credit_limit || 50000).toLocaleString()} USD</span>
                </div>

                {customer.metadata?.website && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-500">Sitio Web</span>
                    <a 
                      href={customer.metadata.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-lime-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{customer.metadata.website.replace('https://', '')}</span>
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cliente desde</span>
                  <span className="text-slate-300">{new Date(customer.created_at).toLocaleDateString('es-MX')}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-mono text-slate-500 block mb-2">ETIQUETAS / SEGMENTOS</span>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags && customer.tags.length > 0 ? (
                    customer.tags.map((tag, idx) => (
                      <span key={idx} className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-mono border border-slate-800 flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-lime-400" />
                        <span>{tag}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Sin etiquetas</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Facturas Emitidas a {customer.name}</h3>
            <button
              onClick={() => onQuickInvoice(customer.id)}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Factura</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {customerInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay facturas registradas para este cliente.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Folio</th>
                    <th className="p-4">Fecha Vencimiento</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Abonado</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {customerInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{inv.number}</td>
                      <td className="p-4 text-slate-300">{inv.due_date}</td>
                      <td className="p-4 font-bold text-white">${Number(inv.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {inv.currency}</td>
                      <td className="p-4 text-emerald-400">${Number(inv.paid_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          inv.status === 'PARTIALLY_PAID' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          inv.status === 'OVERDUE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Cotizaciones Activas & Previas</h3>
            <button
              onClick={() => onQuickQuote(customer.id)}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Cotización</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {customerQuotes.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay cotizaciones para este cliente.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Folio</th>
                    <th className="p-4">Vigencia</th>
                    <th className="p-4">Ítems</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {customerQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white">{q.number}</td>
                      <td className="p-4 text-slate-300">{q.expires_at}</td>
                      <td className="p-4 text-slate-400">{q.items?.length || 1} conceptos</td>
                      <td className="p-4 font-bold text-lime-400">${Number(q.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {q.currency}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          q.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          q.status === 'SENT' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Payments & Receipts Tab */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Historial de Pagos & Recibos Digitales</h3>
          </div>

          <div className="overflow-x-auto">
            {customerPayments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se registran pagos de este cliente aún.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Referencia</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Método / Pasarela</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4">Recibo QR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {customerPayments.map((p) => {
                    const receipt = customerReceipts.find(r => r.payment_id === p.id || r.id === p.receipt_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white">{p.reference}</td>
                        <td className="p-4 text-slate-300">{new Date(p.created_at).toLocaleDateString('es-MX')}</td>
                        <td className="p-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-lime-400 border border-slate-700">
                            {p.method} • {p.provider}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-emerald-400">${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {p.currency}</td>
                        <td className="p-4">
                          {receipt ? (
                            <button
                              onClick={() => setSelectedReceipt(receipt)}
                              className="text-lime-400 hover:text-lime-300 flex items-center gap-1.5 underline cursor-pointer"
                            >
                              <ReceiptIcon className="w-3.5 h-3.5" />
                              <span>{receipt.number}</span>
                            </button>
                          ) : (
                            <span className="text-slate-500">Comprobante Interno</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Expediente Digital del Cliente</h3>
              <p className="text-xs text-slate-400">Contratos, Constancias Fiscales (SAT), Acuerdos SLA y Documentos Validados.</p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-lime-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adjuntar Documento</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay documentos cargados en el expediente de este cliente.</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center shrink-0">
                      <FileCheck className="w-5 h-5 text-lime-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-lime-400">{doc.type}</span>
                        <span>•</span>
                        <span>{doc.file_size}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{doc.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800"
                      title="Descargar / Ver"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onDeleteDocument(customer.id, doc.id)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 transition-all border border-slate-800 hover:border-rose-500/30 cursor-pointer"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-lime-400" />
                Editar Datos de {customer.name}
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Razón Social / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.company}
                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">RFC / Tax ID</label>
                  <input
                    type="text"
                    value={editFormData.rfc}
                    onChange={(e) => setEditFormData({ ...editFormData, rfc: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Industria</label>
                  <input
                    type="text"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 block mb-1">Dirección Fiscal / Entrega</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Términos de Pago</label>
                  <select
                    value={editFormData.payment_terms}
                    onChange={(e) => setEditFormData({ ...editFormData, payment_terms: e.target.value })}
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
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    placeholder="Corporativo, Tier 1, Premium"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-mono text-slate-400 block mb-1">Notas Comerciales</label>
                  <textarea
                    rows={3}
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-lime-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-lg shadow-lime-500/10 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-lime-400" />
                Adjuntar Documento Digital
              </h3>
              <button 
                onClick={() => setShowAddDocModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDocSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Nombre del Archivo / Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Contrato_Prestacion_2026.pdf"
                  value={docFormData.name}
                  onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Tipo de Documento</label>
                <select
                  value={docFormData.type}
                  onChange={(e) => setDocFormData({ ...docFormData, type: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                >
                  <option value="CONTRACT">Contrato de Servicios</option>
                  <option value="TAX_ID">Constancia de Situación Fiscal (SAT)</option>
                  <option value="SLA_AGREEMENT">Acuerdo de Nivel de Servicio (SLA)</option>
                  <option value="PROPOSAL">Propuesta Comercial Firmada</option>
                  <option value="INVOICE_COPY">Copia de Factura / CFDI</option>
                  <option value="OTHER">Otro Documento</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Subir y Validar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-mono text-lime-400 font-bold">{selectedReceipt.number}</span>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
              <img 
                src={selectedReceipt.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedReceipt.id}`}
                alt="QR Recibo" 
                className="w-40 h-40 object-contain mx-auto"
              />
            </div>

            <div>
              <p className="text-xl font-black text-white">${Number(selectedReceipt.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} {selectedReceipt.currency}</p>
              <p className="text-xs text-slate-400 mt-1">Comprobante Oficial Verificado en Ledger</p>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
