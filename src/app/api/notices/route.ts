import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import { getClientIp } from '@/lib/auditTrail';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId') || undefined;

  const notices = dataStore.getNotices(propertyId);
  return NextResponse.json({ notices });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado para emitir avisos oficiales' }, { status: 403 });
    }

    const body = await req.json();
    const { propertyId, propertyName, title, message, urgencyLevel } = body;

    if (!propertyId || !title || !message) {
      return NextResponse.json({ error: 'Inmueble, título y mensaje requeridos' }, { status: 400 });
    }

    const notice = dataStore.createNotice({
      propertyId,
      propertyName: propertyName || 'Inmueble',
      senderName: user.name,
      title,
      message,
      urgencyLevel: urgencyLevel || 'INFO',
    });

    return NextResponse.json({ success: true, notice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al emitir aviso' }, { status: 500 });
  }
}

// Confirmar lectura fehaciente (con acuse de recibo e IP)
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { noticeId } = await req.json();
    const clientIp = getClientIp(req.headers);

    const updated = dataStore.markNoticeRead(noticeId, user.id, user.name, clientIp);
    return NextResponse.json({ success: true, notice: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al registrar lectura' }, { status: 500 });
  }
}
