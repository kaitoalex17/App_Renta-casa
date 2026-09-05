'use client';

import { useState } from 'react';
import { UnitData } from '@/types';
import { Layers, Image as ImageIcon, Plus, CheckCircle2 } from 'lucide-react';
import UnitInventoryModal from './UnitInventoryModal';

interface PropertyUnitsListProps {
  initialUnits: UnitData[];
  propertyId: string;
}

export default function PropertyUnitsList({ initialUnits }: PropertyUnitsListProps) {
  const [units, setUnits] = useState<UnitData[]>(initialUnits);
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);

  function handleUnitUpdated(updatedUnit: UnitData) {
    setUnits((prev) =>
      prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u))
    );
    setSelectedUnit(updatedUnit);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Unidades del Inmueble ({units.length})
          </h2>
          <p className="text-xs text-slate-500">
            Habitaciones con inventario detallado y reportaje fotográfico optimizado para contratos
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {units.map((unit) => {
          const itemCount = unit.inventory?.length || 0;
          const photoCount = unit.photos?.length || 0;

          return (
            <div
              key={unit.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-300 transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900">{unit.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      unit.status === 'OCCUPIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : unit.status === 'RESERVED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p>
                    <strong>Tipo:</strong> {unit.type === 'ROOM' ? 'Habitación Coliving' : 'Apartamento Completo'}
                  </p>
                  {unit.surfaceArea && <p><strong>Superficie:</strong> {unit.surfaceArea} m²</p>}
                  {unit.bedType && <p><strong>Cama:</strong> {unit.bedType}</p>}
                  <p>
                    <strong>Baño:</strong> {unit.privateBathroom ? 'Privado en Suite' : 'Compartido en zona común'}
                  </p>
                  {unit.type === 'ROOM' && (
                    <p className="text-teal-700 font-semibold">
                      <strong>Tope Suministros:</strong> {unit.utilityCap.toFixed(2)} €/mes incluidos
                    </p>
                  )}
                </div>

                {/* Badges de Inventario y Fotos */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    <Layers className="w-3 h-3 text-teal-600" />
                    <span>{itemCount} muebles/ítems</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    <ImageIcon className="w-3 h-3 text-purple-600" />
                    <span>{photoCount} fotos web</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Renta Base</span>
                    <span className="text-base font-black text-slate-900">{unit.baseRent.toFixed(2)} €</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fianza</span>
                    <span className="text-xs font-bold text-slate-700">{unit.depositAmount.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Botón de Gestión de Inventario */}
                <button
                  type="button"
                  onClick={() => setSelectedUnit(unit)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Gestionar Inventario & Fotos WebP</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedUnit && (
        <UnitInventoryModal
          unit={selectedUnit}
          isOpen={true}
          onClose={() => setSelectedUnit(null)}
          onInventoryUpdated={handleUnitUpdated}
        />
      )}
    </div>
  );
}
