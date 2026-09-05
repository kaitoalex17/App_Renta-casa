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
  X,
} from 'lucide-react';
import { Role } from '@/types';
import { useMobileNav } from '@/context/MobileNavContext';

interface SidebarProps {
  userRole?: Role;
  userName?: string;
}

export default function Sidebar({ userRole = 'ADMIN', userName }: SidebarProps) {
  const pathname = usePathname();
  const { mobileNavOpen, setMobileNavOpen } = useMobileNav();

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
    <>
      {/* Telón de fondo táctil en móviles cuando el menú está desplegado */}
      {mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: en desktop es fija y visible (w-64); en móvil es un cajón táctil deslizable */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
              RC
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-white block leading-tight">RentaCasa</span>
              <p className="text-[10px] text-slate-400">Coliving & Media Temporada</p>
            </div>
          </div>

          {/* Botón táctil para cerrar el menú en móvil */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Info */}
        <div className="px-4 sm:px-5 py-3 bg-slate-850/60 border-b border-slate-800/80">
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

        {/* Navigation links optimizados para pulsación táctil (mínimo 44px de alto) */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto touch-scroll">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800 safe-pb">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-xl transition active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
