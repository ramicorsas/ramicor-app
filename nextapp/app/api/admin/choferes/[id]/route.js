import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/db/client';
import { getAdminSessionFromRequest } from '@/lib/auth';

// PATCH — activar/desactivar, editar datos, o resetear contraseña de un
// chofer. No se borra nunca (soft delete vía `activo`) para no perder el
// historial de pedidos que ya tomó.
export async function PATCH(req, { params }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  const sets = [];
  const values = [];
  let i = 1;

  if (typeof body.activo === 'boolean') { sets.push(`activo = $${i++}`); values.push(body.activo); }
  if (body.nombre) { sets.push(`nombre = $${i++}`); values.push(body.nombre); }
  if (body.whatsapp !== undefined) { sets.push(`whatsapp = $${i++}`); values.push(body.whatsapp); }
  if (body.vehiculo !== undefined) { sets.push(`vehiculo = $${i++}`); values.push(body.vehiculo); }
  if (body.password) { sets.push(`password_hash = $${i++}`); values.push(await bcrypt.hash(body.password, 10)); }

  if (sets.length === 0) return NextResponse.json({ error: 'Nada para actualizar.' }, { status: 400 });

  values.push(id);
  const { rows } = await query(
    `UPDATE transportistas SET ${sets.join(', ')} WHERE id = $${i} RETURNING id, nombre, usuario, whatsapp, vehiculo, activo`,
    values
  );
  if (!rows[0]) return NextResponse.json({ error: 'Chofer no encontrado.' }, { status: 404 });
  return NextResponse.json({ chofer: rows[0] });
}
