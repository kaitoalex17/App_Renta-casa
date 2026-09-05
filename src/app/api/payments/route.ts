import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const payments = dataStore.getPayments(user);
  return NextResponse.json({ payments });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { paymentId, status, paymentMethod, notes } = await req.json();
    if (!paymentId || !status) {
      return NextResponse.json({ error: 'paymentId y status son requeridos' }, { status: 400 });
    }

    const updated = dataStore.updatePaymentStatus(paymentId, status, paymentMethod, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Recibo no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar recibo' }, { status: 500 });
  }
}
