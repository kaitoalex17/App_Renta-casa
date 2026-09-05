'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FileSignature,
  ShieldCheck,
  Calendar,
  Wallet,
  Home,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Fingerprint,
} from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';

export default function MobileSigningPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [signatureData, setSignatureData] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [signedResult, setSignedResult] = useState<any>(null);

  useEffect(() => {
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        if (data.contracts) {
          const found = data.contracts.find((c: any) => c.magicToken === token);
          if (found) {
            setContract(found);
            if (found.status === 'ACTIVE') {
              setSignedSuccess(true);
              setSignedResult(found);
            }
          } else {
            setError('Enlace de firma inválido o no encontrado.');
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSignContract() {
    if (!signatureData) {
      alert('Por favor, dibuja tu rúbrica en el lienzo táctil antes de confirmar.');
      return;
    }
    if (!acceptTerms) {
      alert('Debes marcar la casilla aceptando las condiciones del contrato de temporada.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contracts/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          signatureSvg: `<img src="${signatureData}" style="max-height:60px;" alt="Firma"/>`,
          contractSummaryText: `Contrato-${contract.unitName}-${contract.monthlyRent}EUR-${contract.startDate}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al firmar el contrato');
      }

      setSignedSuccess(true);
      setSignedResult(data.contract);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-teal-400 text-sm font-semibold animate-pulse">
          Cargando visor móvil de firma digital...
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Enlace no disponible</h2>
          <p className="text-xs text-slate-400 mt-2">{error || 'El enlace ha caducado o es incorrecto.'}</p>
        </div>
      </div>
    );
  }

  // Pantalla de Confirmación Exitosa
  if (signedSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-teal-500/40 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto border border-teal-500/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              ¡Contrato Firmado Correctamente!
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tu arrendamiento de media temporada para <strong>{contract.unitName}</strong> ha quedado legalmente formalizado y blindado.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-left text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Firmante:</span>
              <span className="font-bold text-white">{contract.tenantName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Documento:</span>
              <span className="font-mono text-teal-400">{contract.tenantDocNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Fecha y Hora UTC:</span>
              <span className="font-mono text-slate-300">
                {signedResult?.signedAt ? new Date(signedResult.signedAt).toLocaleString() : 'Completado'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-700/60 pt-2">
              <span className="text-slate-400">Certificación eIDAS:</span>
              <span className="font-bold text-emerald-400">Audit Trail Sellado</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push(`/portal/${token}`)}
              className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition"
            >
              Ir a Mi Portal de Inquilino
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-5">
        {/* Cabecera Móvil */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-full text-xs font-bold mb-2">
            <Fingerprint className="w-3.5 h-3.5" />
            Firma Digital Avanzada Móvil
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Bienvenido/a, {contract.tenantName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Revisa los puntos clave de tu contrato de media temporada y firma directamente en pantalla con tu dedo.
          </p>
        </div>

        {/* Tarjeta 1: Habitación & Inmueble */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-lg">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidad Asignada</span>
              <h2 className="text-sm font-bold text-white">{contract.unitName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{contract.propertyName}</p>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Fechas de Estancia */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Periodo de Arrendamiento</span>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Entrada (Check-in):</span>
                  <strong className="text-white">{contract.startDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Salida (Check-out):</span>
                  <strong className="text-white">{contract.endDate}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 3: Condiciones Económicas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condiciones Económicas</span>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Renta Mensual:</span>
                  <strong className="text-emerald-400 text-sm font-black">{contract.monthlyRent.toFixed(2)} €</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fianza en Custodia:</span>
                  <strong className="text-white">{contract.depositAmount.toFixed(2)} €</strong>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-teal-300">
                ⚡ Tope de suministros incluido: <strong>{contract.utilityCap.toFixed(2)} €/mes</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta 4: Causa de Temporalidad Declarada (LAU 3) */}
        <div className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                Causa Legal de Temporalidad (LAU Art. 3)
              </span>
              <p className="text-xs text-white font-semibold mt-1">
                {contract.temporalCauseDetail || 'Motivos de estudio o trabajo temporal.'}
              </p>
              <p className="text-[10px] text-purple-300 mt-1">
                Declaras mantener tu domicilio habitual permanente en: <strong>{contract.tenantPermanentCity}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Desplegable del Contrato Legal Completo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFullTerms(!showFullTerms)}
            className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white"
          >
            <span>Ver Cláusulas Legales Completas (LAU, Anexo I y II)</span>
            {showFullTerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFullTerms && (
            <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-3 leading-relaxed max-h-64 overflow-y-auto">
              <p>
                <strong>1. No vivienda habitual:</strong> El arrendatario manifiesta que destina la finca exclusivamente a alojamiento temporal, manteniendo su domicilio habitual en otra localidad.
              </p>
              <p>
                <strong>2. Prohibición de subarriendo:</strong> Queda terminantemente prohibido el subarriendo de la habitación o su cesión a través de plataformas turísticas (Airbnb o análogas).
              </p>
              <p>
                <strong>3. Normas de convivencia (Anexo I):</strong> Silencio nocturno de 23:00 a 08:00 h. Prohibido fumar, tenencia de mascotas y celebración de fiestas.
              </p>
              <p>
                <strong>4. Inventario (Anexo II):</strong> El inquilino dispone de 48 horas desde su entrada para verificar el inventario o reportar desperfectos en el portal; transcurrido el plazo, se entenderá aceptado.
              </p>
            </div>
          )}
        </div>

        {/* Lienzo de Firma Digital Táctil */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <SignaturePad onSave={(data) => setSignatureData(data)} />

          <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 rounded text-teal-500 focus:ring-teal-400"
            />
            <span className="leading-tight">
              He leído y acepto expresamente las condiciones del contrato de temporada, las normas de régimen interno y autorizo el tratamiento legal de mis datos (RGPD).
            </span>
          </label>
        </div>

        {/* Botón de Confirmación */}
        <div>
          <button
            type="button"
            onClick={handleSignContract}
            disabled={submitting || !signatureData || !acceptTerms}
            className="w-full py-3.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-teal-500/20 transition disabled:opacity-40"
          >
            {submitting ? 'Estampando Firma y Audit Trail...' : 'Firmar y Ratificar Contrato Legal'}
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-2">
            Se registrará tu dirección IP pública, User-Agent del móvil y sello de tiempo UTC fehaciente.
          </p>
        </div>
      </div>
    </div>
  );
}
