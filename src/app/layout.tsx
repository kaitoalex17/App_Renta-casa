import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RentaCasa | Gestión Coliving & Media Temporada',
  description: 'Plataforma para gestión de alquiler por habitaciones, apartamentos, contratos LAU Art. 3 y suministros',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
