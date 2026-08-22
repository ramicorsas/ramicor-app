import { NextResponse } from 'next/server';
import { getTransportistaSessionFromRequest } from '@/lib/auth';
import { listarPedidosTransportista } from '@/lib/pedidos';

export async function GET(req) {
  const session = await getTransportistaSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const pedidos = await listarPedidosTransportista(session.transportistaId);
  return NextResponse.json({ pedidos });
}
