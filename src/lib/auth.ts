import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { dataStore } from './dataStore';
import { UserSession, Role } from '@/types';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'clave_secreta_super_segura_de_al_menos_32_caracteres_cambiar_en_produccion';
const COOKIE_NAME = 'rentacasa_session';

export function createToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

export async function setSessionCookie(user: UserSession) {
  const token = createToken(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function hasRole(user: UserSession | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true; // Superadmin tiene acceso a todo
  return allowedRoles.includes(user.role);
}
