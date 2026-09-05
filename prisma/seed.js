const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('==> Iniciando carga de datos de prueba (Málaga - Andalucía)...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Usuarios principales
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@rentacasa.com' },
    update: {},
    create: {
      name: 'Alejandro (Superadmin Plataforma)',
      email: 'superadmin@rentacasa.com',
      passwordHash,
      phone: '+34600111222',
      role: 'SUPERADMIN',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'propietario@rentacasa.com' },
    update: {},
    create: {
      name: 'Carlos Mendoza (Dueño Principal)',
      email: 'propietario@rentacasa.com',
      passwordHash,
      phone: '+34611223344',
      role: 'ADMIN',
    },
  });

  const coOwner = await prisma.user.upsert({
    where: { email: 'socio@rentacasa.com' },
    update: {},
    create: {
      name: 'Laura Gómez (Socia Inversora 50%)',
      email: 'socio@rentacasa.com',
      passwordHash,
      phone: '+34622334455',
      role: 'CO_OWNER',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gestor@rentacasa.com' },
    update: {},
    create: {
      name: 'Marcos Rivas (Property Manager Málaga)',
      email: 'gestor@rentacasa.com',
      passwordHash,
      phone: '+34633445566',
      role: 'MANAGER',
    },
  });

  const tenant1 = await prisma.user.upsert({
    where: { email: 'juan.estudiante@rentacasa.com' },
    update: {},
    create: {
      name: 'Juan Martínez',
      email: 'juan.estudiante@rentacasa.com',
      passwordHash,
      phone: '+34644556677',
      role: 'TENANT',
      tenantProfile: {
        create: {
          idDocumentType: 'DNI',
          idDocumentNumber: '48923145X',
          permanentAddress: 'Calle San Fernando 14, Sevilla',
          emergencyContactName: 'María Martínez (Madre)',
          emergencyContactPhone: '+34655667788',
        },
      },
    },
  });

  const tenant2 = await prisma.user.upsert({
    where: { email: 'elena.temporal@rentacasa.com' },
    update: {},
    create: {
      name: 'Elena Santos',
      email: 'elena.temporal@rentacasa.com',
      passwordHash,
      phone: '+34666778899',
      role: 'TENANT',
      tenantProfile: {
        create: {
          idDocumentType: 'DNI',
          idDocumentNumber: '53112233Y',
          permanentAddress: 'Avenida de la Libertad 8, Valencia',
          emergencyContactName: 'Pedro Santos (Padre)',
          emergencyContactPhone: '+34677889900',
        },
      },
    },
  });

  // 2. Propiedad 1: Coliving Teatinos Universidad (Piso de 4 habitaciones en Málaga)
  const colivingProperty = await prisma.property.create({
    data: {
      name: 'Coliving Teatinos Universidad',
      address: 'Avenida Plutarco 32, 2º B',
      city: 'Málaga',
      postalCode: '29010',
      cadastralRef: '9823412UF7692C0001TR',
      energyRating: 'B',
      energyCertUrl: 'https://ejemplo.com/cee-teatinos.pdf',
      commonAreas: 'Cocina de diseño equipada (2 frigoríficos combi, microondas, horno, lavavajillas), 2 baños completos con plato de ducha, zona comedor/salón y cuarto de lavandería con lavadora y secadora.',
      generalRules: 'Silencio riguroso de 23:00 a 08:00 h. Prohibido fumar en todo el inmueble. No se admiten mascotas ni celebración de fiestas. Las visitas no pueden pernoctar más de 2 noches consecutivas sin autorización expresa.',
      wifiName: 'Teatinos_Coliving_5G',
      wifiPassword: 'MalagaFibra2025!',
      ownerId: owner.id,
      coOwners: {
        create: [
          { userId: coOwner.id, percentage: 50.0 },
        ],
      },
      managers: {
        create: [
          { userId: manager.id },
        ],
      },
      fixedExpenses: {
        create: [
          { concept: 'Comunidad de Propietarios', amount: 85.0, frequency: 'MONTHLY' },
          { concept: 'IBI Ayuntamiento de Málaga', amount: 520.0, frequency: 'ANNUAL' },
          { concept: 'Seguro de Hogar e Impago', amount: 340.0, frequency: 'ANNUAL' },
          { concept: 'Fibra Óptica 1Gb Simétrica', amount: 39.99, frequency: 'MONTHLY' },
          { concept: 'Servicio de Limpieza Zonas Comunes (Semanal)', amount: 150.0, frequency: 'MONTHLY' },
        ],
      },
      cleaningSchedules: {
        create: [
          { dayOfWeek: 'Martes y Viernes', timeSlot: '10:00 - 13:00', staffName: 'Limpiezas Costa del Sol (Málaga)', notes: 'Limpieza a fondo de baños, cocina y aspirado de pasillos.' },
        ],
      },
    },
  });

  // 3. Unidades del Coliving (Habitaciones)
  const hab1 = await prisma.unit.create({
    data: {
      propertyId: colivingProperty.id,
      name: 'Habitación 1 - Exterior con Balcón',
      type: 'ROOM',
      surfaceArea: 16.5,
      bedType: 'Doble (135x190 cm con canapé)',
      hasDesk: true,
      privateBathroom: false,
      baseRent: 550.0,
      depositAmount: 550.0,
      utilityCap: 35.0,
      status: 'OCCUPIED',
      inventoryItems: {
        create: [
          { name: 'Cama doble con canapé abatible y colchón viscoelástico con protector', quantity: 1, condition: 'Excelente' },
          { name: 'Escritorio amplio de madera con flexo LED regulable', quantity: 1, condition: 'Nuevo' },
          { name: 'Silla ergonómica de estudio con ruedas', quantity: 1, condition: 'Excelente' },
          { name: 'Armario ropero de 3 puertas con espejos', quantity: 1, condition: 'Excelente' },
          { name: 'Juego de llaves (portal + piso + cerradura de habitación)', quantity: 1, condition: 'Correcto' },
        ],
      },
    },
  });

  const hab2 = await prisma.unit.create({
    data: {
      propertyId: colivingProperty.id,
      name: 'Habitación 2 - Suite con Baño Privado',
      type: 'ROOM',
      surfaceArea: 20.0,
      bedType: 'Doble (150x200 cm con canapé)',
      hasDesk: true,
      privateBathroom: true,
      baseRent: 650.0,
      depositAmount: 650.0,
      utilityCap: 35.0,
      status: 'OCCUPIED',
      inventoryItems: {
        create: [
          { name: 'Cama Queen 150cm con cabecero tapizado y canapé', quantity: 1, condition: 'Nuevo' },
          { name: 'Baño en suite con plato de ducha y mampara', quantity: 1, condition: 'Excelente' },
          { name: 'Escritorio con flexo y silla ergonómica', quantity: 1, condition: 'Nuevo' },
          { name: 'Armario empotrado vestido por dentro', quantity: 1, condition: 'Excelente' },
          { name: 'Juego de llaves completo', quantity: 1, condition: 'Correcto' },
        ],
      },
    },
  });

  const hab3 = await prisma.unit.create({
    data: {
      propertyId: colivingProperty.id,
      name: 'Habitación 3 - Interior Tranquila',
      type: 'ROOM',
      surfaceArea: 13.0,
      bedType: 'Individual Grande (105x190 cm)',
      hasDesk: true,
      privateBathroom: false,
      baseRent: 450.0,
      depositAmount: 450.0,
      utilityCap: 35.0,
      status: 'AVAILABLE',
      inventoryItems: {
        create: [
          { name: 'Cama 105cm con canapé', quantity: 1, condition: 'Buen estado' },
          { name: 'Mesa de estudio y flexo', quantity: 1, condition: 'Buen estado' },
          { name: 'Armario 2 puertas', quantity: 1, condition: 'Buen estado' },
          { name: 'Juego de llaves', quantity: 1, condition: 'Correcto' },
        ],
      },
    },
  });

  const hab4 = await prisma.unit.create({
    data: {
      propertyId: colivingProperty.id,
      name: 'Habitación 4 - Luminosa Vista Abierta',
      type: 'ROOM',
      surfaceArea: 14.5,
      bedType: 'Doble (135x190 cm)',
      hasDesk: true,
      privateBathroom: false,
      baseRent: 490.0,
      depositAmount: 490.0,
      utilityCap: 35.0,
      status: 'RESERVED',
      inventoryItems: {
        create: [
          { name: 'Cama 135cm', quantity: 1, condition: 'Excelente' },
          { name: 'Escritorio y silla', quantity: 1, condition: 'Excelente' },
          { name: 'Armario 2 puertas', quantity: 1, condition: 'Excelente' },
        ],
      },
    },
  });

  // 4. Propiedad 2: Apartamento Independiente en Soho Tech Málaga
  const aptProperty = await prisma.property.create({
    data: {
      name: 'Estudio Soho Tech Málaga',
      address: 'Calle Tomás Heredia 14, 1º Izquierda',
      city: 'Málaga',
      postalCode: '29001',
      cadastralRef: '8392104UF6810B0002RE',
      energyRating: 'C',
      commonAreas: 'Portal y ascensor comunitario.',
      generalRules: 'Contrato de temporada por motivos profesionales vinculados al ecosistema tecnológico de Málaga. Prohibido subarriendo turístico en plataformas tipo Airbnb.',
      wifiName: 'Soho_Tech_Malaga_Fibra',
      wifiPassword: 'StudioSoho2025!',
      ownerId: owner.id,
      fixedExpenses: {
        create: [
          { concept: 'Comunidad Mensual', amount: 50.0, frequency: 'MONTHLY' },
          { concept: 'IBI Ayuntamiento de Málaga', amount: 320.0, frequency: 'ANNUAL' },
          { concept: 'Seguro Multirriesgo', amount: 210.0, frequency: 'ANNUAL' },
        ],
      },
    },
  });

  const aptUnit = await prisma.unit.create({
    data: {
      propertyId: aptProperty.id,
      name: 'Apartamento Soho Completo',
      type: 'APARTMENT',
      surfaceArea: 42.0,
      bedType: 'Cama doble 150cm',
      hasDesk: true,
      privateBathroom: true,
      baseRent: 950.0,
      depositAmount: 950.0,
      utilityCap: 0.0, // Repercusión íntegra de suministros según factura
      electricMeterNumber: 'ES002100000489123847',
      status: 'AVAILABLE',
    },
  });

  // 5. Contrato Activo 1 (Juan Martínez - Estudiante Máster UMA Campus Teatinos)
  const now = new Date();
  const startDate1 = new Date(now.getFullYear(), 8, 1); // 1 Septiembre
  const endDate1 = new Date(now.getFullYear() + 1, 5, 30); // 30 Junio (Fin curso UMA)

  const contract1 = await prisma.contract.create({
    data: {
      unitId: hab1.id,
      tenantId: tenant1.id,
      startDate: startDate1,
      endDate: endDate1,
      monthlyRent: 550.0,
      depositAmount: 550.0,
      utilityCap: 35.0,
      temporalCauseType: 'STUDIES',
      temporalCauseDetail: 'Matrícula en Máster Universitario en Ingeniería del Software e Inteligencia Artificial - Universidad de Málaga (UMA) - Campus de Teatinos (Curso 2025-2026)',
      temporalCauseDocUrl: 'https://ejemplo.com/matricula-uma-juan.pdf',
      permanentHomeCity: 'Sevilla (España)',
      status: 'ACTIVE',
      magicToken: 'tk_8f9a2b4c6e0d1f3a5b7c9e2d4f6a8b0c1d3e5f7a9b8c7d6e',
      magicTokenExpiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365),
      signedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
      signerIp: '88.12.45.192',
      signerUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      signatureSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M10 40 Q 30 10, 60 30 T 110 25 T 160 35 T 190 20" fill="none" stroke="#0f766e" stroke-width="2.5"/></svg>',
      auditTrailJson: JSON.stringify({
        timestampUtc: new Date().toISOString(),
        publicIp: '88.12.45.192',
        jurisdiction: 'Málaga (Andalucía, España)',
        cloudflareCountry: 'ES',
        userAgent: 'iPhone iOS 17.4 Mobile Safari',
        contractHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        eidasValidationStatus: 'ADVANCED_ELECTRONIC_SIGNATURE',
      }),
      inventoryVerifiedAt: new Date(),
      keyDeliveryDate: new Date(),
      securityDeposit: {
        create: {
          amountHeld: 550.0,
          regionalDepositRef: 'AVRA-MA-2025-098124', // Resguardo oficial Junta de Andalucía
          depositDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4),
          status: 'HELD',
        },
      },
      paymentReceipts: {
        create: [
          {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            rentAmount: 550.0,
            utilitiesAmount: 14.50, // Exceso de luz del mes
            totalAmount: 564.50,
            status: 'PAID',
            paymentDate: new Date(),
            paymentMethod: 'TRANSFER',
            notes: 'Transferencia bancaria recibida en cuenta corriente.',
          },
          {
            month: (now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2),
            year: (now.getMonth() + 2 > 12 ? now.getFullYear() + 1 : now.getFullYear()),
            rentAmount: 550.0,
            utilitiesAmount: 0.0,
            totalAmount: 550.0,
            status: 'PENDING',
            notes: 'En plazo de cobro ordinario (días 1 al 5 del mes).',
          },
        ],
      },
    },
  });

  // 6. Contrato Activo 2 (Elena Santos - Ingeniera en Málaga TechPark / PTA)
  const contract2 = await prisma.contract.create({
    data: {
      unitId: hab2.id,
      tenantId: tenant2.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 5, 28), // 6 meses
      monthlyRent: 650.0,
      depositAmount: 650.0,
      utilityCap: 35.0,
      temporalCauseType: 'WORK_CONTRACT',
      temporalCauseDetail: 'Contrato laboral temporal para proyecto de ingeniería de telecomunicaciones en empresa radicada en Málaga TechPark (Parque Tecnológico de Andalucía).',
      temporalCauseDocUrl: 'https://ejemplo.com/contrato-trabajo-pta-elena.pdf',
      permanentHomeCity: 'Valencia (España)',
      status: 'ACTIVE',
      magicToken: 'tk_3d7e1b9a5f8c2e4a6b0d9f1c3e5a7b9c1d3e5f7a2b4c6e8d',
      magicTokenExpiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365),
      signedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30),
      signerIp: '83.50.199.14',
      signerUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0 Safari/537.36',
      signatureSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><path d="M15 35 Q 40 15, 80 40 T 130 15 T 185 30" fill="none" stroke="#0f766e" stroke-width="2.5"/></svg>',
      auditTrailJson: JSON.stringify({
        timestampUtc: new Date().toISOString(),
        publicIp: '83.50.199.14',
        jurisdiction: 'Málaga (Andalucía, España)',
        cloudflareCountry: 'ES',
        userAgent: 'Windows 10 Chrome 128',
        contractHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        eidasValidationStatus: 'ADVANCED_ELECTRONIC_SIGNATURE',
      }),
      securityDeposit: {
        create: {
          amountHeld: 650.0,
          regionalDepositRef: 'AVRA-MA-2025-081290', // Resguardo oficial Junta de Andalucía
          depositDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 28),
          status: 'HELD',
        },
      },
      paymentReceipts: {
        create: [
          {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            rentAmount: 650.0,
            utilitiesAmount: 14.50,
            totalAmount: 664.50,
            status: 'OVERDUE', // En rojo para probar el botón de WhatsApp
            notes: 'Pendiente de cobro. Venció el día 5 del mes.',
          },
        ],
      },
    },
  });

  // 7. Factura de Suministro (Endesa Luz Teatinos Málaga)
  const utilityBill = await prisma.utilityBill.create({
    data: {
      propertyId: colivingProperty.id,
      type: 'ELECTRICITY',
      invoiceNumber: 'FAC-ENDE-2025-09812',
      periodStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      periodEnd: new Date(now.getFullYear(), now.getMonth() - 1, 30),
      totalAmount: 169.0,
      status: 'PROCESSED',
      notes: 'Bolsa contratada (2 habitaciones ocupadas x 35€ = 70€ de tope incluido). Exceso total de 99€ prorrateado equitativamente entre las 2 habitaciones ocupadas.',
      charges: {
        create: [
          {
            contractId: contract1.id,
            proratedDays: 30,
            amountCharged: 49.50,
            calculationDetail: 'Factura 169.00€ - Bolsa 70.00€ = Exceso 99.00€ / 2 habitaciones activas = 49.50€',
            isSettled: true,
          },
          {
            contractId: contract2.id,
            proratedDays: 30,
            amountCharged: 49.50,
            calculationDetail: 'Factura 169.00€ - Bolsa 70.00€ = Exceso 99.00€ / 2 habitaciones activas = 49.50€',
            isSettled: true,
          },
        ],
      },
    },
  });

  // 8. Incidencia de Mantenimiento
  await prisma.maintenanceTicket.create({
    data: {
      propertyId: colivingProperty.id,
      unitId: hab1.id,
      reportedById: tenant1.id,
      title: 'Persiana del balcón encallada',
      description: 'La cinta de la persiana exterior no sube por completo, se queda atascada a media altura en Av. Plutarco.',
      isCommonArea: false,
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      photoUrlsJson: JSON.stringify(['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=60']),
    },
  });

  // 9. Aviso formal con lectura fehaciente
  await prisma.formalNotice.create({
    data: {
      propertyId: colivingProperty.id,
      senderId: owner.id,
      title: 'Revisión Técnica Anual de Climatización y Agua Caliente',
      message: 'Estimados inquilinos: el próximo jueves entre las 10:00 y las 12:00 h acudirá el técnico autorizado para la revisión reglamentaria de los equipos de climatización del inmueble en Teatinos.',
      urgencyLevel: 'IMPORTANT',
      reads: {
        create: [
          {
            tenantId: tenant1.id,
            readAt: new Date(),
            readerIp: '88.12.45.192',
            readerUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)',
          },
        ],
      },
    },
  });

  console.log('==> Semilla de Málaga (Andalucía) completada con éxito.');
  console.log('Organismo oficial de fianza: AVRA (Agencia de Vivienda y Rehabilitación de Andalucía)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
