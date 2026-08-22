import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/db/client';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function GET(req) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { rows } = await query(
    `SELECT id, nombre, usuario, whatsapp, vehiculo, capacidad_vehiculo, activo, created_at FROM transportistas ORDER BY nombre`
  );
  return NextResponse.json({ choferes: rows });
}

export async function POST(req) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { nombre, usuario, password, whatsapp, vehiculo, capacidadVehiculo } = await req.json().catch(() => ({}));
  if (!nombre || !usuario || !password) {
    return NextResponse.json({ error: 'Nombre, usuario y contraseña son obligatorios.' }, { status: 400 });
  }

  const existe = await query(`SELECT id FROM transportistas WHERE usuario = $1`, [usuario]);
  if (existe.rows[0]) {
    return NextResponse.json({ error: 'Ya existe un chofer con ese usuario.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await query(
    `INSERT INTO transportistas (nombre, usuario, password_hash, whatsapp, vehiculo, capacidad_vehiculo, activo)
     VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING id, nombre, usuario, whatsapp, vehiculo, capacidad_vehiculo, activo, created_at`,
    [nombre, usuario, passwordHash, whatsapp || null, vehiculo || null, capacidadVehiculo || null]
  );
  return NextResponse.json({ chofer: rows[0] }, { status: 201 });
}
