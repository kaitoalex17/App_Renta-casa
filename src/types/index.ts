export type Role = 'SUPERADMIN' | 'ADMIN' | 'CO_OWNER' | 'MANAGER' | 'TENANT';

export type UnitType = 'ROOM' | 'APARTMENT';

export type UnitStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export type TemporalCauseType = 'STUDIES' | 'WORK_CONTRACT' | 'DIGITAL_NOMAD' | 'MEDICAL' | 'OTHER';

export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'FINISHED' | 'TERMINATED_EARLY';

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type PaymentMethod = 'TRANSFER' | 'BIZUM' | 'CASH' | 'CARD';

export type DepositStatus = 'HELD' | 'SETTLING' | 'RETURNED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus = 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED';

export type NoticeUrgency = 'INFO' | 'IMPORTANT' | 'LEGAL_WARNING';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

export interface InventoryItemData {
  id: string;
  name: string;
  quantity: number;
  condition: string;
  isCommonArea?: boolean;
  verifiedByTenant?: boolean;
  tenantNotes?: string;
  photoUrl?: string;
}

export interface FixedExpenseData {
  id: string;
  concept: string;
  amount: number;
  frequency: 'MONTHLY' | 'BI_MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  notes?: string;
}

export interface CoOwnerData {
  userId: string;
  userName: string;
  userEmail: string;
  percentage: number;
}

export interface UnitData {
  id: string;
  propertyId: string;
  propertyName?: string;
  name: string;
  type: UnitType;
  surfaceArea?: number;
  bedType?: string;
  hasDesk: boolean;
  privateBathroom: boolean;
  baseRent: number;
  depositAmount: number;
  utilityCap: number; // e.g. 35€/mo for rooms
  electricMeterNumber?: string;
  status: UnitStatus;
  notes?: string;
  currentContract?: {
    id: string;
    tenantName: string;
    tenantPhone?: string;
    startDate: string;
    endDate: string;
  };
  inventory?: InventoryItemData[];
}

export interface PropertyData {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  cadastralRef?: string;
  energyRating?: string;
  energyCertUrl?: string;
  commonAreas?: string;
  generalRules?: string;
  wifiName?: string;
  wifiPassword?: string;
  ownerId: string;
  ownerName?: string;
  coOwners: CoOwnerData[];
  fixedExpenses: FixedExpenseData[];
  units: UnitData[];
}

export interface ContractData {
  id: string;
  unitId: string;
  unitName: string;
  propertyId: string;
  propertyName: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone?: string;
  tenantDocType: string;
  tenantDocNumber: string;
  tenantPermanentCity: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  utilityCap: number;
  temporalCauseType: TemporalCauseType;
  temporalCauseDetail?: string;
  temporalCauseDocUrl?: string;
  status: ContractStatus;
  magicToken: string;
  magicTokenExpiresAt: string;
  signedAt?: string;
  signerIp?: string;
  signerUserAgent?: string;
  signatureSvg?: string;
  auditTrail?: {
    timestampUtc: string;
    publicIp: string;
    userAgent: string;
    contractHashSha256: string;
    eidasValidationStatus: string;
  };
  inventoryVerifiedAt?: string;
  keyDeliveryDate?: string;
  deposit?: {
    id: string;
    amountHeld: number;
    regionalDepositRef?: string;
    status: DepositStatus;
    returnedAmount?: number;
  };
}

export interface PaymentReceiptData {
  id: string;
  contractId: string;
  tenantId: string;
  tenantName: string;
  tenantPhone?: string;
  propertyName: string;
  unitName: string;
  month: number;
  year: number;
  rentAmount: number;
  utilitiesAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface UtilityBillData {
  id: string;
  propertyId: string;
  propertyName: string;
  type: 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET';
  invoiceNumber?: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  invoicePdfUrl?: string;
  charges: {
    contractId: string;
    tenantName: string;
    unitName: string;
    proratedDays: number;
    amountCharged: number;
    calculationDetail?: string;
  }[];
}

export interface MaintenanceTicketData {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitName?: string;
  reportedById: string;
  reportedByName: string;
  reportedByPhone?: string;
  title: string;
  description: string;
  isCommonArea: boolean;
  priority: TicketPriority;
  status: TicketStatus;
  photos: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface FormalNoticeData {
  id: string;
  propertyId: string;
  propertyName: string;
  senderName: string;
  title: string;
  message: string;
  urgencyLevel: NoticeUrgency;
  createdAt: string;
  reads: {
    tenantId: string;
    tenantName: string;
    readAt: string;
    readerIp?: string;
  }[];
}
