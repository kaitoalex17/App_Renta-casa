'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  FileSignature,
  Zap,
  Wallet,
  Wrench,
  BellRing,
  ShieldCheck,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { Role } from '@/types';

interface SidebarProps {
  userRole?: Role;
  userName?: string;
}

export default function Sidebar({ userRole = 'ADMIN', userName }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard General', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'ADMIN', 'CO_OWNER', 'MANAGER'] },
    { name: 'Calendario / Ocupación', href: '/ocupacion', icon: CalendarDays, roles: ['SUPERADMIN', 'ADMIN', 'CO_OWNER', 'MANAGER'] },
    { name: 'Inmuebles & Unidades', href: '/inmuebles', icon: Building2, roles: ['SUPERADMIN', 'ADMIN', 'CO_OWNER', 'MANAGER'] },
    { name: 'Contratos & Legal', href: '/contratos', icon: FileSignature, roles: ['SUPERADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Motor Suministros', href: '/suministros', icon: Zap, roles: ['SUPERADMIN', 'ADMIN', 'MANAGER'] },
    { name: 'Finanzas & Rentabilidad', href: '/finanzas', icon: Wallet, roles: ['SUPERADMIN', 'ADMIN', 'CO_OWNER'] },
    { name: 'Averías & Limpieza', href: '/incidencias', icon: Wrench, roles: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'TENANT'] },
    { name: 'Avisos Formales', href: '/avisos', icon: BellRing, roles: ['SUPERADMIN', 'ADMIN', 'MANAGER', 'TENANT'] },
    { name: 'Portal Inquilino (Demo)', href: '/portal/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e', icon: UserCheck, roles: ['SUPERADMIN', 'ADMIN', 'TENANT'] },
  ];

  if (userRole === 'SUPERADMIN') {
    navigation.push({
      name: 'Panel Superadmin',
      href: '/admin/superadmin',
      icon: ShieldCheck,
      roles: ['SUPERADMIN'],
    });
  }

  const filteredNav = navigation.filter((item) => item.roles.includes(userRole));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
              RC
            </div>
            <span className="font-extrabold tracking-tight text-lg text-white">RentaCasa</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Coliving & Media Temporada</p>
        </div>
      </div>

      {/* Role Badge Info */}
      <div className="px-5 py-3 bg-slate-850/60 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Sesión Actual</span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              userRole === 'SUPERADMIN'
                ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                : userRole === 'ADMIN'
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                : userRole === 'CO_OWNER'
                ? 'bg-blue-900/80 text-blue-200 border border-blue-700'
                : userRole === 'MANAGER'
                ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                : 'bg-teal-900/80 text-teal-200 border border-teal-700'
            }`}
          >
            {userRole}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-200 truncate mt-1">{userName || 'Usuario'}</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
