import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Asegurar que la carpeta public/uploads existe
    await mkdir(uploadsDir, { recursive: true });

    let buffer: Buffer;
    let extension = 'webp';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No se ha adjuntado ningún archivo.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);

      if (file.type === 'image/jpeg') extension = 'jpg';
      else if (file.type === 'image/png') extension = 'png';
      else extension = 'webp';
    } else {
      // Soporte para JSON con base64 dataUrl
      const body = await req.json();
      if (!body.dataUrl) {
        return NextResponse.json({ error: 'Falta el campo dataUrl en el cuerpo de la petición.' }, { status: 400 });
      }

      const match = body.dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!match) {
        return NextResponse.json({ error: 'Formato de imagen Base64 inválido.' }, { status: 400 });
      }

      const mimeType = match[1];
      if (mimeType === 'jpeg') extension = 'jpg';
      else if (mimeType === 'png') extension = 'png';
      else extension = 'webp';

      buffer = Buffer.from(match[2], 'base64');
    }

    // Generar nombre de archivo único y seguro
    const randomSuffix = crypto.randomBytes(6).toString('hex');
    const fileName = `room_state_${Date.now()}_${randomSuffix}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      sizeBytes: buffer.length,
    });
  } catch (err: any) {
    console.error('Error al subir imagen:', err);
    return NextResponse.json(
      { error: err.message || 'Error interno al guardar la imagen.' },
      { status: 500 }
    );
  }
}
