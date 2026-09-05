import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, roleQuickSelect } = await req.json();

    // Si se usa selector rápido de roles (para pruebas cómodas de demostración)
    if (roleQuickSelect) {
      const user = dataStore.getUsers().find((u: any) => u.role === roleQuickSelect);
      if (user) {
        const sessionUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        };
        await setSessionCookie(sessionUser);
        return NextResponse.json({ success: true, user: sessionUser });
      }
    }

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const user = dataStore.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    // Comprobación de contraseña simple para pruebas (admin123)
    if (password && password !== 'admin123' && user.passwordHash !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    await setSessionCookie(sessionUser);
    return NextResponse.json({ success: true, user: sessionUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en el servidor' }, { status: 500 });
  }
}
