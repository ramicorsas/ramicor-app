import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/db/client';
import { signAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function POST(req) {
  const { usuario, password } = await req.json().catch(() => ({}));
  if (!usuario || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña requeridos.' }, { status: 400 });
  }

  const { rows } = await query(`SELECT id, nombre, usuario, password_hash FROM admins WHERE usuario = $1`, [usuario]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  const token = await signAdminSession({ adminId: admin.id, nombre: admin.nombre, usuario: admin.usuario });
  const res = NextResponse.json({ ok: true, nombre: admin.nombre });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
