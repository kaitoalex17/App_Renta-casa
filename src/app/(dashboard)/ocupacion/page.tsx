'use client';

import { useState, useEffect } from 'react';
import {
  CalendarDays,
  Building2,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { PropertyData, ContractData } from '@/types';

interface GanttUnitItem {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  type: string;
  price: number;
  occupiedMonths: number[];
  tenant: string | null;
  contractId?: string;
  status: string;
}

export default function OccupancyGanttPage() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');

  // Rango de 12 meses para el Gantt (ej. Sep a Ago)
  const months = [
    { label: 'Sep', year: 2025, monthNum: 9, isKeyTurnover: false },
    { label: 'Oct', year: 2025, monthNum: 10, isKeyTurnover: false },
    { label: 'Nov', year: 2025, monthNum: 11, isKeyTurnover: false },
    { label: 'Dic', year: 2025, monthNum: 12, isKeyTurnover: false },
    { label: 'Ene', year: 2026, monthNum: 1, isKeyTurnover: false },
    { label: 'Feb (Fin Q1)', year: 2026, monthNum: 2, isKeyTurnover: true }, // Fin de 1er cuatrimestre
    { label: 'Mar', year: 2026, monthNum: 3, isKeyTurnover: false },
    { label: 'Abr', year: 2026, monthNum: 4, isKeyTurnover: false },
    { label: 'May', year: 2026, monthNum: 5, isKeyTurnover: false },
    { label: 'Jun (Fin Q2)', year: 2026, monthNum: 6, isKeyTurnover: true }, // Fin de 2º cuatrimestre
    { label: 'Jul (Verano)', year: 2026, monthNum: 7, isKeyTurnover: false },
    { label: 'Ago (Verano)', year: 2026, monthNum: 8, isKeyTurnover: false },
  ];

  useEffect(() => {
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        if (data.contracts) setContracts(data.contracts);
      })
      .catch(console.error);

    // Cargar inmuebles directamente
    fetch('/api/auth/me')
      .then(() => {
        // En demostración cargamos datos de la sesión
      });
  }, []);

  // Simulación de unidades para el Gantt
  const allUnits: GanttUnitItem[] = [
    {
      id: 'unit_h1',
      propertyId: 'prop_teatinos',
      propertyName: 'Coliving Teatinos Universidad',
      name: 'Habitación 1 - Balcón',
      type: 'ROOM',
      price: 550,
      occupiedMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5, 6], // Juan hasta Junio (UMA)
      tenant: 'Juan Martínez (Máster UMA)',
      contractId: 'ct_juan',
      status: 'OCCUPIED',
    },
    {
      id: 'unit_h2',
      propertyId: 'prop_teatinos',
      propertyName: 'Coliving Teatinos Universidad',
      name: 'Habitación 2 - Suite Baño Privado',
      type: 'ROOM',
      price: 650,
      occupiedMonths: [10, 11, 12, 1, 2], // Elena se va a finales de Febrero!
      tenant: 'Elena Santos (Contrato Málaga TechPark)',
      contractId: 'ct_elena',
      status: 'ROTATING_SOON', // Vacante a partir de marzo
    },
    {
      id: 'unit_h3',
      propertyId: 'prop_teatinos',
      propertyName: 'Coliving Teatinos Universidad',
      name: 'Habitación 3 - Interior',
      type: 'ROOM',
      price: 450,
      occupiedMonths: [], // Vacía todo el año
      tenant: null,
      status: 'AVAILABLE',
    },
    {
      id: 'unit_h4',
      propertyId: 'prop_teatinos',
      propertyName: 'Coliving Teatinos Universidad',
      name: 'Habitación 4 - Luminosa',
      type: 'ROOM',
      price: 490,
      occupiedMonths: [11, 12, 1, 2, 3, 4, 5, 6], // Entrada en noviembre
      tenant: 'Reserva Confirmada (Llegada 1 Nov)',
      status: 'RESERVED',
    },
    {
      id: 'unit_apt1',
      propertyId: 'prop_soho',
      propertyName: 'Estudio Soho Tech Málaga',
      name: 'Apartamento Soho Completo',
      type: 'APARTMENT',
      price: 950,
      occupiedMonths: [],
      tenant: null,
      status: 'AVAILABLE',
    },
  ];

  const filteredUnits =
    selectedPropertyId === 'ALL'
      ? allUnits
      : allUnits.filter((u) => u.propertyId === selectedPropertyId);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Calendario de Ocupación / Timeline Gantt
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Málaga Media Temporada
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visualiza la disponibilidad de cada habitación mes a mes y prevé las rotaciones críticas de febrero y junio en Teatinos (UMA).
          </p>
        </div>

        {/* Filtro de Inmueble */}
        <div className="flex items-center gap-3">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3.5 py-2 shadow-sm focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Todos los Inmuebles en Málaga</option>
            <option value="prop_teatinos">Coliving Teatinos Universidad</option>
            <option value="prop_soho">Estudio Soho Tech Málaga</option>
          </select>

          <Link
            href="/contratos/nuevo"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            Asignar Huésped
          </Link>
        </div>
      </div>

      {/* Banner de Estrategia de Vacancia */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 text-white p-5 rounded-xl border border-teal-800/50 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-teal-200">
              Anticipación Inteligente de Vacancia (Hitos Universitarios)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Las columnas destacadas en naranja indican <strong>Febrero</strong> (cambio de semestre universitario) y <strong>Junio</strong> (fin de curso lectivo).
              En la <strong>Habitación 2</strong>, el contrato de Elena vence el 28 de febrero; puedes iniciar la comercialización para el segundo semestre desde diciembre.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-950/80 border border-teal-700 rounded-md text-teal-300">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            Ocupado
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-700 rounded-md text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Vence pronto
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            Disponible
          </div>
        </div>
      </div>

      {/* Matriz Gantt Interactiva */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="p-4 text-left min-w-[240px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Unidad / Habitación
                </th>
                {months.map((m, idx) => (
                  <th
                    key={idx}
                    className={`p-3 text-center min-w-[85px] border-r border-slate-200 last:border-r-0 ${
                      m.isKeyTurnover ? 'bg-amber-50 text-amber-900 font-extrabold' : ''
                    }`}
                  >
                    <div>{m.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{m.year}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/60 transition group">
                  {/* Columna fija de la habitación */}
                  <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50/60 z-10 border-r border-slate-200">
                    <div className="font-extrabold text-slate-900 text-sm">{unit.name}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>{unit.propertyName}</span>
                      <span>·</span>
                      <span className="font-bold text-teal-700">{unit.price} €/mes</span>
                    </div>
                  </td>

                  {/* Celdas mensuales */}
                  {months.map((m, idx) => {
                    const isOccupied = unit.occupiedMonths.includes(m.monthNum);
                    const isRotating = unit.status === 'ROTATING_SOON' && m.monthNum === 2;

                    return (
                      <td
                        key={idx}
                        className={`p-2 text-center border-r border-slate-200 last:border-r-0 ${
                          m.isKeyTurnover ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {isOccupied ? (
                          <div
                            className={`h-11 rounded-lg flex flex-col items-center justify-center p-1 text-[11px] font-bold shadow-xs cursor-pointer transition ${
                              isRotating
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-teal-100 text-teal-900 border border-teal-300 hover:bg-teal-200'
                            }`}
                            title={`${unit.tenant || 'Ocupado'} (${unit.price} €)`}
                          >
                            <span className="truncate max-w-[75px]">
                              {isRotating ? 'Fin estancia' : 'Ocupada'}
                            </span>
                            <span className="text-[9px] font-medium opacity-80">
                              {unit.price} €
                            </span>
                          </div>
                        ) : (
                          <div className="h-11 rounded-lg border border-dashed border-slate-200 hover:border-teal-400 flex flex-col items-center justify-center p-1 text-[10px] text-slate-400 hover:text-teal-600 hover:bg-teal-50/40 transition">
                            <span>Libre</span>
                            <span className="text-[9px] text-slate-300">0 €</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de Oportunidades & Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Info className="w-4 h-4 text-amber-600" />
            Alerta Rotación Febrero 2026
          </div>
          <p className="text-xs text-slate-600 mt-2">
            La <strong>Habitación 2 (Suite)</strong> queda desocupada el 28 de febrero por finalización del contrato temporal de 5 meses. 
            Te sugerimos publicar la habitación en plataformas para el 2º cuatrimestre antes del <strong>15 de enero</strong>.
          </p>
          <div className="mt-3">
            <Link
              href="/contratos/ct_elena"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Ver contrato de Elena &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider">
            <Info className="w-4 h-4 text-teal-600" />
            Estancia Larga hasta Junio 2026
          </div>
          <p className="text-xs text-slate-600 mt-2">
            La <strong>Habitación 1</strong> de Juan Martínez está blindada hasta el 30 de junio (curso completo de Máster).
            Ingreso mensual garantizado de 550,00 € + suministros.
          </p>
          <div className="mt-3">
            <Link
              href="/contratos/ct_juan"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Ver contrato de Juan &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Info className="w-4 h-4 text-slate-500" />
            Coste de Oportunidad / Vacancia
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Actualmente hay <strong>2 unidades libres</strong> (Habitación 3 a 450€ y Apartamento a 950€).
            El coste diario de vacancia acumulado es de <strong>46,67 €/día</strong>.
          </p>
          <div className="mt-3">
            <Link
              href="/contratos/nuevo"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
            >
              Crear nuevo contrato &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
