'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Wifi,
  FileSignature,
  Receipt,
  Wrench,
  Sparkles,
  BellRing,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Phone,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function TenantPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [contract, setContract] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal reportar avería
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [isCommonArea, setIsCommonArea] = useState(false);

  useEffect(() => {
    // 1. Obtener contrato
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        if (data.contracts) {
          const found = data.contracts.find((c: any) => c.magicToken === token);
          if (found) {
            setContract(found);
          }
        }
      })
      .catch(console.error);

    // 2. Obtener recibos
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) {
          setPayments(data.payments);
        }
      })
      .catch(console.error);

    // 3. Obtener tickets
    fetch('/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (data.tickets) setTickets(data.tickets);
      })
      .catch(console.error);

    // 4. Obtener avisos
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        if (data.notices) setNotices(data.notices);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  async function handleReportIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!contract) return;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: contract.propertyId,
          propertyName: contract.propertyName,
          unitName: isCommonArea ? 'Zona Común' : contract.unitName,
          title: ticketTitle,
          description: ticketDesc,
          isCommonArea,
          priority: 'MEDIUM',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setShowTicketModal(false);
        setTicketTitle('');
        setTicketDesc('');
        alert('Incidencia enviada al propietario con éxito.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirmNotice(noticeId: string) {
    try {
      const res = await fetch('/api/notices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotices((prev) => prev.map((n) => (n.id === noticeId ? data.notice : n)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-teal-400 text-sm animate-pulse">
        Cargando tu Portal de Inquilino...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Cabecera de Bienvenida */}
        <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-900 border border-teal-700/60 p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-300 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
              Portal del Huésped (Acceso Ligero)
            </span>
            <h1 className="text-xl font-black text-white mt-2">
              Hola, {contract?.tenantName || 'Huésped'} 👋
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {contract?.unitName || 'Habitación 1'} · {contract?.propertyName || 'Coliving Gran Vía'}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Contrato Activo
            </span>
          </div>
        </div>

        {/* Tarjeta de Claves & Accesos de la Casa */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <Wifi className="w-4 h-4" />
            <span>Accesos & Guía del Inmueble</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Red Wi-Fi 5G:</span>
              <span className="font-bold text-white">GranVia_Coliving_5G</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <span className="text-slate-400 block text-[10px]">Contraseña WiFi:</span>
              <span className="font-mono font-bold text-teal-300">FibraRapida2025!</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl text-xs space-y-1 text-slate-400">
            <p>🔑 <strong>Entrega de llaves:</strong> Portal, puerta principal y llave privada de tu habitación.</p>
            <p>⚡ <strong>Cuadro eléctrico:</strong> Detrás de la puerta de entrada principal a mano derecha.</p>
            <p>🚨 <strong>Teléfono de urgencias:</strong> +34 611 223 344 (Carlos Mendoza - Propiedad)</p>
          </div>
        </div>

        {/* Avisos Oficiales del Propietario (con Acuse de Lectura) */}
        {notices.length > 0 && (
          <div className="bg-slate-900 border border-amber-900/60 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <BellRing className="w-4 h-4" />
              <span>Avisos Oficiales de la Comunidad</span>
            </div>

            {notices.map((n) => {
              const alreadyRead = n.reads?.some((r: any) => r.tenantName?.includes('Juan'));

              return (
                <div key={n.id} className="p-3.5 bg-slate-800/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-amber-400 font-semibold">{n.urgencyLevel}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                    <span className="text-[10px] text-slate-400">
                      Emitido el {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {alreadyRead ? (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lectura Confirmada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirmNotice(n.id)}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded transition"
                      >
                        Confirmar Lectura Fehaciente
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Turnos de Limpieza de Zonas Comunes */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Limpieza de Zonas Comunes
            </h3>
            <p className="text-xs text-white font-semibold mt-1">
              Martes y Viernes (10:00 a 13:00 h)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Por favor, deja recogidos tus utensilios de cocina y suelo despejado para facilitar la labor del personal.
            </p>
          </div>
        </div>

        {/* Tus Recibos Mensuales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-teal-400" />
              <span>Tus Recibos y Suministros</span>
            </div>
          </div>

          <div className="space-y-2">
            {payments.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">Mes {p.month}/{p.year}</span>
                  <span className="text-[11px] text-slate-400">
                    Renta: {p.rentAmount.toFixed(2)} € {p.utilitiesAmount > 0 ? `+ Suministros: ${p.utilitiesAmount.toFixed(2)} €` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-black text-white text-sm block">{p.totalAmount.toFixed(2)} €</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'PAID' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {p.status === 'PAID' ? 'Pagado' : 'En plazo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buzón de Incidencias / Averías */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Buzón de Averías & Incidencias</span>
            </div>
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition"
            >
              Reportar Avería
            </button>
          </div>

          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{t.title}</span>
                  <span className="text-[10px] font-bold text-teal-400">{t.status}</span>
                </div>
                <p className="text-[11px] text-slate-400">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contrato y Normas */}
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <FileSignature className="w-4 h-4 text-teal-400" />
            <span>Consultar Copia de Contrato & Anexo de Normas</span>
          </div>
          <Link
            href={`/contratos/${contract?.id || 'ct_juan'}`}
            target="_blank"
            className="text-teal-400 hover:underline font-bold flex items-center gap-1"
          >
            <span>Ver PDF</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Modal Reportar Avería */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Reportar Avería en la Casa</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">¿Qué sucede? *</label>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Ej: La lavadora pierde agua al desaguar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">¿Dónde es?</label>
                <div className="flex items-center gap-4 text-slate-300">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={!isCommonArea}
                      onChange={() => setIsCommonArea(false)}
                      name="loc"
                    />
                    <span>En mi habitación</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      checked={isCommonArea}
                      onChange={() => setIsCommonArea(true)}
                      name="loc"
                    />
                    <span>En zona común</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detalles de la avería *</label>
                <textarea
                  required
                  rows={3}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Explica qué ocurre para avisar al técnico..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold"
                >
                  Enviar al Propietario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
