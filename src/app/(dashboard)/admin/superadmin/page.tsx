import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import {
  ShieldCheck,
  Building,
  Users,
  Wallet,
  FileCheck2,
  Lock,
  ArrowRight,
  Server,
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';

export default async function SuperadminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const allUsers = dataStore.getUsers();
  const owners = allUsers.filter((u: any) => u.role === 'ADMIN');
  const allProperties = dataStore.getProperties(); // Superadmin ve TODOS
  const allUnits = allProperties.flatMap((p) => p.units);
  const allContracts = dataStore.getContracts();
  const allPayments = dataStore.getPayments();

  const totalVolume = allPayments.reduce((acc, p) => acc + p.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Encabezado Superadmin */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl border border-purple-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-purple-600/30 text-purple-300 rounded-xl border border-purple-500/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-white">
                Panel Maestro de Superadministrador (Creador & Moderador)
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-800 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-600">
                Acceso Ilimitado
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-1 max-w-2xl">
              Vista global agregada de todos los propietarios registrados, inmuebles, contratos y transacciones de la plataforma. Los Administradores solo ven sus propios inmuebles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-mono">
            Servidor Portainer: Activo
          </span>
        </div>
      </div>

      {/* Métricas Globales de la Plataforma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Dueños / Propietarios (Admin)"
          value={owners.length}
          subtitle="Administradores de patrimonio independientes"
          icon={Building}
          color="purple"
        />
        <MetricCard
          title="Inmuebles Totales en Plataforma"
          value={allProperties.length}
          subtitle={`${allUnits.length} habitaciones y apartamentos`}
          icon={Building}
          color="teal"
        />
        <MetricCard
          title="Contratos LAU 3 Custodiados"
          value={allContracts.length}
          subtitle={`${allContracts.filter((c) => c.status === 'ACTIVE').length} con firma digital y Audit Trail`}
          icon={FileCheck2}
          color="emerald"
        />
        <MetricCard
          title="Volumen Gestionado Global"
          value={`${totalVolume.toFixed(2)} €`}
          subtitle="Recibos mensuales emitidos en la plataforma"
          icon={Wallet}
          color="blue"
        />
      </div>

      {/* Tabla de Administradores Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Propietarios & Administradores de la Plataforma
            </h2>
            <p className="text-xs text-slate-500">
              Control de aislamiento multi-dueño y permisos de acceso
            </p>
          </div>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Nombre & Contacto</th>
              <th className="px-6 py-3">Rol en Sistema</th>
              <th className="px-6 py-3">Inmuebles Asignados</th>
              <th className="px-6 py-3">Unidades Gestionadas</th>
              <th className="px-6 py-3 text-right">Supervisión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {owners.map((owner: any) => {
              const ownerProps = allProperties.filter((p) => p.ownerId === owner.id);
              const ownerUnits = ownerProps.flatMap((p) => p.units);

              return (
                <tr key={owner.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{owner.name}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{owner.email}</p>
                    <p className="text-slate-400 text-[11px]">{owner.phone || 'Sin teléfono'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ADMIN (Dueño)
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {ownerProps.length} inmueble(s)
                    <div className="text-[11px] text-slate-400 font-normal">
                      {ownerProps.map((p) => p.name).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {ownerUnits.length} habitaciones/apartamentos
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg">
                      Aislado & Auditado
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Auditoría de Despliegue en Portainer */}
      <div className="bg-slate-900 text-slate-200 p-6 rounded-xl border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-teal-400 font-bold uppercase tracking-wider">
          <Server className="w-4 h-4" />
          <span>Configuración de Servidor Portainer & Cloudflare</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          El servidor registra correctamente las cabeceras <code className="text-teal-300 font-mono">CF-Connecting-IP</code> y <code className="text-teal-300 font-mono">X-Forwarded-For</code> a través del proxy inverso de Nginx. Cada firma digital emitida cuenta con certificado probatorio sellado con hash SHA-256 e IP pública verificada del cliente.
        </p>
      </div>
    </div>
  );
}
