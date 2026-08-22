import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/db/client';
import { signTransportistaSession, TRANSPORTISTA_SESSION_COOKIE } from '@/lib/auth';

export async function POST(req) {
  const { usuario, password } = await req.json().catch(() => ({}));
  if (!usuario || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña requeridos.' }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT id, nombre, usuario, password_hash, activo FROM transportistas WHERE usuario = $1`,
    [usuario]
  );
  const t = rows[0];
  if (!t || !t.activo || !(await bcrypt.compare(password, t.password_hash))) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  const token = await signTransportistaSession({ transportistaId: t.id, nombre: t.nombre, usuario: t.usuario });
  const res = NextResponse.json({ ok: true, nombre: t.nombre });
  res.cookies.set(TRANSPORTISTA_SESSION_COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
