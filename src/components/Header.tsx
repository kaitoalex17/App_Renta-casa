'use client';

import { useState } from 'react';
import { Bell, Shield, Users, ChevronDown } from 'lucide-react';
import { Role, UserSession } from '@/types';

interface HeaderProps {
  user: UserSession | null;
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  properties?: { id: string; name: string }[];
}

export default function Header({ user, selectedPropertyId, onSelectProperty, properties = [] }: HeaderProps) {
  const [switchingRole, setSwitchingRole] = useState(false);

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
      {/* Property Selector */}
      <div className="flex items-center gap-4">
        {properties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inmueble:</span>
            <select
              value={selectedPropertyId || 'ALL'}
              onChange={(e) => onSelectProperty && onSelectProperty(e.target.value)}
              className="text-sm font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            >
              <option value="ALL">Todos los Inmuebles ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right controls: Demo Switcher + Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Role Tester Selector */}
        <div className="relative">
          <button
            onClick={() => setSwitchingRole(!switchingRole)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition"
            title="Cambiar rápidamente de rol para probar permisos"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>Simulador de Rol:</span>
            <span className="font-bold underline">{user?.role || 'ADMIN'}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {switchingRole && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Cambiar Rol en 1 Clic
              </div>
              <button
                onClick={() => { quickSwitchRole('SUPERADMIN'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-purple-900 font-medium"
              >
                <span>👑 Superadmin (Tú)</span>
                <span className="text-[10px] text-purple-600">Control total</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('ADMIN'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-emerald-900 font-medium"
              >
                <span>🏢 Admin (Dueño Principal)</span>
                <span className="text-[10px] text-emerald-600">Sus pisos</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('CO_OWNER'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-blue-900 font-medium"
              >
                <span>🤝 Co-propietario (50%)</span>
                <span className="text-[10px] text-blue-600">Solo métricas</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('MANAGER'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-amber-900 font-medium"
              >
                <span>🔧 Gestor / Operador</span>
                <span className="text-[10px] text-amber-600">Sin datos fiscales</span>
              </button>
              <button
                onClick={() => { quickSwitchRole('TENANT'); setSwitchingRole(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-900 font-medium"
              >
                <span>👤 Inquilino (Juan M.)</span>
                <span className="text-[10px] text-slate-600">Solo su habitación</span>
              </button>
            </div>
          )}
        </div>

        {/* User Identity Avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Administrador'}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.email || 'admin@rentacasa.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
