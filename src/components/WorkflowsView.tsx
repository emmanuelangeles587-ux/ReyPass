import React, { useState } from 'react';
import { Workflow, Plus, Zap, CheckCircle2, X } from 'lucide-react';
import { Workflow as WorkflowType } from '../types';

interface WorkflowsViewProps {
  workflows: WorkflowType[];
  onAddWorkflow: (wf: any) => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ workflows, onAddWorkflow }) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('invoice.overdue');
  const [action, setAction] = useState('send email reminder');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkflow({ name, trigger, condition: 'always', action });
    setShowModal(false);
    setName('');
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Workflows Automatizados</h2>
          <p className="text-sm text-slate-400">Automatiza notificaciones, facturas, recordatorios y webhooks basados en eventos corporativos.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-lime-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-lime-400" />
                  <h3 className="font-bold text-white text-base">{wf.name}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {wf.status}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">TRIGGER (Disparador)</span>
                  <span className="text-lime-400 font-bold">{wf.trigger}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">ACTION (Acción Backend)</span>
                  <span className="text-white font-bold">{wf.action}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Creado: {new Date(wf.created_at).toLocaleDateString()}</span>
              <span className="text-emerald-400 font-bold">Ejecutándose en Worker</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Nuevo Workflow</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre del Workflow</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej. Recordatorio automático de pago"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Disparador (Trigger)</label>
                <select
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-lime-500 outline-none"
                >
                  <option value="invoice.overdue">invoice.overdue</option>
                  <option value="payment.completed">payment.completed</option>
                  <option value="quote.accepted">quote.accepted</option>
                  <option value="customer.created">customer.created</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Acción</label>
                <input
                  type="text"
                  required
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-lime-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-lime-500/20"
                >
                  Activar Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
