import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { verificarPedido, cambiarEstadoPedido, pedidoCompleto } from '@/lib/pedidos';

// PATCH — dos acciones posibles desde el panel admin:
//   1) { accion: 'verificar', cotizacion, moneda, origen, destino } -> cotiza
//      el pedido y lo hace visible para los transportistas.
//   2) { accion: 'cambiarEstado', estado: 'Completado'|'Cobrado'|'Cancelado' }
export async function PATCH(req, { params }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  if (body.accion === 'verificar') {
    const pedido = await verificarPedido(
      id,
      { cotizacion: body.cotizacion, moneda: body.moneda, origen: body.origen, destino: body.destino },
      session.adminId
    );
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'cambiarEstado') {
    if (!['Completado', 'Cobrado', 'Cancelado'].includes(body.estado)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
    }
    const pedido = await cambiarEstadoPedido(id, body.estado, 'admin', session.adminId);
    return NextResponse.json({ pedido });
  }

  return NextResponse.json({ error: 'Acción no reconocida.' }, { status: 400 });
}

export async function GET(req, { params }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  const pedido = await pedidoCompleto(Number(params.id));
  if (!pedido) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  return NextResponse.json({ pedido });
}
