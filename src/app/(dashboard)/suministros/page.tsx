'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Flame,
  Wifi,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  FileText,
} from 'lucide-react';
import { UtilityBillData } from '@/types';

export default function UtilitiesPage() {
  const [bills, setBills] = useState<UtilityBillData[]>([]);
  const [propertyId, setPropertyId] = useState('prop_granvia');
  const [utilityType, setUtilityType] = useState<'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET'>('ELECTRICITY');
  const [invoiceNumber, setInvoiceNumber] = useState('FAC-IBER-2025-10492');
  const [periodStart, setPeriodStart] = useState('2025-10-01');
  const [periodEnd, setPeriodEnd] = useState('2025-10-31');
  const [totalAmount, setTotalAmount] = useState('180.00');

  const [calculating, setCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [appliedMessage, setAppliedMessage] = useState('');

  useEffect(() => {
    // Cargar facturas existentes
    fetch('/api/contracts')
      .then(() => {
        // Obtenemos facturas del estado inicial
      })
      .catch(console.error);
  }, []);

  async function handleCalculate(applyToReceipts: boolean) {
    setCalculating(true);
    setAppliedMessage('');
    try {
      const res = await fetch('/api/utilities/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          utilityType,
          invoiceNumber,
          periodStart,
          periodEnd,
          totalAmount,
          applyToReceipts,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCalcResult(data.calculation);
      if (applyToReceipts) {
        setAppliedMessage('¡Factura calculada y cargos adicionales imputados a los recibos de los inquilinos!');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCalculating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Motor Inteligente de Suministros
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Luz, Agua e Internet
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Prorrateo por días exactos en apartamentos y reparto de excesos sobre tope incluido (35 €/mes) en coliving.
          </p>
        </div>
      </div>

      {/* Grid: Formulario de Nueva Factura + Panel de Simulación / Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Entrada */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>Registrar / Simular Factura</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Inmueble</label>
              <select
                value={propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  setCalcResult(null);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
              >
                <option value="prop_teatinos">Coliving Teatinos Universidad (Málaga - Habitaciones)</option>
                <option value="prop_soho">Estudio Soho Tech (Málaga - Apartamento)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Suministro</label>
                <select
                  value={utilityType}
                  onChange={(e) => setUtilityType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium"
                >
                  <option value="ELECTRICITY">⚡ Electricidad (Luz)</option>
                  <option value="WATER">💧 Agua Corriente</option>
                  <option value="GAS">🔥 Gas Natural</option>
                  <option value="INTERNET">🌐 Fibra Óptica</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nº Factura Oficial</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inicio Periodo Factura</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fin Periodo Factura</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Importe Total Facturado (€ IVA incl.)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-black text-slate-900 pr-8"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">€</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
              {propertyId === 'prop_granvia' ? (
                <span>
                  💡 <strong>Modelo Coliving:</strong> Cada habitación ocupada tiene 35€ incluidos. Se calcula la bolsa total de topes y si la factura real excede la bolsa, el exceso se divide equitativamente entre los inquilinos activos.
                </span>
              ) : (
                <span>
                  🏢 <strong>Modelo Apartamento:</strong> El huésped asume el 100% del consumo. Si entró a mitad de mes, se prorratea por los días exactos de estancia en el periodo.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCalculate(false)}
                disabled={calculating}
                className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow transition"
              >
                {calculating ? 'Calculando...' : '1. Simular Reparto'}
              </button>
              <button
                type="button"
                onClick={() => handleCalculate(true)}
                disabled={calculating}
                className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow transition"
              >
                {calculating ? 'Procesando...' : '2. Aplicar a Recibos'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Resultados y Desglose Matemático */}
        <div className="lg:col-span-7 space-y-6">
          {appliedMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{appliedMessage}</span>
            </div>
          )}

          {calcResult ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Resultado del Cálculo Matemático ({calcResult.propertyType === 'ROOMS' ? 'Coliving' : 'Apartamento'})
                </h3>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                  Total Factura: {calcResult.totalInvoiceAmount.toFixed(2)} €
                </span>
              </div>

              {calcResult.propertyType === 'ROOMS' && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Bolsa Topes Sumada</span>
                    <span className="text-sm font-black text-slate-800">{calcResult.totalCapsPooled.toFixed(2)} €</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Exceso a Repercutir</span>
                    <span className="text-sm font-black text-rose-600">+{calcResult.totalExcessOverCap.toFixed(2)} €</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Días Ocupados Totales</span>
                    <span className="text-sm font-black text-slate-800">{calcResult.totalOccupantDays} días</span>
                  </div>
                </div>
              )}

              {/* Desglose por Habitación / Inquilino */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Cargos Resultantes por Inquilino:
                </span>

                {calcResult.results.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{res.unitName}</div>
                      <div className="text-slate-500 font-medium mt-0.5">{res.tenantName}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{res.calculationExplanation}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Cargo Adicional</span>
                      <span className="text-base font-black text-teal-800">
                        {res.totalCharged > 0 ? `+${res.totalCharged.toFixed(2)} €` : '0.00 €'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 text-xs">
              <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-medium">Introduce los datos de la factura oficial a la izquierda y pulsa en "Simular Reparto".</p>
              <p className="text-[11px] text-slate-400 mt-1">
                El sistema aplicará automáticamente el tope común de las habitaciones ocupadas o los días de estancia.
              </p>
            </div>
          )}

          {/* Histórico de Facturas de Suministro */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Histórico de Facturas de Suministro Conciliadas
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">FAC-ENDE-2025-09812</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      ⚡ Electricidad (Endesa)
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">Coliving Teatinos Universidad (Málaga) · Periodo 01/09/2025 al 30/09/2025</p>
                  <p className="text-[11px] text-teal-700 font-medium mt-1">
                    Factura: 169.00 € · Bolsa topes: 70.00 € · Exceso repercutido: 99.00 € (49.50 € a Juan y 49.50 € a Elena)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                    Conciliado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
