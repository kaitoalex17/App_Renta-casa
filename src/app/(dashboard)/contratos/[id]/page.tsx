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
  Image as ImageIcon,
  Layers,
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
  const unit = dataStore.getUnitById(contract.unitId);
  const inventoryItems =
    contract.inventorySnapshot && contract.inventorySnapshot.length > 0
      ? contract.inventorySnapshot
      : unit?.inventory || [];
  const roomPhotos =
    contract.unitPhotos && contract.unitPhotos.length > 0
      ? contract.unitPhotos
      : unit?.photos || [];

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
        <section className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Anexo II — Inventario Digital de Entrada y Reportaje Fotográfico
            </h2>
            {contract.inventoryVerifiedAt ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verificado por Inquilino (48h OK)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Clock className="w-3 h-3" />
                <span>Plazo legal de 48h para alegaciones</span>
              </span>
            )}
          </div>

          <p className="text-slate-600 text-xs">
            El arrendatario reconoce recibir la unidad arrendada ({contract.unitName}) con el equipamiento, mobiliario y enseres que a continuación se relacionan en las condiciones físicas indicadas:
          </p>

          {/* Tabla de ítems de inventario */}
          {inventoryItems.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-2.5">Elemento / Dotación</th>
                    <th className="p-2.5 text-center">Unidades</th>
                    <th className="p-2.5">Estado de Conservación</th>
                    <th className="p-2.5">Detalles / Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-2.5 font-bold text-slate-800 flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.photoUrl && (
                          <a
                            href={item.photoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-600 hover:text-teal-800 inline-flex items-center gap-0.5 text-[10px]"
                            title="Ver foto de comprobación"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Foto</span>
                          </a>
                        )}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-slate-700">{item.quantity}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {item.condition}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500 italic text-[11px]">
                        {item.notes || 'En correcto estado de uso y limpieza.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic bg-white p-3 rounded border border-slate-200">
              Dotación básica estándar: Cama, colchón con funda protectora, mesa de estudio, silla y juego de llaves.
            </p>
          )}

          {/* Galería de Fotografías del Estado del Inmueble */}
          {roomPhotos.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                Fotografías de Estado de Entrega (WebP Optimizadas):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {roomPhotos.map((photoUrl: string, idx: number) => (
                  <a
                    key={idx}
                    href={photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-4/3 shadow-2xs block"
                  >
                    <img
                      src={photoUrl}
                      alt={`Foto estado entrega ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 text-[9px] font-bold text-teal-300 rounded">
                      Estado #{idx + 1}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cláusula de 48 Horas */}
          <div className="p-3 bg-white rounded-lg border border-amber-200 text-slate-800 text-[11px] leading-relaxed">
            <p>
              ⚠️ <strong>Cláusula de Comprobación de 48 Horas:</strong> El arrendatario dispone de un plazo improrrogable de <strong>cuarenta y ocho (48) horas</strong> a contar desde la efectiva recepción de las llaves para verificar el estado de la habitación y su dotación, pudiendo remitir a través del portal de inquilino fotografías o alegaciones sobre cualquier desperfecto no imputable. Transcurrido dicho plazo sin disconformidad expresa fehaciente, se entenderá y presumirá a todos los efectos legales que la finca y todo su mobiliario se reciben en perfecto estado de conservación y funcionamiento.
            </p>
            {contract.inventoryRemarks && (
              <p className="mt-2 pt-2 border-t border-slate-100 text-teal-800 font-medium">
                💬 <strong>Anotación en portal:</strong> «{contract.inventoryRemarks}»
              </p>
            )}
          </div>
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
