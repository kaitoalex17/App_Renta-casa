import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const unit = dataStore.getUnitById(params.unitId);
    if (!unit) {
      return NextResponse.json({ error: 'Habitación o unidad no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      inventory: unit.inventory || [],
      photos: unit.photos || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al obtener inventario' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado para modificar inventario' }, { status: 403 });
    }

    const body = await req.json();

    // Caso 1: Añadir foto a la habitación
    if (body.action === 'ADD_PHOTO' && body.photoUrl) {
      dataStore.addUnitPhoto(params.unitId, body.photoUrl);
      const unit = dataStore.getUnitById(params.unitId);
      return NextResponse.json({ success: true, photos: unit?.photos || [] });
    }

    // Caso 2: Eliminar foto de la habitación
    if (body.action === 'REMOVE_PHOTO' && body.photoUrl) {
      dataStore.removeUnitPhoto(params.unitId, body.photoUrl);
      const unit = dataStore.getUnitById(params.unitId);
      return NextResponse.json({ success: true, photos: unit?.photos || [] });
    }

    // Caso 3: Añadir nuevo elemento al inventario
    const { name, quantity, condition, notes, photoUrl } = body;
    if (!name) {
      return NextResponse.json({ error: 'El nombre del elemento es obligatorio.' }, { status: 400 });
    }

    const newItem = dataStore.addInventoryItem(params.unitId, {
      name,
      quantity: parseInt(quantity, 10) || 1,
      condition: condition || 'Excelente estado',
      notes: notes || '',
      photoUrl: photoUrl || '',
    });

    if (!newItem) {
      return NextResponse.json({ error: 'Unidad no encontrada.' }, { status: 404 });
    }

    const unit = dataStore.getUnitById(params.unitId);
    return NextResponse.json({
      success: true,
      item: newItem,
      inventory: unit?.inventory || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al guardar elemento' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { itemId, name, quantity, condition, notes, photoUrl } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId es obligatorio.' }, { status: 400 });
    }

    const updated = dataStore.updateInventoryItem(params.unitId, itemId, {
      name,
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      condition,
      notes,
      photoUrl,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Elemento no encontrado.' }, { status: 404 });
    }

    const unit = dataStore.getUnitById(params.unitId);
    return NextResponse.json({
      success: true,
      item: updated,
      inventory: unit?.inventory || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar elemento' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { unitId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId es requerido como query param.' }, { status: 400 });
    }

    const success = dataStore.deleteInventoryItem(params.unitId, itemId);
    const unit = dataStore.getUnitById(params.unitId);

    return NextResponse.json({
      success,
      inventory: unit?.inventory || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar elemento' }, { status: 500 });
  }
}
