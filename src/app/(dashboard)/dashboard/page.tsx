import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import MetricCard from '@/components/MetricCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import {
  Users,
  Wallet,
  TrendingUp,
  AlertTriangle,
  FileSignature,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const properties = dataStore.getProperties(user || undefined);
  const units = properties.flatMap((p) => p.units);
  const contracts = dataStore.getContracts(user || undefined);
  const payments = dataStore.getPayments(user || undefined);
  const tickets = dataStore.getTickets(user || undefined);

  // Cálculos de Ocupación
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED').length;
  const reservedUnits = units.filter((u) => u.status === 'RESERVED').length;
  const availableUnits = units.filter((u) => u.status === 'AVAILABLE').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Cálculos de Cobros
  const totalBilled = payments.reduce((acc, p) => acc + p.totalAmount, 0);
  const paidAmount = payments.filter((p) => p.status === 'PAID').reduce((acc, p) => acc + p.totalAmount, 0);
  const pendingAmount = payments.filter((p) => p.status === 'PENDING').reduce((acc, p) => acc + p.totalAmount, 0);
  const overdueAmount = payments.filter((p) => p.status === 'OVERDUE').reduce((acc, p) => acc + p.totalAmount, 0);

  // Gastos Fijos Mensuales consolidados
  const totalFixedExpenses = properties.reduce((acc, prop) => {
    return (
      acc +
      prop.fixedExpenses.reduce((fAcc, exp) => {
        if (exp.frequency === 'MONTHLY') return fAcc + exp.amount;
        if (exp.frequency === 'ANNUAL') return fAcc + exp.amount / 12;
        if (exp.frequency === 'QUARTERLY') return fAcc + exp.amount / 3;
        return fAcc;
      }, 0)
    );
  }, 0);

  const netCashFlow = paidAmount - totalFixedExpenses;
  // Yield estimado (estimando valoración de activos de muestra de 380.000€)
  const estimatedAssetValue = 380000;
  const annualizedNetYield = ((netCashFlow * 12) / estimatedAssetValue) * 100;

  // Alertas de contratos próximos a vencer (en los próximos 60 días)
  const now = new Date();
  const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const expiringContracts = contracts.filter((c) => {
    if (c.status !== 'ACTIVE') return false;
    const end = new Date(c.endDate);
    return end >= now && end <= sixtyDaysAhead;
  });

  return (
    <div className="space-y-8">
      {/* Saludo y acciones rápidas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Panel de Control Operativo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión integral de {properties.length} inmueble(s) y {totalUnits} unidades de media temporada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contratos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <FileSignature className="w-4 h-4" />
            <span>Nuevo Contrato LAU 3</span>
          </Link>
          <Link
            href="/suministros"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Prorratear Suministros</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Tasa de Ocupación"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedUnits} ocupadas · ${reservedUnits} reservadas · ${availableUnits} libres`}
          icon={Users}
          color="teal"
          trend={`${totalUnits} unidades totales`}
        />
        <MetricCard
          title="Cash Flow Neto Mes"
          value={`${netCashFlow.toFixed(2)} €`}
          subtitle={`Cobrado (${paidAmount.toFixed(0)} €) - Gastos fijos (${totalFixedExpenses.toFixed(0)} €)`}
          icon={Wallet}
          color="emerald"
          trend="Flujo real tras costes"
        />
        <MetricCard
          title="Rentabilidad Neta (Cap Rate)"
          value={`${annualizedNetYield.toFixed(2)}%`}
          subtitle="Retorno anual neto s/ valoración estimada"
          icon={TrendingUp}
          color="blue"
          trend="Superior a alquiler tradicional"
        />
        <MetricCard
          title="Cobros Pendientes / Retraso"
          value={`${(pendingAmount + overdueAmount).toFixed(2)} €`}
          subtitle={`${payments.filter((p) => p.status === 'OVERDUE').length} recibo(s) en rojo (retrasados)`}
          icon={AlertTriangle}
          color={overdueAmount > 0 ? 'rose' : 'amber'}
        />
      </div>

      {/* Alerta de Contratos por Vencer (Rotación de Temporada) */}
      {expiringContracts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Rotación de Media Temporada: {expiringContracts.length} contrato(s) vencen en los próximos 60 días
                </h3>
                <p className="text-xs text-amber-800 mt-1">
                  Anticípate a los periodos vacíos del fin de cuatrimestre universitario o finalización de contrato laboral para publicar la habitación con antelación:
                </p>
                <div className="mt-3 space-y-1.5">
                  {expiringContracts.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 text-xs text-amber-950 font-medium">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold">{c.unitName}</span>
                      <span>({c.tenantName})</span>
                      <span className="text-amber-800 font-semibold">Fecha fin: {c.endDate}</span>
                      <Link
                        href={`/contratos/${c.id}`}
                        className="text-amber-900 underline hover:text-amber-700 font-bold ml-2"
                      >
                        Ver Ficha
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/ocupacion"
              className="text-xs font-bold text-amber-900 hover:text-amber-700 underline flex-shrink-0"
            >
              Ver Gantt de Ocupación &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Tablero Semáforo de Cobros del Mes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Semáforo de Pagos & Recibos</h2>
            <p className="text-xs text-slate-500">Control de cobros mensuales con aviso directo por WhatsApp</p>
          </div>
          <Link
            href="/finanzas"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Módulo Financiero Completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Inquilino & Unidad</th>
                <th className="px-6 py-3">Mes / Año</th>
                <th className="px-6 py-3">Renta Base</th>
                <th className="px-6 py-3">Suministros (Luz/Agua)</th>
                <th className="px-6 py-3">Total Recibo</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.tenantName}</p>
                    <p className="text-xs text-slate-500">{p.unitName}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {p.month}/{p.year}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {p.rentAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {p.utilitiesAmount > 0 ? `+${p.utilitiesAmount.toFixed(2)} €` : '0.00 € (Incl.)'}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-900">
                    {p.totalAmount.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Pagado ({p.paymentMethod || 'Transferencia'})
                      </span>
                    )}
                    {p.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        En Plazo (Días 1-5)
                      </span>
                    )}
                    {p.status === 'OVERDUE' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Atrasado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'OVERDUE' ? (
                      <WhatsAppButton
                        phone={p.tenantPhone}
                        tenantName={p.tenantName}
                        unitName={p.unitName}
                        amount={p.totalAmount}
                        type="PAYMENT_REMINDER"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">Al día</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloque inferior: Averías abiertas & Enlaces de onboarding */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidencias Recientes */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Averías & Mantenimiento</h3>
            <Link href="/incidencias" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              Ver todas ({tickets.length}) &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {tickets.slice(0, 3).map((t) => (
              <div key={t.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{t.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      t.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{t.description}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Reportado por {t.reportedByName} · {t.unitName || 'Zona común'}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acceso Rápido al Flujo de Firma Móvil (Magic Link) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold mb-3">
              <FileSignature className="w-3.5 h-3.5" />
              Firma Móvil Sin Fricción
            </div>
            <h3 className="text-lg font-black tracking-tight">Onboarding & Contrato LAU Art. 3</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Envía el enlace de firma por WhatsApp. El inquilino revisa las condiciones en tarjetas adaptadas al móvil, dibuja su rúbrica con el dedo y el sistema genera la hoja de evidencias legal con IP y sellado temporal.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/firmar/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm"
              target="_blank"
            >
              <span>Probar Visor de Firma Móvil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/portal/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition"
              target="_blank"
            >
              <span>Probar Portal del Inquilino</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
