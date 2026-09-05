import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const contracts = dataStore.getContracts(user);
  return NextResponse.json({ contracts });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado para redactar contratos' }, { status: 403 });
    }

    const body = await req.json();
    const {
      unitId,
      unitName,
      propertyId,
      propertyName,
      tenantName,
      tenantEmail,
      tenantPhone,
      tenantDocType,
      tenantDocNumber,
      tenantPermanentCity,
      startDate,
      endDate,
      monthlyRent,
      depositAmount,
      utilityCap,
      temporalCauseType,
      temporalCauseDetail,
      temporalCauseDocUrl,
    } = body;

    // Validación obligatoria de causa de temporalidad (LAU Art. 3)
    if (!temporalCauseType || !temporalCauseDetail) {
      return NextResponse.json(
        { error: 'La Causa de Temporalidad y su detalle son obligatorios por ley (LAU Art. 3).' },
        { status: 400 }
      );
    }

    if (!tenantName || !tenantDocNumber || !tenantPermanentCity) {
      return NextResponse.json(
        { error: 'Datos de identidad y domicilio permanente del inquilino incompletos.' },
        { status: 400 }
      );
    }

    // Buscar o crear usuario inquilino
    let tenantUser = dataStore.getUserByEmail(tenantEmail);
    const tenantId = tenantUser ? tenantUser.id : `usr_t_${Date.now()}`;

    const newContract = dataStore.createContract({
      unitId,
      unitName,
      propertyId,
      propertyName,
      tenantId,
      tenantName,
      tenantEmail,
      tenantPhone,
      tenantDocType: tenantDocType || 'DNI',
      tenantDocNumber,
      tenantPermanentCity,
      startDate,
      endDate,
      monthlyRent: parseFloat(monthlyRent),
      depositAmount: parseFloat(depositAmount),
      utilityCap: parseFloat(utilityCap || '35.0'),
      temporalCauseType,
      temporalCauseDetail,
      temporalCauseDocUrl,
      deposit: {
        id: `dep_${Date.now()}`,
        amountHeld: parseFloat(depositAmount),
        status: 'HELD',
      },
    });

    return NextResponse.json({ success: true, contract: newContract });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al crear contrato' }, { status: 500 });
  }
}
