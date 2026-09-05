'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface MobileNavContextType {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  mobileNavOpen: false,
  setMobileNavOpen: () => {},
  toggleMobileNav: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el cajón automáticamente cuando el usuario navega a otra ruta
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Prevenir scroll en el fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  return (
    <MobileNavContext.Provider
      value={{
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav: () => setMobileNavOpen((prev) => !prev),
      }}
    >
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return useContext(MobileNavContext);
}
