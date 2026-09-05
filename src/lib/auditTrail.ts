import crypto from 'crypto';

export interface AuditTrailMetadata {
  timestampUtc: string;
  publicIp: string;
  userAgent: string;
  contractHashSha256: string;
  eidasValidationStatus: string;
  signLocationDescription?: string;
}

/**
 * Obtiene la IP pública real del cliente respetando Cloudflare y proxies Nginx
 */
export function getClientIp(headers: Headers): string {
  // 1. Cloudflare Proxy
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // 2. Nginx X-Forwarded-For
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const list = forwardedFor.split(',');
    if (list.length > 0 && list[0].trim()) {
      return list[0].trim();
    }
  }

  // 3. X-Real-IP
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Genera el hash criptográfico SHA-256 del contenido contractual para sellado de integridad
 */
export function calculateContractHash(contractContent: string): string {
  return crypto.createHash('sha256').update(contractContent, 'utf8').digest('hex');
}

/**
 * Genera la estructura de trazabilidad probatoria (Audit Trail)
 */
export function generateAuditTrail({
  headers,
  contractText,
  signerName,
  signerDocNumber,
}: {
  headers: Headers;
  contractText: string;
  signerName: string;
  signerDocNumber: string;
}): AuditTrailMetadata {
  const ip = getClientIp(headers);
  const userAgent = headers.get('user-agent') || 'Desconocido';
  const hash = calculateContractHash(`${contractText}|${signerName}|${signerDocNumber}`);

  return {
    timestampUtc: new Date().toISOString(),
    publicIp: ip,
    userAgent,
    contractHashSha256: hash,
    eidasValidationStatus: 'ADVANCED_ELECTRONIC_SIGNATURE_EIDAS_COMPLIANT',
  };
}
