'use client';

import { useState, useEffect } from 'react';
import {
  BellRing,
  ShieldAlert,
  CheckCircle2,
  Plus,
  Send,
  Eye,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { FormalNoticeData } from '@/types';

export default function NoticesPage() {
  const [notices, setNotices] = useState<FormalNoticeData[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'INFO' | 'IMPORTANT' | 'LEGAL_WARNING'>('IMPORTANT');
  const [propertyId, setPropertyId] = useState('prop_granvia');

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        if (data.notices) setNotices(data.notices);
      })
      .catch(console.error);
  }, []);

  async function handleCreateNotice(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          propertyName: 'Coliving Teatinos Universidad',
          title,
          message,
          urgencyLevel,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotices((prev) => [data.notice, ...prev]);
        setShowModal(false);
        setTitle('');
        setMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Buzón de Comunicaciones Formales
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Acuse de Lectura Probatorio
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Envío de notificaciones vinculantes (cortes programados, inspecciones, avisos por ruido) con registro fehaciente de fecha e IP de lectura.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Nuevo Aviso Oficial</span>
        </button>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-lg ${
                  notice.urgencyLevel === 'LEGAL_WARNING'
                    ? 'bg-rose-100 text-rose-700'
                    : notice.urgencyLevel === 'IMPORTANT'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  <BellRing className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">{notice.title}</h2>
                  <p className="text-[11px] text-slate-400">
                    Emitido por {notice.senderName} · {notice.propertyName} · {new Date(notice.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                notice.urgencyLevel === 'LEGAL_WARNING'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : notice.urgencyLevel === 'IMPORTANT'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}>
                {notice.urgencyLevel === 'LEGAL_WARNING'
                  ? 'Aviso Legal Vinculante'
                  : notice.urgencyLevel === 'IMPORTANT'
                  ? 'Importante'
                  : 'Informativo'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {notice.message}
            </p>

            {/* Trazabilidad probatoria de lecturas */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Acuses de Lectura Registrados ({notice.reads.length}):</span>
              </div>

              {notice.reads.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {notice.reads.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-teal-50/50 border border-teal-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{r.tenantName}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(r.readAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
                        IP: {r.readerIp || '88.12.45.192'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Aún ningún inquilino ha confirmado la apertura de este aviso.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para emitir aviso */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Emitir Aviso Formal con Acuse de Lectura</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título del Aviso *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Corte programado de agua por reparación de bajante"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nivel de Relevancia Legal</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                >
                  <option value="INFO">Informativo (Cuestiones operativas menores)</option>
                  <option value="IMPORTANT">Importante (Inspecciones técnicas u obras)</option>
                  <option value="LEGAL_WARNING">Requerimiento Formal (Apercibimiento por ruido/normas)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mensaje de la Notificación *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Redacta la comunicación que recibirán los inquilinos en su portal..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow"
                >
                  Emitir Notificación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
