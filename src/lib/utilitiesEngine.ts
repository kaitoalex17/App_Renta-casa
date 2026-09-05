import { differenceInDays, max, min } from 'date-fns';

export interface RoomOccupancy {
  unitId: string;
  unitName: string;
  contractId: string;
  tenantName: string;
  utilityCap: number; // e.g. 35.0 €
  occupancyStart: Date;
  occupancyEnd: Date;
}

export interface ProrationResult {
  unitId: string;
  unitName: string;
  contractId: string;
  tenantName: string;
  daysActiveInPeriod: number;
  totalPeriodDays: number;
  baseCap: number;
  effectiveCap: number;
  excessShare: number;
  totalCharged: number;
  calculationExplanation: string;
}

export interface UtilityCalculationSummary {
  propertyType: 'ROOMS' | 'APARTMENT';
  totalInvoiceAmount: number;
  totalPeriodDays: number;
  totalOccupantDays: number;
  totalCapsPooled: number;
  totalExcessOverCap: number;
  results: ProrationResult[];
}

/**
 * Calcula los días de solapamiento entre dos rangos de fechas (inclusivo)
 */
export function getDaysOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): number {
  const latestStart = max([startA, startB]);
  const earliestEnd = min([endA, endB]);

  const diff = differenceInDays(earliestEnd, latestStart) + 1;
  return diff > 0 ? diff : 0;
}

/**
 * Motor de prorrateo para apartamentos independientes (repercusión directa por días)
 */
export function calculateApartmentUtility({
  totalInvoiceAmount,
  periodStart,
  periodEnd,
  tenantStart,
  tenantEnd,
  unitName,
  contractId,
  tenantName,
}: {
  totalInvoiceAmount: number;
  periodStart: Date;
  periodEnd: Date;
  tenantStart: Date;
  tenantEnd: Date;
  unitName: string;
  contractId: string;
  tenantName: string;
}): UtilityCalculationSummary {
  const totalPeriodDays = differenceInDays(periodEnd, periodStart) + 1;
  const daysActive = getDaysOverlap(periodStart, periodEnd, tenantStart, tenantEnd);

  const costPerDay = totalPeriodDays > 0 ? totalInvoiceAmount / totalPeriodDays : 0;
  const totalCharged = Math.round(costPerDay * daysActive * 100) / 100;

  const result: ProrationResult = {
    unitId: 'apt',
    unitName,
    contractId,
    tenantName,
    daysActiveInPeriod: daysActive,
    totalPeriodDays,
    baseCap: 0,
    effectiveCap: 0,
    excessShare: totalCharged,
    totalCharged,
    calculationExplanation:
      daysActive === totalPeriodDays
        ? `Factura completa asignada: ${totalInvoiceAmount.toFixed(2)} € (${totalPeriodDays} días).`
        : `Prorrateado por días: ${totalInvoiceAmount.toFixed(2)} € / ${totalPeriodDays} días = ${costPerDay.toFixed(2)} €/día x ${daysActive} días activos = ${totalCharged.toFixed(2)} €.`,
  };

  return {
    propertyType: 'APARTMENT',
    totalInvoiceAmount,
    totalPeriodDays,
    totalOccupantDays: daysActive,
    totalCapsPooled: 0,
    totalExcessOverCap: totalCharged,
    results: [result],
  };
}

/**
 * Motor de reparto para habitaciones compartidas con bolsa de topes incluidos (ej. 35€/mes)
 * Si la factura supera la bolsa sumada de las habitaciones ocupadas, el exceso se reparte proporcionalmente.
 */
export function calculateRoomsUtilityPooled({
  totalInvoiceAmount,
  periodStart,
  periodEnd,
  rooms,
}: {
  totalInvoiceAmount: number;
  periodStart: Date;
  periodEnd: Date;
  rooms: RoomOccupancy[];
}): UtilityCalculationSummary {
  const totalPeriodDays = differenceInDays(periodEnd, periodStart) + 1;

  // 1. Calcular días activos y bolsa de topes de cada habitación
  let totalOccupantDays = 0;
  let totalCapsPooled = 0;

  const activeRooms = rooms.map((room) => {
    const daysActive = getDaysOverlap(periodStart, periodEnd, room.occupancyStart, room.occupancyEnd);
    const dayRatio = totalPeriodDays > 0 ? daysActive / totalPeriodDays : 0;
    const effectiveCap = Math.round(room.utilityCap * dayRatio * 100) / 100;

    totalOccupantDays += daysActive;
    totalCapsPooled += effectiveCap;

    return {
      ...room,
      daysActive,
      effectiveCap,
    };
  });

  // 2. Determinar si hay exceso sobre la bolsa total
  const excess = totalInvoiceAmount - totalCapsPooled;
  const totalExcessOverCap = excess > 0 ? Math.round(excess * 100) / 100 : 0;

  // 3. Repartir el exceso proporcionalmente a los días ocupados
  const results: ProrationResult[] = activeRooms.map((room) => {
    if (room.daysActive === 0) {
      return {
        unitId: room.unitId,
        unitName: room.unitName,
        contractId: room.contractId,
        tenantName: room.tenantName,
        daysActiveInPeriod: 0,
        totalPeriodDays,
        baseCap: room.utilityCap,
        effectiveCap: 0,
        excessShare: 0,
        totalCharged: 0,
        calculationExplanation: 'Sin estancia durante el periodo facturado.',
      };
    }

    if (totalExcessOverCap === 0) {
      return {
        unitId: room.unitId,
        unitName: room.unitName,
        contractId: room.contractId,
        tenantName: room.tenantName,
        daysActiveInPeriod: room.daysActive,
        totalPeriodDays,
        baseCap: room.utilityCap,
        effectiveCap: room.effectiveCap,
        excessShare: 0,
        totalCharged: 0,
        calculationExplanation: `Dentro del tope incluido (${room.effectiveCap.toFixed(2)} € para ${room.daysActive} días). Factura no superó la bolsa común.`,
      };
    }

    // Reparto del exceso ponderado por días ocupados
    const shareRatio = totalOccupantDays > 0 ? room.daysActive / totalOccupantDays : 0;
    const excessShare = Math.round(totalExcessOverCap * shareRatio * 100) / 100;

    return {
      unitId: room.unitId,
      unitName: room.unitName,
      contractId: room.contractId,
      tenantName: room.tenantName,
      daysActiveInPeriod: room.daysActive,
      totalPeriodDays,
      baseCap: room.utilityCap,
      effectiveCap: room.effectiveCap,
      excessShare,
      totalCharged: excessShare,
      calculationExplanation: `Tope incluido: ${room.effectiveCap.toFixed(2)} €. Exceso de la bolsa global (${totalExcessOverCap.toFixed(2)} €) repartido al ${(shareRatio * 100).toFixed(1)}% (${room.daysActive}/${totalOccupantDays} días ocupados) = +${excessShare.toFixed(2)} €.`,
    };
  });

  return {
    propertyType: 'ROOMS',
    totalInvoiceAmount,
    totalPeriodDays,
    totalOccupantDays,
    totalCapsPooled: Math.round(totalCapsPooled * 100) / 100,
    totalExcessOverCap,
    results,
  };
}
