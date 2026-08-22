import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { actualizarEstadoPostulacion } from '@/lib/postulaciones';

export async function PATCH(req, { params }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const { estado } = await req.json().catch(() => ({}));
  const postulacion = await actualizarEstadoPostulacion(Number(params.id), estado);
  if (!postulacion) return NextResponse.json({ error: 'No encontrada.' }, { status: 404 });
  return NextResponse.json({ postulacion });
}
