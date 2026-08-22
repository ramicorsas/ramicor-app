import { NextResponse } from 'next/server';
import { crearPostulacion } from '@/lib/postulaciones';

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.nombre || !body?.telefono) {
    return NextResponse.json({ error: 'Nombre y teléfono son obligatorios.' }, { status: 400 });
  }
  await crearPostulacion(body);
  return NextResponse.json({ ok: true }, { status: 201 });
}
