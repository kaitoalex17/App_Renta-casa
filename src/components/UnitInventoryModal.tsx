'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { UnitData, InventoryItemData } from '@/types';
import { optimizeImageForWeb, formatFileSize } from '@/lib/imageOptimizer';

interface UnitInventoryModalProps {
  unit: UnitData;
  isOpen: boolean;
  onClose: () => void;
  onInventoryUpdated?: (updatedUnit: UnitData) => void;
}

export default function UnitInventoryModal({
  unit,
  isOpen,
  onClose,
  onInventoryUpdated,
}: UnitInventoryModalProps) {
  const [photos, setPhotos] = useState<string[]>(unit.photos || []);
  const [items, setItems] = useState<InventoryItemData[]>(unit.inventory || []);

  // Estado para nuevo elemento
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCondition, setItemCondition] = useState('Excelente estado');
  const [itemNotes, setItemNotes] = useState('');
  const [itemPhotoUrl, setItemPhotoUrl] = useState('');

  // Estados de carga y feedback
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    original: string;
    optimized: string;
    savedPct: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Subir y optimizar foto general de la habitación
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setOptimizing(true);
    setOptimizationStats(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Comprimir en cliente a WebP max 1280px
        const optimized = await optimizeImageForWeb(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.78,
          targetFormat: 'image/webp',
        });

        setOptimizationStats({
          original: formatFileSize(optimized.originalSizeBytes),
          optimized: formatFileSize(optimized.optimizedSizeBytes),
          savedPct: optimized.savedPercentage,
        });

        // 2. Subir a /api/upload
        const resUpload = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: optimized.dataUrl }),
        });

        const uploadData = await resUpload.json();
        if (!resUpload.ok) {
          throw new Error(uploadData.error || 'Error al guardar la imagen en el servidor');
        }

        const uploadedUrl = uploadData.url;

        // 3. Vincular foto a la unidad
        const resUnit = await fetch(`/api/units/${unit.id}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'ADD_PHOTO', photoUrl: uploadedUrl }),
        });

        const unitData = await resUnit.json();
        if (resUnit.ok && unitData.photos) {
          setPhotos(unitData.photos);
          if (onInventoryUpdated) {
            onInventoryUpdated({ ...unit, photos: unitData.photos, inventory: items });
          }
        }
      }

      setSuccessMsg('Fotografía(s) comprimida(s) y adjuntadas correctamente.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la imagen.');
    } finally {
      setOptimizing(false);
      e.target.value = '';
    }
  }

  // Eliminar foto de la habitación
  async function handleRemovePhoto(photoUrl: string) {
    try {
      const res = await fetch(`/api/units/${unit.id}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE_PHOTO', photoUrl }),
      });
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
        if (onInventoryUpdated) {
          onInventoryUpdated({ ...unit, photos: data.photos, inventory: items });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Subir foto para un ítem concreto de inventario
  async function handleItemPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setOptimizing(true);
    try {
      const optimized = await optimizeImageForWeb(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.75,
      });

      const resUpload = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: optimized.dataUrl }),
      });
      const uploadData = await resUpload.json();
      if (resUpload.ok && uploadData.url) {
        setItemPhotoUrl(uploadData.url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  }

  // Guardar nuevo ítem de inventario
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemName.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/units/${unit.id}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: itemName.trim(),
          quantity: itemQuantity,
          condition: itemCondition,
          notes: itemNotes.trim(),
          photoUrl: itemPhotoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar elemento.');

      setItems(data.inventory);
      setItemName('');
      setItemQuantity(1);
      setItemCondition('Excelente estado');
      setItemNotes('');
      setItemPhotoUrl('');
      setSuccessMsg('Elemento añadido al inventario.');
      setTimeout(() => setSuccessMsg(''), 3000);

      if (onInventoryUpdated) {
        onInventoryUpdated({ ...unit, photos, inventory: data.inventory });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Eliminar elemento de inventario
  async function handleDeleteItem(itemId: string) {
    if (!confirm('¿Deseas eliminar este elemento del inventario de la habitación?')) return;

    try {
      const res = await fetch(`/api/units/${unit.id}/inventory?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.inventory) {
        setItems(data.inventory);
        if (onInventoryUpdated) {
          onInventoryUpdated({ ...unit, photos, inventory: data.inventory });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">{unit.name}</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {unit.type === 'ROOM' ? 'Habitación Coliving' : 'Apartamento'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inventario de dotación y reportaje fotográfico para Anexo II del contrato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensajes de Feedback */}
        {optimizationStats && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Compresión Web Completada:</strong> {optimizationStats.original} ➔{' '}
                <span className="font-bold text-emerald-700">{optimizationStats.optimized}</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded font-black bg-emerald-600 text-white text-[11px]">
              Ahorro del {optimizationStats.savedPct}%
            </span>
          </div>
        )}

        {successMsg && (
          <div className="px-6 py-2 bg-teal-50 text-teal-800 text-xs font-semibold border-b border-teal-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="px-6 py-2 bg-rose-50 text-rose-800 text-xs font-semibold border-b border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
          {/* SECCIÓN 1: FOTOS DEL ESTADO DE LA HABITACIÓN */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  Fotografías del Estado de la Habitación ({photos.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Imágenes comprimidas automáticamente a WebP para carga instantánea en móviles.
                </p>
              </div>

              {/* Botón de subida de fotos */}
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{optimizing ? 'Comprimiendo Web...' : 'Subir Fotos'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={optimizing}
                  className="hidden"
                />
              </label>
            </div>

            {/* Grid de Fotos */}
            {photos.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg bg-white">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium">Aún no hay fotos del estado de esta habitación.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sube fotos de la cama, escritorio, paredes y cerraduras para adjuntarlas al contrato.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-4/3 shadow-xs"
                  >
                    <img
                      src={url}
                      alt={`Estado habitación ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(url)}
                        className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
                        title="Eliminar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-slate-900/80 text-[9px] font-bold text-teal-300 rounded">
                      WebP #0{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: TABLA DE ELEMENTOS DE INVENTARIO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                Dotación y Mobiliario Inventariado ({items.length})
              </h3>
              <span className="text-[11px] text-slate-500">
                Se incluirá íntegramente en el <strong>Anexo II</strong> con plazo de 48h.
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-4 text-center border border-slate-200 rounded-lg bg-slate-50 text-slate-500">
                No hay elementos registrados todavía en el inventario. Añade los muebles y equipamiento abajo.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <th className="p-3">Elemento / Mobiliario</th>
                      <th className="p-3 text-center">Cant.</th>
                      <th className="p-3">Estado de Conservación</th>
                      <th className="p-3">Foto / Detalle</th>
                      <th className="p-3">Notas</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 text-center font-bold text-slate-700">{item.quantity}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.condition.includes('Nuevo') || item.condition.includes('estrenar')
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.condition.includes('Excelente')
                                ? 'bg-teal-100 text-teal-800'
                                : item.condition.includes('Buen')
                                ? 'bg-blue-100 text-blue-800'
                                : item.condition.includes('Desgaste')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.condition}
                          </span>
                        </td>
                        <td className="p-3">
                          {item.photoUrl ? (
                            <a
                              href={item.photoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-semibold"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Ver Foto</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Sin foto</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500 italic max-w-xs truncate">
                          {item.notes || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Eliminar del inventario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECCIÓN 3: FORMULARIO PARA AÑADIR ELEMENTO */}
          <form
            onSubmit={handleAddItem}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              Añadir Elemento al Inventario
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Nombre del Elemento *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ej: Colchón viscoelástico con protector impermeable"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Estado de Conservación
                </label>
                <select
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="Nuevo / A estrenar">Nuevo / A estrenar</option>
                  <option value="Excelente estado">Excelente estado</option>
                  <option value="Buen estado">Buen estado</option>
                  <option value="Desgaste normal de uso">Desgaste normal de uso</option>
                  <option value="Con tara previa documentada">Con tara previa documentada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Foto Opcional
                </label>
                <label className="w-full flex items-center justify-center gap-1.5 px-2 py-2 bg-white border border-slate-300 hover:border-teal-400 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer transition">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{itemPhotoUrl ? '✓ Foto OK' : 'Subir'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleItemPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="md:col-span-10">
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Notas adicionales (ej: marca, modelo o pequeña rozadura previa)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={saving || !itemName.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Pie de modal */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Los cambios quedan guardados y vinculados al próximo contrato.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold shadow-xs transition"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
