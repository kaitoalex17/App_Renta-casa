import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import {
  Building2,
  ArrowLeft,
  Wifi,
  FileCheck2,
  Users,
  Receipt,
  Bed,
  Plus,
  Shield,
  Zap,
} from 'lucide-react';
import PropertyUnitsList from '@/components/PropertyUnitsList';

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const property = dataStore.getPropertyById(params.id, user || undefined);

  if (!property) {
    notFound();
  }

  const monthlyFixedTotal = property.fixedExpenses.reduce((acc, exp) => {
    if (exp.frequency === 'MONTHLY') return acc + exp.amount;
    if (exp.frequency === 'ANNUAL') return acc + exp.amount / 12;
    if (exp.frequency === 'QUARTERLY') return acc + exp.amount / 3;
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Volver */}
      <div>
        <Link
          href="/inmuebles"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al listado de inmuebles</span>
        </Link>
      </div>

      {/* Cabecera Principal */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {property.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                CEE Etiqueta: {property.energyRating || 'B'}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {property.address} · {property.city} ({property.postalCode})
            </p>
            {property.cadastralRef && (
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Ref. Catastral: {property.cadastralRef}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contratos/nuevo"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            Nuevo Contrato
          </Link>
        </div>
      </div>

      {/* Grid de 2 columnas: Detalles del Inmueble y Gastos Fijos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Normas, Wifi y Zonas Comunes */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-teal-600" />
              Conectividad & Accesos
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Red WiFi:</span>
                <span className="font-bold text-slate-900">{property.wifiName || 'Fibra_Coliving'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Contraseña:</span>
                <span className="font-mono font-bold text-teal-700">{property.wifiPassword || 'Protegida'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Zonas Comunes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {property.commonAreas || 'Cocina equipada, salón y baños compartidos.'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-600" />
              Normas Generales de Convivencia (Anexo I)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {property.generalRules || 'Silencio de 23:00 a 08:00. Prohibido fumar y mascotas.'}
            </p>
          </div>

          {/* Socios Co-propietarios */}
          {property.coOwners.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                Socios Co-propietarios
              </h3>
              {property.coOwners.map((co) => (
                <div key={co.userId} className="flex items-center justify-between text-xs py-1.5 border-b border-blue-200/60 last:border-0">
                  <span className="font-semibold text-blue-950">{co.userName}</span>
                  <span className="font-black text-blue-700">{co.percentage}% de cuota</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna 2 y 3: Gastos Fijos y Listado de Unidades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gastos Fijos Periódicos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Gastos Fijos Consolidados</h2>
                <p className="text-xs text-slate-500">IBI, Comunidad, Seguros e Internet del Inmueble</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-800 rounded-lg">
                Total Mensual Equivalente: <strong className="text-teal-700">{monthlyFixedTotal.toFixed(2)} €/mes</strong>
              </span>
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Concepto</th>
                  <th className="px-6 py-3">Frecuencia</th>
                  <th className="px-6 py-3">Importe</th>
                  <th className="px-6 py-3 text-right">Equivalente / Mes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {property.fixedExpenses.map((exp) => {
                  const monthlyEq =
                    exp.frequency === 'MONTHLY'
                      ? exp.amount
                      : exp.frequency === 'ANNUAL'
                      ? exp.amount / 12
                      : exp.amount / 3;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60">
                      <td className="px-6 py-3.5 font-bold text-slate-800">{exp.concept}</td>
                      <td className="px-6 py-3.5">{exp.frequency}</td>
                      <td className="px-6 py-3.5 font-semibold">{exp.amount.toFixed(2)} €</td>
                      <td className="px-6 py-3.5 text-right font-extrabold text-slate-900">
                        {monthlyEq.toFixed(2)} €/m
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Listado de Unidades Hijas con Gestor de Inventario y Fotos */}
          <PropertyUnitsList initialUnits={property.units} propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
