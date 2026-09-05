import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { dataStore } from '@/lib/dataStore';
import {
  FileSignature,
  ArrowLeft,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Clock,
  Fingerprint,
  Calendar,
  FileText,
} from 'lucide-react';

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  const contract = dataStore.getContractById(params.id);

  if (!contract) {
    notFound();
  }

  const property = dataStore.getPropertyById(contract.propertyId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Botones superiores de navegación e impresión */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/contratos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a contratos</span>
        </Link>

        <div className="flex items-center gap-3">
          {contract.status === 'PENDING_SIGNATURE' && (
            <Link
              href={`/firmar/${contract.magicToken}`}
              target="_blank"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
            >
              Abrir Enlace de Firma Móvil
            </Link>
          )}

          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Expediente Legal del Contrato */}
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8 text-slate-800 text-xs leading-relaxed">
        {/* Encabezado del Documento Oficial */}
        <div className="border-b border-slate-200 pb-6 text-center">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Documento Legal Vinculante
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-3">
            CONTRATO DE ARRENDAMIENTO DE TEMPORADA POR HABITACIÓN / UNIDAD
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sujeto al Art. 3 de la Ley 29/1994 de Arrendamientos Urbanos (LAU)
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Ref. Contractual: {contract.id} · Creado el {new Date(contract.startDate).toLocaleDateString()}
          </p>
        </div>

        {/* 1. Comparecientes */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
            I. Comparecientes y Partes Intervinientes
          </h2>
          <p>
            <strong>DE UNA PARTE (Arrendador):</strong> D. Carlos Mendoza, en calidad de Propietario / Administrador del inmueble sito en {contract.propertyName}, {property?.address} ({property?.city}).
          </p>
          <p>
            <strong>DE OTRA PARTE (Arrendatario):</strong> D./Dña. <strong>{contract.tenantName}</strong>, mayor de edad, provisto/a de {contract.tenantDocType} nº <strong>{contract.tenantDocNumber}</strong>, con domicilio habitual permanente acreditado en la ciudad de <strong>{contract.tenantPermanentCity}</strong>, teléfono {contract.tenantPhone || 'N/D'} y correo electrónico {contract.tenantEmail}.
          </p>
        </section>

        {/* 2. Causa de Temporalidad y Exclusión de Vivienda Habitual */}
        <section className="space-y-2 bg-purple-50/60 p-4 rounded-xl border border-purple-200">
          <h2 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            II. Causa Expresa de Temporalidad y Exclusión de Vivienda Habitual (Art. 3 LAU)
          </h2>
          <p className="text-purple-950 font-medium">
            El presente contrato se suscribe por motivo exclusivo de:{' '}
            <strong>
              {contract.temporalCauseType === 'STUDIES'
                ? 'Estudios Universitarios / Máster / Proyecto Académico'
                : contract.temporalCauseType === 'WORK_CONTRACT'
                ? 'Contrato Laboral Temporal / Proyecto Profesional Determinado'
                : 'Desplazamiento Profesional / Nómada Digital'}
            </strong>.
          </p>
          <p className="text-purple-900 italic bg-white/80 p-2.5 rounded border border-purple-200">
            «{contract.temporalCauseDetail || 'Estancia motivada por estudios o trabajo temporal documentado.'}»
          </p>
          <p className="text-[11px] text-purple-900">
            El arrendatario declara y ratifica de forma expresa que <strong>mantiene su domicilio habitual, familiar y permanente en {contract.tenantPermanentCity}</strong>, y que el presente arrendamiento tiene una finalidad estrictamente temporal vinculada a la causa manifestada, renunciando de forma expresa a los derechos de prórroga obligatoria previstos en el Art. 9 de la LAU para los arrendamientos de vivienda permanente.
          </p>
        </section>

        {/* 3. Objeto, Fechas y Condiciones Económicas */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
            III. Objeto, Plazo y Condiciones Económicas
          </h2>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
            <div>
              <p><strong>Unidad Arrendada:</strong> {contract.unitName}</p>
              <p><strong>Fecha de Entrada (Check-in):</strong> {contract.startDate}</p>
              <p><strong>Fecha de Salida (Check-out):</strong> {contract.endDate}</p>
            </div>
            <div>
              <p><strong>Renta Mensual:</strong> {contract.monthlyRent.toFixed(2)} €/mes</p>
              <p><strong>Fianza Legal Custodiada:</strong> {contract.depositAmount.toFixed(2)} €</p>
              <p><strong>Tope Suministros Incluido:</strong> {contract.utilityCap.toFixed(2)} €/mes</p>
            </div>
          </div>
          <p>
            El pago de la renta se realizará durante los primeros <strong>cinco (5) días</strong> de cada mes natural mediante transferencia bancaria o domiciliación.
          </p>
        </section>

        {/* 4. Prohibición de Cesión y Subarriendo */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
            IV. Prohibición Expresa de Subarriendo y Cesión (Anti-Airbnb)
          </h2>
          <p>
            Queda <strong>terminantemente prohibido al arrendatario ceder, subarrendar total o parcialmente</strong> la habitación o unidad a terceros, así como destinarla a cualquier tipo de hospedaje turístico o vacacional a través de plataformas digitales (Airbnb, Booking o análogas). El incumplimiento facultará al arrendador a la <strong>resolución automática e inmediata del contrato</strong>, con pérdida de la fianza y sin perjuicio de la indemnización por daños y perjuicios.
          </p>
        </section>

        {/* 5. Anexo I: Normas de Régimen Interno y Convivencia */}
        <section className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600" />
            Anexo I — Normas de Régimen Interno y Convivencia
          </h2>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><strong>Horario de Silencio y Descanso:</strong> Se establece un régimen estricto de silencio entre las 23:00 y las 08:00 horas todos los días.</li>
            <li><strong>Política de Invitados:</strong> Queda prohibida la pernocta de terceros no registrados por más de dos (2) noches consecutivas sin comunicación previa y autorización de la administración.</li>
            <li><strong>Uso de Zonas Comunes:</strong> La cocina, baños y salón deberán quedar recogidos y limpios inmediatamente después de su uso. Prohibido almacenar enseres personales en pasillos y salón.</li>
            <li><strong>Prohibiciones Expresas:</strong> Prohibido fumar en cualquier estancia interior, tenencia de animales y celebración de fiestas o eventos ruidosos.</li>
          </ul>
        </section>

        {/* 6. Anexo II: Inventario y Plazo de Validación de 48 Horas */}
        <section className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-600" />
            Anexo II — Inventario Digital de Entrada
          </h2>
          <p className="text-slate-600">
            El arrendatario recibe la habitación y las zonas comunes con el mobiliario en correcto estado de uso y conservación: cama con colchón y protector, escritorio con silla y flexo, armario y juego de llaves.
          </p>
          <p className="text-slate-800 font-semibold bg-white p-2.5 rounded border border-slate-200">
            ⚠️ <strong>Plazo de 48 horas tras la entrega de llaves:</strong> El inquilino dispone de un plazo de 48 horas desde su entrada para verificar el inventario en el portal o reportar cualquier tara preexistente aportando fotografía. Transcurrido dicho plazo sin observaciones, se entenderá que recibe el inmueble y su dotación en perfecto estado.
          </p>
        </section>

        {/* 7. Depósito de Fianza en AVRA y Fuero Judicial */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
            V. Depósito Autonómico de Fianza (AVRA) y Fuero Aplicable
          </h2>
          <p className="text-slate-600">
            En cumplimiento de la <strong>Ley 8/1997 de la Comunidad Autónoma de Andalucía</strong>, el importe de la fianza legal será debidamente ingresado y depositado en la <strong>Agencia de Vivienda y Rehabilitación de Andalucía (AVRA)</strong> de la Junta de Andalucía.
          </p>
          <p className="text-slate-600">
            Para la resolución de cualquier divergencia o litigio derivado de la interpretación o cumplimiento del presente contrato, ambas partes se someten de forma expresa a la jurisdicción y competencia de los <strong>Juzgados y Tribunales de Málaga capital</strong>, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

        {/* 8. Hoja de Evidencias Digitales / Audit Trail */}
        <section className="border-t-2 border-teal-500 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-teal-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-teal-900">
                Certificado de Firma Digital y Hoja de Evidencias (Audit Trail)
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
              Conforme Reglamento UE 910/2014 (eIDAS)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-teal-50/40 p-4 rounded-xl border border-teal-200">
            <div>
              <p className="text-[11px] font-bold text-slate-500">Firmante Autorizado:</p>
              <p className="text-sm font-black text-slate-900">{contract.tenantName}</p>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">{contract.tenantDocType}: {contract.tenantDocNumber}</p>
              
              <div className="mt-3">
                <p className="text-[11px] font-bold text-slate-500">Timestamp UTC (Sellado de Tiempo):</p>
                <p className="text-xs font-mono text-slate-800 font-semibold">
                  {contract.signedAt || 'Pendiente de firma'}
                </p>
              </div>

              <div className="mt-2">
                <p className="text-[11px] font-bold text-slate-500">Dirección IP de Firma (Cloudflare / Nginx):</p>
                <p className="text-xs font-mono text-teal-800 font-bold">
                  {contract.signerIp || contract.auditTrail?.publicIp || 'Registrada en firma'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500">Rúbrica Digital Táctil:</p>
              <div className="mt-1 h-20 bg-white border border-teal-300 rounded-lg flex items-center justify-center p-2 shadow-inner overflow-hidden">
                {contract.signatureSvg ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: contract.signatureSvg }}
                    className="max-h-full max-w-full"
                  />
                ) : (
                  <span className="text-xs text-amber-700 italic">Pendiente de captura</span>
                )}
              </div>

              <div className="mt-2">
                <p className="text-[10px] font-bold text-slate-500">Hash SHA-256 de Integridad Legal:</p>
                <p className="text-[10px] font-mono text-slate-600 truncate" title={contract.auditTrail?.contractHashSha256}>
                  {contract.auditTrail?.contractHashSha256 || 'Calculado al sellar'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
