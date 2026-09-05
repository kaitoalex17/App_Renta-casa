'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquareShare,
  Users,
  Building,
  ArrowDownRight,
  Receipt,
  Calculator,
  ShieldCheck,
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';
import MetricCard from '@/components/MetricCard';
import { PaymentReceiptData } from '@/types';

export default function FinancesPage() {
  const [payments, setPayments] = useState<PaymentReceiptData[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para la calculadora de liquidación de fianza
  const [initialDeposit, setInitialDeposit] = useState(550);
  const [cleaningFee, setCleaningFee] = useState(50);
  const [damageFee, setDamageFee] = useState(0);
  const [pendingUtilities, setPendingUtilities] = useState(25.5);
  const [extraDaysFee, setExtraDaysFee] = useState(0);

  const depositRefund = Math.max(
    0,
    initialDeposit - (cleaningFee + damageFee + pendingUtilities + extraDaysFee)
  );

  useEffect(() => {
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(
    paymentId: string,
    status: 'PAID' | 'PENDING' | 'OVERDUE',
    method: 'TRANSFER' | 'BIZUM' | 'CASH' = 'TRANSFER'
  ) {
    try {
      const res = await fetch('/api/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status, paymentMethod: method }),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? data.payment : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Cálculos agregados
  const totalBilled = payments.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((acc, p) => acc + p.totalAmount, 0);
  const totalOverdue = payments.filter((p) => p.status === 'OVERDUE').reduce((acc, p) => acc + p.totalAmount, 0);

  // Gastos consolidados del mes
  const fixedExpensesMonth = 450; // IBI + Comunidad + Seguro + Fibra + Limpieza
  const netProfitMonth = totalPaid - fixedExpensesMonth;

  // Reparto entre socios (Carlos 50%, Laura 50%)
  const partnerShareCarlos = Math.max(0, netProfitMonth * 0.5);
  const partnerShareLaura = Math.max(0, netProfitMonth * 0.5);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Finanzas, Cobros & Rentabilidad Real
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Cash Flow & Dividendos
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Control de cobros mensuales con semáforo, liquidación de fianzas de salida y reparto automatizado entre socios.
          </p>
        </div>
      </div>

      {/* Indicadores Financieros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Cobrado Este Mes"
          value={`${totalPaid.toFixed(2)} €`}
          subtitle={`De ${totalBilled.toFixed(2)} € emitidos en recibos`}
          icon={Wallet}
          color="emerald"
          trend="Ingresos efectivos en cuenta"
        />
        <MetricCard
          title="Gastos Fijos & Operativos"
          value={`${fixedExpensesMonth.toFixed(2)} €`}
          subtitle="Comunidad, IBI, Seguro, Fibra y Limpiezas"
          icon={Receipt}
          color="slate"
        />
        <MetricCard
          title="Beneficio Neto a Repartir"
          value={`${netProfitMonth.toFixed(2)} €`}
          subtitle="Cobrado - Gastos fijos operativos"
          icon={TrendingUp}
          color="teal"
          trend="Flujo neto disponible"
        />
        <MetricCard
          title="Cobros Vencidos (Rojo)"
          value={`${totalOverdue.toFixed(2)} €`}
          subtitle="Avisos WhatsApp listos para enviar"
          icon={AlertTriangle}
          color={totalOverdue > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* 1. Tablero Semáforo de Cobros Mensuales */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tablero Semáforo de Cobros Mensuales
            </h2>
            <p className="text-xs text-slate-500">
              🟢 Verde (Cobrado con método) · 🟡 Amarillo (En plazo días 1-5) · 🔴 Rojo (Atrasado con aviso WhatsApp)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Inquilino & Unidad</th>
                <th className="px-6 py-3">Mes/Año</th>
                <th className="px-6 py-3">Renta Base</th>
                <th className="px-6 py-3">Suministros Repercutidos</th>
                <th className="px-6 py-3">Total Recibo</th>
                <th className="px-6 py-3">Estado de Pago</th>
                <th className="px-6 py-3 text-right">Gestión de Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.tenantName}</p>
                    <p className="text-xs text-slate-500">{p.unitName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{p.tenantPhone || 'Sin teléfono'}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {p.month}/{p.year}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {p.rentAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {p.utilitiesAmount > 0 ? (
                      <span className="text-amber-700 font-bold">+{p.utilitiesAmount.toFixed(2)} €</span>
                    ) : (
                      '0.00 € (Tope)'
                    )}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">
                    {p.totalAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Pagado ({p.paymentMethod || 'Transferencia'})
                      </span>
                    )}
                    {p.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        En Plazo (Días 1-5)
                      </span>
                    )}
                    {p.status === 'OVERDUE' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Atrasado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status !== 'PAID' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateStatus(p.id, 'PAID', 'TRANSFER')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition"
                            title="Marcar como cobrado por Transferencia"
                          >
                            Cobrado (Transf.)
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, 'PAID', 'BIZUM')}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold transition"
                            title="Marcar como cobrado por Bizum"
                          >
                            Bizum
                          </button>
                        </div>
                      )}

                      {p.status === 'OVERDUE' && (
                        <WhatsAppButton
                          phone={p.tenantPhone}
                          tenantName={p.tenantName}
                          unitName={p.unitName}
                          amount={p.totalAmount}
                          type="PAYMENT_REMINDER"
                        />
                      )}

                      {p.status === 'PAID' && (
                        <span className="text-xs text-slate-400 font-medium">Recibo al día</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Liquidación de Fianza y Reparto entre Socios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Ciclo de Vida & Liquidación de Fianza al Check-out */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Liquidación de Fianza al Check-out
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              Ref. Autonómica: IVIMA-MAD-2025-098124
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Calcula las deducciones justificadas (limpieza final, roturas, regularización de luz) para devolver el saldo exacto:
          </p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <label className="font-semibold text-slate-700">Fianza Inicial Custodiada (€)</label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(parseFloat(e.target.value) || 0)}
                className="w-28 text-right font-black p-1.5 bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <label className="text-slate-600">Deducción por Limpieza Final de Habitación (€)</label>
              <input
                type="number"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(parseFloat(e.target.value) || 0)}
                className="w-28 text-right font-semibold p-1.5 bg-white border border-slate-300 rounded text-rose-600"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <label className="text-slate-600">Deducción por Desperfectos / Daños (€)</label>
              <input
                type="number"
                value={damageFee}
                onChange={(e) => setDamageFee(parseFloat(e.target.value) || 0)}
                className="w-28 text-right font-semibold p-1.5 bg-white border border-slate-300 rounded text-rose-600"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <label className="text-slate-600">Suministros Pendientes de Regularizar (€)</label>
              <input
                type="number"
                value={pendingUtilities}
                onChange={(e) => setPendingUtilities(parseFloat(e.target.value) || 0)}
                className="w-28 text-right font-semibold p-1.5 bg-white border border-slate-300 rounded text-rose-600"
              />
            </div>

            <div className="p-4 bg-teal-50 border border-teal-300 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wider block">
                  Importe Final Exacto a Devolver
                </span>
                <span className="text-[11px] text-teal-800">
                  Descontando deducciones justificadas
                </span>
              </div>
              <span className="text-2xl font-black text-teal-800">
                {depositRefund.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* 3. Reparto de Beneficios entre Socios Co-propietarios */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Liquidación Automática entre Socios
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Cierre Mensual
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Distribución del flujo de caja neto del mes en base a los porcentajes de copropiedad registrados:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Carlos Mendoza (Dueño Principal)</span>
                  <span className="text-slate-500">Cuota asignada: 50.0%</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900">
                    {partnerShareCarlos.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-400 block">Transferencia lista</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Laura Gómez (Socia Inversora)</span>
                  <span className="text-slate-500">Cuota asignada: 50.0%</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-blue-700">
                    {partnerShareLaura.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-slate-400 block">Transferencia lista</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold block">Descargar Liquidación Mensual</span>
              <span className="text-[11px] text-slate-400">Informe desglosado para IRPF y modelo trimestral</span>
            </div>
            <button
              onClick={() => alert('Generando informe de liquidación en PDF para los socios...')}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold transition"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
