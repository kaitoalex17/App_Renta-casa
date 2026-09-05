'use client';

import { useState } from 'react';
import { Shield, Users, ChevronDown, Menu } from 'lucide-react';
import { Role, UserSession } from '@/types';
import { useMobileNav } from '@/context/MobileNavContext';

interface HeaderProps {
  user: UserSession | null;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  properties?: { id: string; name: string }[];
}

export default function Header({ user, selectedPropertyId, onSelectProperty, properties = [] }: HeaderProps) {
  const [switchingRole, setSwitchingRole] = useState(false);
  const { toggleMobileNav } = useMobileNav();

  async function quickSwitchRole(role: Role) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleQuickSelect: role }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Botón de Menú Hamburguesa en Móvil + Selector de Inmueble */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition active:scale-95"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo / Nombre en móvil si no hay espacio */}
        <div className="lg:hidden flex items-center gap-1.5 font-black text-slate-900 text-sm mr-1 shrink-0">
          <div className="w-6 h-6 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center text-xs font-bold">
            RC
          </div>
        </div>

        {properties.length > 0 && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="hidden md:inline text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Inmueble:
            </span>
            <select
              value={selectedPropertyId || 'ALL'}
              onChange={(e) => onSelectProperty && onSelectProperty(e.target.value)}
              className="text-xs sm:text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-2 sm:px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 max-w-[140px] sm:max-w-[220px] truncate"
            >
              <option value="ALL">Todos ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de la derecha: Selector de Roles + Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Role Tester Selector */}
        <div className="relative">
          <button
            onClick={() => setSwitchingRole(!switchingRole)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition active:scale-95"
            title="Cambiar rápidamente de rol para probar permisos"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="hidden sm:inline">Rol:</span>
            <span className="font-bold underline">{user?.role || 'ADMIN'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {switchingRole && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Cambiar Rol en 1 Clic
              </div>
              <button
                onClick={() => { quickSwitchRole('SUPERADMIN'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between text-purple-900 font-medium active:bg-purple-50"
              >
                <span>👑 Superadmin (Tú)</span>
                <span className="text-[10px] text-purple-600">Control global</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('ADMIN'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between text-emerald-900 font-medium active:bg-emerald-50"
              >
                <span>🏢 Admin (Dueño)</span>
                <span className="text-[10px] text-emerald-600">Sus pisos</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('CO_OWNER'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between text-blue-900 font-medium active:bg-blue-50"
              >
                <span>🤝 Co-propietario (50%)</span>
                <span className="text-[10px] text-blue-600">Rentabilidad</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('MANAGER'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between text-amber-900 font-medium active:bg-amber-50"
              >
                <span>🔧 Gestor / Operador</span>
                <span className="text-[10px] text-amber-600">Operaciones</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('TENANT'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-900 font-medium active:bg-slate-100"
              >
                <span>👤 Inquilino (Juan M.)</span>
                <span className="text-[10px] text-slate-600">Portal</span>
              </button>
            </div>
          )}
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center font-black text-xs shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrador'}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.email || 'admin@rentacasa.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
