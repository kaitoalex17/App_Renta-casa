'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileSignature,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Copy,
  MessageSquareShare,
} from 'lucide-react';
import { TemporalCauseType } from '@/types';

export default function NewContractPage() {
  const router = useRouter();

  // Form State
  const [propertyId, setPropertyId] = useState('prop_granvia');
  const [unitId, setUnitId] = useState('unit_h3');
  const [tenantName, setTenantName] = useState('');
  const [tenantDocType, setTenantDocType] = useState('DNI');
  const [tenantDocNumber, setTenantDocNumber] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantPermanentCity, setTenantPermanentCity] = useState('');
  const [startDate, setStartDate] = useState('2025-11-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [monthlyRent, setMonthlyRent] = useState('450');
  const [depositAmount, setDepositAmount] = useState('450');
  const [utilityCap, setUtilityCap] = useState('35.0');
  const [temporalCauseType, setTemporalCauseType] = useState<TemporalCauseType>('STUDIES');
  const [temporalCauseDetail, setTemporalCauseDetail] = useState('');
  const [acceptClauses, setAcceptClauses] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdContract, setCreatedContract] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          propertyName: propertyId === 'prop_granvia' ? 'Coliving Gran Vía Suites' : 'Estudio Loft Malasaña',
          unitId,
          unitName: unitId === 'unit_h3' ? 'Habitación 3 - Interior' : 'Apartamento Loft',
          tenantName,
          tenantDocType,
          tenantDocNumber,
          tenantEmail,
          tenantPhone,
          tenantPermanentCity,
          startDate,
          endDate,
          monthlyRent,
          depositAmount,
          utilityCap,
          temporalCauseType,
          temporalCauseDetail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar contrato');
      }

      setCreatedContract(data.contract);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyMagicLink() {
    if (!createdContract) return;
    const url = `${window.location.origin}/firmar/${createdContract.magicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/contratos"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al listado de contratos</span>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Generador de Contratos de Media Temporada
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Blindaje legal conforme al Art. 3 de la Ley de Arrendamientos Urbanos (LAU) en España.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {createdContract ? (
          /* Pantalla de Éxito y Enlace Magic Link */
          <div className="mt-6 p-6 bg-teal-50/70 border-2 border-teal-500 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-teal-900 font-extrabold text-base">
              <CheckCircle2 className="w-6 h-6 text-teal-600" />
              <span>¡Contrato generado con éxito y blindaje legal activo!</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              El contrato ha quedado registrado en estado <strong>PENDIENTE DE FIRMA</strong>. El inquilino <strong>{createdContract.tenantName}</strong> puede revisarlo y firmarlo desde su móvil sin necesidad de instalar ninguna app.
            </p>

            <div className="p-4 bg-white rounded-lg border border-teal-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Enlace de Firma Móvil (Magic Link de un solo uso - Caduca en 48h):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/firmar/${createdContract.magicToken}`}
                  className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-800 font-mono select-all"
                />
                <button
                  type="button"
                  onClick={copyMagicLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${createdContract.tenantPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola ${createdContract.tenantName}, tu contrato de media temporada para ${createdContract.unitName} está listo. Puedes firmarlo desde el móvil aquí: ${window.location.origin}/firmar/${createdContract.magicToken}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                <MessageSquareShare className="w-4 h-4" />
                <span>Enviar Enlace por WhatsApp</span>
              </a>

              <Link
                href={`/firmar/${createdContract.magicToken}`}
                target="_blank"
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Abrir Visor de Firma
              </Link>

              <Link
                href="/contratos"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition"
              >
                Ver en el listado
              </Link>
            </div>
          </div>
        ) : (
          /* Formulario de Redacción */
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Sección 1: Inmueble y Unidad */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Selección de Unidad
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Inmueble</label>
                  <select
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="prop_granvia">Coliving Gran Vía Suites (Madrid)</option>
                    <option value="prop_malasana">Estudio Loft Malasaña (Madrid)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unidad / Habitación</label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="unit_h3">Habitación 3 - Interior (Libre - 450 €)</option>
                    <option value="unit_h4">Habitación 4 - Luminosa (490 €)</option>
                    <option value="unit_apt1">Apartamento Loft Completo (950 €)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Causa de Temporalidad Obligatoria (Blindaje LAU 3) */}
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-4">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>2. Causa de Temporalidad Obligatoria (Evita reclasificación como habitual)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-950 mb-1">
                    Motivo Legal de la Estancia *
                  </label>
                  <select
                    value={temporalCauseType}
                    onChange={(e) => setTemporalCauseType(e.target.value as TemporalCauseType)}
                    className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2.5 font-medium"
                    required
                  >
                    <option value="STUDIES">Estudios Universitarios / Máster / Erasmus</option>
                    <option value="WORK_CONTRACT">Contrato laboral por obra / temporada / sustitución</option>
                    <option value="DIGITAL_NOMAD">Nómada digital / Proyecto tecnológico itinerante</option>
                    <option value="MEDICAL">Tratamiento médico temporal</option>
                    <option value="OTHER">Prácticas de empresa remuneradas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-950 mb-1">
                    Ciudad de Domicilio Habitual Permanente *
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantPermanentCity}
                    onChange={(e) => setTenantPermanentCity(e.target.value)}
                    placeholder="Ej: Sevilla, Valencia, París, Roma..."
                    className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2.5"
                  />
                  <span className="text-[10px] text-purple-700 mt-1 block">
                    Declara mantener su residencia habitual fuera de este inmueble.
                  </span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-purple-950 mb-1">
                    Detalle acreditativo de la causa (Se incorpora literalmente al contrato) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={temporalCauseDetail}
                    onChange={(e) => setTemporalCauseDetail(e.target.value)}
                    placeholder="Ej: Matrícula oficial en Máster en Ciberseguridad UPM curso 2025/2026, justificando estancia por periodo lectivo."
                    className="w-full text-xs bg-white border border-purple-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Datos del Inquilino */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Datos del Arrendatario
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre y Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Ej: Sofía Ramírez"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doc. Identidad ({tenantDocType}) *</label>
                  <div className="flex gap-2">
                    <select
                      value={tenantDocType}
                      onChange={(e) => setTenantDocType(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2"
                    >
                      <option value="DNI">DNI</option>
                      <option value="NIE">NIE</option>
                      <option value="PASSPORT">Pasaporte</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={tenantDocNumber}
                      onChange={(e) => setTenantDocNumber(e.target.value)}
                      placeholder="12345678Z"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="sofia@ejemplo.com"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Móvil (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Condiciones Económicas y Fechas */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Fechas y Condiciones Económicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha de Finalización *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Renta Mensual (€) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fianza en Custodia (€) *</label>
                  <input
                    type="number"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5"
                  />
                </div>
              </div>
            </div>

            {/* Cláusulas automáticas y botón */}
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptClauses}
                  onChange={(e) => setAcceptClauses(e.target.checked)}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span>
                  Incluir automáticamente <strong>Anexo I (Normas de Convivencia y Silencio)</strong>, <strong>Anexo II (Inventario con plazo de revisión de 48h)</strong> y la <strong>cláusula de prohibición de subarriendo o cesión en plataformas tipo Airbnb</strong>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !acceptClauses}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Generando y Sellando Contrato...' : 'Generar Contrato & Crear Enlace de Firma Móvil'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
