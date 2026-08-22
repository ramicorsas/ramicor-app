import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { listarPedidosAdmin } from '@/lib/pedidos';

export async function GET(req) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const pedidos = await listarPedidosAdmin();
  return NextResponse.json({ pedidos });
}
