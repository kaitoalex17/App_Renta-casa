'use client';

import { Printer } from 'lucide-react';

export default function PrintButton({ label = 'Imprimir / Guardar PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') window.print();
      }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
