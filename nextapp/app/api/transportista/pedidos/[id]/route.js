import { NextResponse } from 'next/server';
import { getTransportistaSessionFromRequest } from '@/lib/auth';
import { tomarPedido, cambiarEstadoPedido, pedidoCompleto } from '@/lib/pedidos';

// PATCH — dos acciones desde el panel del transportista:
//   1) { accion: 'tomar' }     -> pasa el pedido de Verificado a Tomado
//   2) { accion: 'completar' } -> pasa el pedido a Completado
export async function PATCH(req, { params }) {
  const session = await getTransportistaSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  if (body.accion === 'tomar') {
    const pedido = await tomarPedido(id, session.transportistaId);
    if (!pedido) {
      return NextResponse.json({ error: 'Este pedido ya fue tomado por otro transportista.' }, { status: 409 });
    }
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'completar') {
    const actual = await pedidoCompleto(id);
    if (!actual || actual.transportista_id !== session.transportistaId) {
      return NextResponse.json({ error: 'No autorizado sobre este pedido.' }, { status: 403 });
    }
    const pedido = await cambiarEstadoPedido(id, 'Completado', 'transportista', session.transportistaId);
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'cobrar') {
    const actual = await pedidoCompleto(id);
    if (!actual || actual.transportista_id !== session.transportistaId) {
      return NextResponse.json({ error: 'No autorizado sobre este pedido.' }, { status: 403 });
    }
    const pedido = await cambiarEstadoPedido(id, 'Cobrado', 'transportista', session.transportistaId);
    return NextResponse.json({ pedido });
  }

  return NextResponse.json({ error: 'Acción no reconocida.' }, { status: 400 });
}
