import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { listarPostulaciones } from '@/lib/postulaciones';

export async function GET(req) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const postulaciones = await listarPostulaciones();
  return NextResponse.json({ postulaciones });
}
