import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const tickets = dataStore.getTickets(user);
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, propertyName, unitId, unitName, title, description, isCommonArea, priority, photos } = body;

    if (!title || !description || !propertyId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const ticket = dataStore.createTicket({
      propertyId,
      propertyName: propertyName || 'Inmueble',
      unitId,
      unitName,
      reportedById: user.id,
      reportedByName: user.name,
      reportedByPhone: user.phone,
      title,
      description,
      isCommonArea: !!isCommonArea,
      priority: priority || 'MEDIUM',
      photos: photos || [],
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al reportar avería' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { ticketId, status } = await req.json();
    const updated = dataStore.updateTicketStatus(ticketId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar ticket' }, { status: 500 });
  }
}
