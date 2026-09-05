import {
  INITIAL_PROPERTIES,
  INITIAL_CONTRACTS,
  INITIAL_PAYMENTS,
  INITIAL_UTILITY_BILLS,
  INITIAL_TICKETS,
  INITIAL_NOTICES,
  INITIAL_USERS,
} from './mockData';
import {
  PropertyData,
  ContractData,
  PaymentReceiptData,
  UtilityBillData,
  MaintenanceTicketData,
  FormalNoticeData,
  UserSession,
  UnitData,
} from '@/types';

// Almacén en memoria persistente en el ciclo de vida del servidor de Node
class DataStore {
  private properties: PropertyData[] = JSON.parse(JSON.stringify(INITIAL_PROPERTIES));
  private contracts: ContractData[] = JSON.parse(JSON.stringify(INITIAL_CONTRACTS));
  private payments: PaymentReceiptData[] = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
  private utilityBills: UtilityBillData[] = JSON.parse(JSON.stringify(INITIAL_UTILITY_BILLS));
  private tickets: MaintenanceTicketData[] = JSON.parse(JSON.stringify(INITIAL_TICKETS));
  private notices: FormalNoticeData[] = JSON.parse(JSON.stringify(INITIAL_NOTICES));
  private users = JSON.parse(JSON.stringify(INITIAL_USERS));

  // --- Usuarios y Autenticación ---
  getUsers() {
    return this.users;
  }

  getUserByEmail(email: string) {
    return this.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string) {
    return this.users.find((u: any) => u.id === id);
  }

  // --- Inmuebles & Permisos Granulares ---
  getProperties(user?: UserSession): PropertyData[] {
    if (!user || user.role === 'SUPERADMIN') {
      return this.properties;
    }
    if (user.role === 'ADMIN') {
      return this.properties.filter((p) => p.ownerId === user.id);
    }
    if (user.role === 'CO_OWNER') {
      return this.properties.filter((p) => p.coOwners.some((co) => co.userId === user.id));
    }
    if (user.role === 'MANAGER') {
      // Gestor ve los inmuebles que administra (por defecto todos los del dueño o asignados)
      return this.properties;
    }
    if (user.role === 'TENANT') {
      const activeContract = this.contracts.find((c) => c.tenantId === user.id);
      if (!activeContract) return [];
      return this.properties.filter((p) => p.id === activeContract.propertyId);
    }
    return [];
  }

  getPropertyById(id: string, user?: UserSession): PropertyData | undefined {
    const properties = this.getProperties(user);
    return properties.find((p) => p.id === id);
  }

  createProperty(data: Omit<PropertyData, 'id' | 'units'>, ownerId: string): PropertyData {
    const newProperty: PropertyData = {
      ...data,
      id: `prop_${Date.now()}`,
      ownerId,
      units: [],
    };
    this.properties.unshift(newProperty);
    return newProperty;
  }

  updateProperty(id: string, updates: Partial<PropertyData>): PropertyData | null {
    const index = this.properties.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.properties[index] = { ...this.properties[index], ...updates };
    return this.properties[index];
  }

  // --- Unidades (Habitaciones / Apartamentos) ---
  getUnits(propertyId?: string): UnitData[] {
    if (propertyId) {
      const prop = this.properties.find((p) => p.id === propertyId);
      return prop ? prop.units : [];
    }
    return this.properties.flatMap((p) => p.units);
  }

  createUnit(propertyId: string, unitData: Omit<UnitData, 'id' | 'propertyId'>): UnitData | null {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return null;

    const newUnit: UnitData = {
      ...unitData,
      id: `unit_${Date.now()}`,
      propertyId,
      propertyName: prop.name,
    };
    prop.units.push(newUnit);
    return newUnit;
  }

  updateUnit(unitId: string, updates: Partial<UnitData>): UnitData | null {
    for (const prop of this.properties) {
      const uIndex = prop.units.findIndex((u) => u.id === unitId);
      if (uIndex !== -1) {
        prop.units[uIndex] = { ...prop.units[uIndex], ...updates };
        return prop.units[uIndex];
      }
    }
    return null;
  }

  // --- Contratos LAU Art. 3 ---
  getContracts(user?: UserSession): ContractData[] {
    if (!user || user.role === 'SUPERADMIN') {
      return this.contracts;
    }
    if (user.role === 'ADMIN') {
      const myPropertyIds = this.properties.filter((p) => p.ownerId === user.id).map((p) => p.id);
      return this.contracts.filter((c) => myPropertyIds.includes(c.propertyId));
    }
    if (user.role === 'CO_OWNER') {
      const coPropertyIds = this.properties
        .filter((p) => p.coOwners.some((co) => co.userId === user.id))
        .map((p) => p.id);
      return this.contracts.filter((c) => coPropertyIds.includes(c.propertyId));
    }
    if (user.role === 'TENANT') {
      return this.contracts.filter((c) => c.tenantId === user.id);
    }
    return this.contracts;
  }

  getContractById(id: string): ContractData | undefined {
    return this.contracts.find((c) => c.id === id);
  }

  getContractByToken(token: string): ContractData | undefined {
    return this.contracts.find((c) => c.magicToken === token);
  }

  createContract(data: Omit<ContractData, 'id' | 'magicToken' | 'magicTokenExpiresAt' | 'status'>): ContractData {
    const token = `token_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    const newContract: ContractData = {
      ...data,
      id: `ct_${Date.now()}`,
      status: 'PENDING_SIGNATURE',
      magicToken: token,
      magicTokenExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    // Actualizar estado de la unidad a RESERVADA
    this.updateUnit(data.unitId, { status: 'RESERVED' });
    this.contracts.unshift(newContract);
    return newContract;
  }

  signContract(
    token: string,
    signatureSvg: string,
    auditTrail: ContractData['auditTrail']
  ): ContractData | null {
    const contract = this.getContractByToken(token);
    if (!contract) return null;

    contract.status = 'ACTIVE';
    contract.signedAt = new Date().toISOString();
    contract.signatureSvg = signatureSvg;
    contract.auditTrail = auditTrail;

    // Actualizar estado de la unidad a OCUPADA
    this.updateUnit(contract.unitId, {
      status: 'OCCUPIED',
      currentContract: {
        id: contract.id,
        tenantName: contract.tenantName,
        tenantPhone: contract.tenantPhone,
        startDate: contract.startDate,
        endDate: contract.endDate,
      },
    });

    return contract;
  }

  // --- Pagos y Cobros Semáforo ---
  getPayments(user?: UserSession): PaymentReceiptData[] {
    const allowedContracts = this.getContracts(user).map((c) => c.id);
    return this.payments.filter((p) => allowedContracts.includes(p.contractId));
  }

  updatePaymentStatus(
    paymentId: string,
    status: PaymentReceiptData['status'],
    paymentMethod?: PaymentReceiptData['paymentMethod'],
    notes?: string
  ): PaymentReceiptData | null {
    const p = this.payments.find((pay) => pay.id === paymentId);
    if (!p) return null;
    p.status = status;
    if (status === 'PAID') {
      p.paymentDate = new Date().toISOString().split('T')[0];
      if (paymentMethod) p.paymentMethod = paymentMethod;
    }
    if (notes) p.notes = notes;
    return p;
  }

  // --- Suministros ---
  getUtilityBills(propertyId?: string): UtilityBillData[] {
    if (propertyId) {
      return this.utilityBills.filter((b) => b.propertyId === propertyId);
    }
    return this.utilityBills;
  }

  addUtilityBill(billData: UtilityBillData) {
    this.utilityBills.unshift(billData);
    return billData;
  }

  // --- Incidencias ---
  getTickets(user?: UserSession): MaintenanceTicketData[] {
    if (!user || user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.role === 'MANAGER') {
      return this.tickets;
    }
    if (user.role === 'TENANT') {
      return this.tickets.filter((t) => t.reportedById === user.id || t.isCommonArea);
    }
    return this.tickets;
  }

  createTicket(ticket: Omit<MaintenanceTicketData, 'id' | 'createdAt' | 'status'>): MaintenanceTicketData {
    const newTicket: MaintenanceTicketData = {
      ...ticket,
      id: `tkt_${Date.now()}`,
      status: 'REPORTED',
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }

  updateTicketStatus(id: string, status: MaintenanceTicketData['status']): MaintenanceTicketData | null {
    const t = this.tickets.find((tick) => tick.id === id);
    if (!t) return null;
    t.status = status;
    if (status === 'RESOLVED') {
      t.resolvedAt = new Date().toISOString();
    }
    return t;
  }

  // --- Avisos Formales ---
  getNotices(propertyId?: string): FormalNoticeData[] {
    if (propertyId) {
      return this.notices.filter((n) => n.propertyId === propertyId);
    }
    return this.notices;
  }

  createNotice(notice: Omit<FormalNoticeData, 'id' | 'createdAt' | 'reads'>): FormalNoticeData {
    const newNotice: FormalNoticeData = {
      ...notice,
      id: `not_${Date.now()}`,
      createdAt: new Date().toISOString(),
      reads: [],
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  markNoticeRead(
    noticeId: string,
    tenantId: string,
    tenantName: string,
    readerIp: string
  ): FormalNoticeData | null {
    const n = this.notices.find((not) => not.id === noticeId);
    if (!n) return null;
    const existing = n.reads.find((r) => r.tenantId === tenantId);
    if (!existing) {
      n.reads.push({
        tenantId,
        tenantName,
        readAt: new Date().toISOString(),
        readerIp,
      });
    }
    return n;
  }
}

// Exportar singleton
export const dataStore = new DataStore();
