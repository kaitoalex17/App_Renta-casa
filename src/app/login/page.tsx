'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building, Users, Wrench, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { Role } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (data.user.role === 'TENANT') {
        router.push('/portal/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLoginAs(role: Role) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleQuickSelect: role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (role === 'TENANT') {
        router.push('/portal/tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-slate-950 font-black text-2xl shadow-xl shadow-teal-500/20 mb-4">
          RC
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">RentaCasa</h1>
        <p className="mt-2 text-sm text-slate-400">
          Software de Gestión de Alquiler por Habitaciones & Media Temporada
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Quick Demo Role Switcher */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Acceso Rápido por Rol (Demostración en 1 Clic)
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickLoginAs('SUPERADMIN')}
                className="flex items-center gap-3 p-3 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 rounded-xl text-left transition group"
              >
                <div className="p-2 bg-purple-800/50 rounded-lg text-purple-300">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-200">Superadmin (Tú)</p>
                  <p className="text-[11px] text-slate-400">Control total y moderador</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('ADMIN')}
                className="flex items-center gap-3 p-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl text-left transition group"
              >
                <div className="p-2 bg-emerald-800/50 rounded-lg text-emerald-300">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-200">Admin (Dueño Principal)</p>
                  <p className="text-[11px] text-slate-400">Carlos Mendoza (sus pisos)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('CO_OWNER')}
                className="flex items-center gap-3 p-3 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 rounded-xl text-left transition group"
              >
                <div className="p-2 bg-blue-800/50 rounded-lg text-blue-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-200">Co-propietario (50%)</p>
                  <p className="text-[11px] text-slate-400">Laura Gómez (solo métricas)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('MANAGER')}
                className="flex items-center gap-3 p-3 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-xl text-left transition group"
              >
                <div className="p-2 bg-amber-800/50 rounded-lg text-amber-300">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-200">Gestor Operativo</p>
                  <p className="text-[11px] text-slate-400">Marcos Rivas (sin fiscal)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('TENANT')}
                className="sm:col-span-2 flex items-center gap-3 p-3 bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/60 rounded-xl text-left transition group"
              >
                <div className="p-2 bg-teal-800/50 rounded-lg text-teal-300">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-teal-200">Portal Inquilino (Juan M. - Habitación 1)</p>
                  <p className="text-[11px] text-slate-400">Acceso ligero para consultar contrato, suministros y averías</p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-400 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold">O iniciar sesión con email</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">Correo Electrónico</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="propietario@rentacasa.com"
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Contraseña</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
