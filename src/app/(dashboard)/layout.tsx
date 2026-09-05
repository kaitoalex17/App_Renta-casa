import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MobileBottomBar from '@/components/MobileBottomBar';
import { MobileNavProvider } from '@/context/MobileNavContext';

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const properties = dataStore.getProperties(user).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <MobileNavProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar deslizable en móvil / fija en desktop */}
        <Sidebar userRole={user.role} userName={user.name} />

        {/* Contenido principal con cabecera y barra táctil inferior */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header user={user} properties={properties} />

          {/* Área principal de contenido con padding inferior para la barra móvil */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 touch-scroll">
            {children}
          </main>

          {/* Barra de navegación inferior rápida táctil en móviles */}
          <MobileBottomBar userRole={user.role} />
        </div>
      </div>
    </MobileNavProvider>
  );
}
