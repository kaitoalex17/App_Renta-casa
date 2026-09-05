/**
 * Motor de optimización de imágenes para web en el cliente (Browser).
 * Reduce drásticamente el peso de fotos pesadas tomadas con smartphones (de 4-12 MB a ~60-120 KB)
 * convirtiéndolas a formato WebP optimizado con escalado proporcional de resolución.
 */

export interface OptimizedImageResult {
  file: File;
  dataUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  savedPercentage: number;
  width: number;
  height: number;
  format: string;
}

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (recomendado 0.75 - 0.82)
  targetFormat?: 'image/webp' | 'image/jpeg';
}

export async function optimizeImageForWeb(
  inputFile: File,
  options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.78,
    targetFormat = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // Si no estamos en entorno de navegador, devolvemos el archivo tal cual
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      const fallbackUrl = URL.createObjectURL(inputFile);
      return resolve({
        file: inputFile,
        dataUrl: fallbackUrl,
        originalSizeBytes: inputFile.size,
        optimizedSizeBytes: inputFile.size,
        savedPercentage: 0,
        width: 0,
        height: 0,
        format: inputFile.type,
      });
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 1. Redimensionar proporcionalmente respetando la relación de aspecto
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // 2. Crear lienzo de dibujo offscreen
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el contexto 2D de Canvas.'));
        }

        // Aplicar renderizado suave de alta calidad
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dibujar imagen escalada
        ctx.drawImage(img, 0, 0, width, height);

        // 3. Exportar a WebP con calidad controlada
        let formatToUse = targetFormat;
        let dataUrl = canvas.toDataURL(formatToUse, quality);

        // Si el navegador no soporta WebP en canvas, fallback a JPEG
        if (!dataUrl.startsWith(`data:${formatToUse}`)) {
          formatToUse = 'image/jpeg';
          dataUrl = canvas.toDataURL(formatToUse, quality);
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Fallo al generar el blob comprimido de la imagen.'));
            }

            const cleanFileName =
              inputFile.name.replace(/\.[^/.]+$/, '') +
              (formatToUse === 'image/webp' ? '.webp' : '.jpg');
            const optimizedFile = new File([blob], cleanFileName, {
              type: formatToUse,
              lastModified: Date.now(),
            });

            const originalSize = inputFile.size;
            const optimizedSize = blob.size;
            const savedPct = Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100));

            resolve({
              file: optimizedFile,
              dataUrl,
              originalSizeBytes: originalSize,
              optimizedSizeBytes: optimizedSize,
              savedPercentage: savedPct,
              width,
              height,
              format: formatToUse,
            });
          },
          formatToUse,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('El archivo seleccionado no es una imagen válida o está dañado.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo de imagen.'));
    };

    reader.readAsDataURL(inputFile);
  });
}

/**
 * Función auxiliar para formatear tamaños de bytes legibles (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
