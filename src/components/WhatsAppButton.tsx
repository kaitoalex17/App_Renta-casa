'use client';

import { MessageSquareShare } from 'lucide-react';

interface WhatsAppButtonProps {
  phone?: string;
  tenantName: string;
  unitName: string;
  amount?: number;
  type?: 'PAYMENT_REMINDER' | 'SIGN_CONTRACT' | 'MAINTENANCE_UPDATE';
  contractUrl?: string;
  className?: string;
}

export default function WhatsAppButton({
  phone = '34600000000',
  tenantName,
  unitName,
  amount,
  type = 'PAYMENT_REMINDER',
  contractUrl,
  className = '',
}: WhatsAppButtonProps) {
  // Limpiar caracteres no numéricos del teléfono
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  let message = '';
  if (type === 'PAYMENT_REMINDER') {
    message = `Hola ${tenantName}, te recordamos desde la administración que el recibo de ${unitName}${
      amount ? ` por importe de ${amount.toFixed(2)} €` : ''
    } correspondiente a este mes se encuentra pendiente. Por favor, remítenos el comprobante cuando realices la transferencia o Bizum. ¡Muchas gracias!`;
  } else if (type === 'SIGN_CONTRACT') {
    message = `Hola ${tenantName}, tu contrato de media temporada para ${unitName} ya está listo para firma digital móvil. Puedes revisarlo y firmarlo desde tu móvil aquí: ${contractUrl}`;
  } else {
    message = `Hola ${tenantName}, te contactamos en relación a la incidencia reportada en ${unitName}.`;
  }

  const encodedUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={encodedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition ${className}`}
      title="Enviar aviso pre-redactado por WhatsApp"
    >
      <MessageSquareShare className="w-3.5 h-3.5" />
      <span>Aviso WhatsApp</span>
    </a>
  );
}
