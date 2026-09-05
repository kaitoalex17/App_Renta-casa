import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar userRole={user.role} userName={user.name} />

      {/* Contenido principal con cabecera */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={user} properties={properties} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
