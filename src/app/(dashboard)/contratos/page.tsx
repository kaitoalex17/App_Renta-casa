import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import {
  FileSignature,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';

export default async function ContractsPage() {
  const user = await getCurrentUser();
  const contracts = dataStore.getContracts(user || undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Contratos & Blindaje Legal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              LAU Art. 3 Media Temporada
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Generador de contratos con causa obligatoria de temporalidad, cláusula de exclusión de vivienda habitual y firma móvil con Audit Trail.
          </p>
        </div>

        <Link
          href="/contratos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Redactar Nuevo Contrato</span>
        </Link>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Expediente Contractual ({contracts.length})
          </h2>
          <span className="text-xs text-slate-400">
            Firma digital conforme a normativa eIDAS y Ley 6/2020
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Inquilino & Unidad</th>
                <th className="px-6 py-3">Causa de Temporalidad</th>
                <th className="px-6 py-3">Periodo (Fechas)</th>
                <th className="px-6 py-3">Renta & Fianza</th>
                <th className="px-6 py-3">Estado Legal</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.tenantName}</div>
                    <div className="text-xs text-slate-500">{c.propertyName} · {c.unitName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {c.tenantDocType}: {c.tenantDocNumber} · {c.tenantPermanentCity}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block font-semibold text-xs text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                      {c.temporalCauseType === 'STUDIES'
                        ? 'Estudios / Máster'
                        : c.temporalCauseType === 'WORK_CONTRACT'
                        ? 'Trabajo Temporal'
                        : 'Nómada Digital'}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={c.temporalCauseDetail}>
                      {c.temporalCauseDetail}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">
                    <div>Desde: <strong>{c.startDate}</strong></div>
                    <div>Hasta: <strong>{c.endDate}</strong></div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-extrabold text-slate-900">{c.monthlyRent.toFixed(2)} €/mes</div>
                    <div className="text-slate-500">Fianza: {c.depositAmount.toFixed(2)} €</div>
                    <div className="text-teal-700 font-medium">Tope Luz: {c.utilityCap.toFixed(2)} €</div>
                  </td>
                  <td className="px-6 py-4">
                    {c.status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Firmado & Blindado
                      </span>
                    )}
                    {c.status === 'PENDING_SIGNATURE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pendiente de Firma
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-y-1">
                    <div>
                      <Link
                        href={`/contratos/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700"
                      >
                        <span>Ficha Completa & Audit Trail</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {c.status === 'PENDING_SIGNATURE' && (
                      <div>
                        <Link
                          href={`/firmar/${c.magicToken}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          Enlace de Firma Móvil &rarr;
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
