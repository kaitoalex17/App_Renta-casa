import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import { Building2, Plus, Users, ShieldCheck, Home, ArrowRight, Zap, Check } from 'lucide-react';

export default async function PropertiesPage() {
  const user = await getCurrentUser();
  const properties = dataStore.getProperties(user || undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inmuebles & Unidades
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Estructura jerárquica: Inmueble Padre (gastos fijos, zonas comunes) ➔ Unidades Hijas (Habitaciones y Apartamentos).
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
          <Plus className="w-4 h-4" />
          <span>Añadir Inmueble</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => {
          const rooms = property.units.filter((u) => u.type === 'ROOM');
          const apts = property.units.filter((u) => u.type === 'APARTMENT');
          const totalMonthlyRentCapacity = property.units.reduce((acc, u) => acc + u.baseRent, 0);

          return (
            <div
              key={property.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div className="p-6">
                {/* Cabecera Inmueble */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 leading-tight">
                        {property.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {property.address} · {property.city} ({property.postalCode})
                      </p>
                      {property.cadastralRef && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Ref. Catastral: {property.cadastralRef}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                    CEE: {property.energyRating || 'N/D'}
                  </span>
                </div>

                {/* Copropiedad / Socios */}
                {property.coOwners.length > 0 && (
                  <div className="mt-4 p-2.5 bg-blue-50/60 border border-blue-200/70 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-blue-900 font-semibold">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Co-propiedad: {property.coOwners[0].userName}</span>
                    </div>
                    <span className="font-extrabold text-blue-700">
                      Cuota: {property.coOwners[0].percentage}%
                    </span>
                  </div>
                )}

                {/* Zonas comunes y normas */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="font-bold text-slate-800">Zonas comunes: </span>
                    <span>{property.commonAreas || 'Sin especificar'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="font-bold text-slate-800">Normas generales: </span>
                    <span className="line-clamp-2">{property.generalRules || 'Normas básicas de convivencia.'}</span>
                  </div>
                </div>

                {/* Resumen de Unidades Hijas */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Unidades Hijas ({property.units.length})
                    </span>
                    <span className="text-xs font-extrabold text-teal-700">
                      Capacidad Bruta: {totalMonthlyRentCapacity.toFixed(2)} €/mes
                    </span>
                  </div>

                  <div className="space-y-2">
                    {property.units.map((unit) => (
                      <div
                        key={unit.id}
                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs hover:bg-slate-100/80 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{unit.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              unit.type === 'ROOM' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {unit.type === 'ROOM' ? 'Habitación' : 'Apartamento'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {unit.surfaceArea ? `${unit.surfaceArea} m²` : ''} 
                            {unit.bedType ? ` · Cama ${unit.bedType}` : ''}
                            {unit.privateBathroom ? ' · Baño privado' : ' · Baño compartido'}
                            {unit.hasDesk ? ' · Escritorio y flexo' : ''}
                          </p>
                        </div>

                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-black text-slate-900">{unit.baseRent} €/m</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              unit.status === 'OCCUPIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : unit.status === 'RESERVED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {unit.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pie de tarjeta con enlace a detalle */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-teal-700">
                <span>{property.fixedExpenses.length} gastos fijos asociados</span>
                <Link
                  href={`/inmuebles/${property.id}`}
                  className="hover:underline flex items-center gap-1 font-bold"
                >
                  Gestionar Unidades & Gastos <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
