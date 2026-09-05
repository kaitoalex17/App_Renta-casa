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
  UserCheck,
} from 'lucide-react';
import { Role } from '@/types';

interface MobileBottomBarProps {
  userRole?: Role;
}

export default function MobileBottomBar({ userRole = 'ADMIN' }: MobileBottomBarProps) {
  const pathname = usePathname();

  // Accesos directos principales para navegación rápida con el pulgar en móviles
  const primaryTabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ocupación', href: '/ocupacion', icon: CalendarDays },
    { name: 'Inmuebles', href: '/inmuebles', icon: Building2 },
    { name: 'Contratos', href: '/contratos', icon: FileSignature },
    { name: 'Finanzas', href: '/finanzas', icon: Wallet },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 safe-pb shadow-lg"
      aria-label="Navegación inferior móvil"
    >
      <div className="grid grid-cols-5 h-14">
        {primaryTabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
                isActive ? 'text-teal-600 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
