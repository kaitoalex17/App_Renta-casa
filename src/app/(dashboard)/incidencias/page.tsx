'use client';

import { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { MaintenanceTicketData } from '@/types';

export default function IncidentsPage() {
  const [tickets, setTickets] = useState<MaintenanceTicketData[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Nuevo ticket
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCommonArea, setIsCommonArea] = useState(false);
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [propertyId, setPropertyId] = useState('prop_granvia');

  useEffect(() => {
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch(console.error);
  }, []);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          propertyName: 'Coliving Teatinos Universidad',
          unitName: isCommonArea ? 'Zona Común' : 'Habitación 1',
          title,
          description,
          isCommonArea,
          priority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setShowModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function updateStatus(ticketId: string, status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED') {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status }),
      });
      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => prev.map((t) => (t.id === ticketId ? data.ticket : t)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Averías, Mantenimiento & Limpieza
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Operativa Diaria
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gestión de incidencias reportadas por huéspedes y coordinación del servicio semanal de limpieza de zonas comunes.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Reportar Avería</span>
        </button>
      </div>

      {/* Calendario de Limpieza de Zonas Comunes */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-xl border border-teal-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-teal-500/20 text-teal-400 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-teal-300">
                Servicio Contratado de Limpieza de Zonas Comunes
              </span>
              <h2 className="text-base font-extrabold mt-0.5">
                Coliving Teatinos Universidad (Málaga): Todos los Martes y Viernes (10:00 - 13:00 h)
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                A cargo de <strong>Limpiezas Costa del Sol (Málaga)</strong>. Se realiza limpieza intensiva y desinfección de los 2 baños completos, encimera de cocina, vitrocerámica, fregadero y aspirado del salón/pasillo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-bold">
              Próxima Limpieza: Viernes 10:00 h
            </span>
          </div>
        </div>
      </div>

      {/* Listado de Tickets de Averías */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Buzón de Incidencias ({tickets.length})
          </h2>
          <span className="text-xs text-slate-400">
            {tickets.filter((t) => t.status !== 'RESOLVED').length} averías en curso
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {tickets.map((t) => (
            <div key={t.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900">{t.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.isCommonArea ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {t.isCommonArea ? 'Zona Común' : t.unitName || 'Habitación'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Prioridad {t.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Reportado por <strong>{t.reportedByName}</strong></span>
                  <span>·</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  {t.photos && t.photos.length > 0 && (
                    <span className="flex items-center gap-1 text-teal-600 font-semibold">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {t.photos.length} foto(s) adjunta(s)
                    </span>
                  )}
                </div>
              </div>

              {/* Controles de Estado */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  t.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : t.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {t.status === 'REPORTED' && 'Reportada'}
                  {t.status === 'IN_PROGRESS' && 'En Trámite'}
                  {t.status === 'RESOLVED' && 'Reparada'}
                </span>

                {t.status !== 'RESOLVED' && (
                  <div className="flex items-center gap-1.5">
                    {t.status === 'REPORTED' && (
                      <button
                        onClick={() => updateStatus(t.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold transition"
                      >
                        Pasar a trámite
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(t.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition"
                    >
                      Marcar Reparada
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para Reportar Avería */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Reportar Avería o Incidencia</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título Breve *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Persiana atascada o Fuga en lavadora"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isCommonArea}
                      onChange={() => setIsCommonArea(false)}
                      name="location"
                    />
                    <span>En mi habitación</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={isCommonArea}
                      onChange={() => setIsCommonArea(true)}
                      name="location"
                    />
                    <span>En Zona Común (Cocina, Baño, Salón)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción Detallada *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué ocurre exactamente..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nivel de Urgencia</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium"
                >
                  <option value="LOW">Baja (Puede esperar unos días)</option>
                  <option value="MEDIUM">Media (Atender esta semana)</option>
                  <option value="HIGH">Alta (Afecta a la habitabilidad normal)</option>
                  <option value="URGENT">Urgente (Fuga de agua o avería crítica)</option>
                </select>
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
                  Enviar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
