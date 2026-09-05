import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import {
  calculateApartmentUtility,
  calculateRoomsUtilityPooled,
  RoomOccupancy,
} from '@/lib/utilitiesEngine';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const {
      propertyId,
      utilityType,
      invoiceNumber,
      periodStart,
      periodEnd,
      totalAmount,
      applyToReceipts,
    } = body;

    const property = dataStore.getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Inmueble no encontrado' }, { status: 404 });
    }

    const billStart = new Date(periodStart);
    const billEnd = new Date(periodEnd);
    const amount = parseFloat(totalAmount);

    const isApartment = property.units.some((u) => u.type === 'APARTMENT');

    let calculationResult;

    if (isApartment) {
      const aptUnit = property.units.find((u) => u.type === 'APARTMENT')!;
      const contract = dataStore.getContracts().find(
        (c) => c.unitId === aptUnit.id && c.status === 'ACTIVE'
      );

      const tenantStart = contract ? new Date(contract.startDate) : billStart;
      const tenantEnd = contract ? new Date(contract.endDate) : billEnd;

      calculationResult = calculateApartmentUtility({
        totalInvoiceAmount: amount,
        periodStart: billStart,
        periodEnd: billEnd,
        tenantStart,
        tenantEnd,
        unitName: aptUnit.name,
        contractId: contract ? contract.id : 'sin_contrato',
        tenantName: contract ? contract.tenantName : 'Sin inquilino asignado',
      });
    } else {
      // Habitaciones de Coliving (Modelo Mixto con Bolsa de Topes)
      const contracts = dataStore.getContracts().filter(
        (c) => c.propertyId === propertyId && c.status === 'ACTIVE'
      );

      const rooms: RoomOccupancy[] = contracts.map((c) => ({
        unitId: c.unitId,
        unitName: c.unitName,
        contractId: c.id,
        tenantName: c.tenantName,
        utilityCap: c.utilityCap || 35.0,
        occupancyStart: new Date(c.startDate),
        occupancyEnd: new Date(c.endDate),
      }));

      calculationResult = calculateRoomsUtilityPooled({
        totalInvoiceAmount: amount,
        periodStart: billStart,
        periodEnd: billEnd,
        rooms,
      });
    }

    // Si el usuario eligió "applyToReceipts", guardamos la factura en el sistema
    if (applyToReceipts) {
      dataStore.addUtilityBill({
        id: `bill_${Date.now()}`,
        propertyId,
        propertyName: property.name,
        type: utilityType || 'ELECTRICITY',
        invoiceNumber: invoiceNumber || `FAC-${Date.now().toString().slice(-6)}`,
        periodStart,
        periodEnd,
        totalAmount: amount,
        charges: calculationResult.results.map((r) => ({
          contractId: r.contractId,
          tenantName: r.tenantName,
          unitName: r.unitName,
          proratedDays: r.daysActiveInPeriod,
          amountCharged: r.totalCharged,
          calculationDetail: r.calculationExplanation,
        })),
      });
    }

    return NextResponse.json({ success: true, calculation: calculationResult });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en el cálculo' }, { status: 500 });
  }
}
