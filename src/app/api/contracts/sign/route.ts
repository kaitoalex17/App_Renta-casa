import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { generateAuditTrail } from '@/lib/auditTrail';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, signatureSvg, contractSummaryText } = body;

    if (!token || !signatureSvg) {
      return NextResponse.json({ error: 'Token de firma y rúbrica obligatorios.' }, { status: 400 });
    }

    const contract = dataStore.getContractByToken(token);
    if (!contract) {
      return NextResponse.json({ error: 'Contrato o token no encontrado.' }, { status: 404 });
    }

    if (contract.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Este contrato ya ha sido firmado anteriormente.' }, { status: 400 });
    }

    // Comprobar caducidad del enlace
    if (new Date(contract.magicTokenExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'El enlace de firma ha caducado. Solicite un nuevo enlace.' }, { status: 410 });
    }

    // Generar Audit Trail legal con IP de Cloudflare/Nginx y Hash SHA-256
    const auditTrail = generateAuditTrail({
      headers: req.headers,
      contractText: contractSummaryText || `${contract.id}-${contract.monthlyRent}-${contract.startDate}`,
      signerName: contract.tenantName,
      signerDocNumber: contract.tenantDocNumber,
    });

    const updated = dataStore.signContract(token, signatureSvg, auditTrail);

    return NextResponse.json({
      success: true,
      message: 'Contrato firmado con éxito y Audit Trail sellado.',
      contract: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al firmar contrato' }, { status: 500 });
  }
}
