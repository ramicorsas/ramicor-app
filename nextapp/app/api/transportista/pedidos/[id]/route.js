import { NextResponse } from 'next/server';
import { getTransportistaSessionFromRequest } from '@/lib/auth';
import { tomarPedido, cambiarEstadoPedido, pedidoCompleto, confirmarPagoChofer } from '@/lib/pedidos';

// PATCH — acciones desde el panel del transportista:
//   1) { accion: 'tomar' }         -> pasa el pedido de Verificado a Tomado
//   2) { accion: 'completar' }     -> pasa el pedido a Completado (entregado)
//   3) { accion: 'confirmarPago' } -> el CHOFER confirma que YA recibió su
//      propio pago de RAMICOR (monto_chofer). No tiene nada que ver con el
//      "Cobrado" que usa el admin para llevar la cuenta de si el cliente
//      le pagó a RAMICOR — son dos cosas separadas a propósito.
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

  if (body.accion === 'confirmarPago') {
    const pedido = await confirmarPagoChofer(id, session.transportistaId, { metodo: body.metodo, comprobante: body.comprobante });
    if (!pedido) {
      return NextResponse.json({ error: 'No autorizado sobre este pedido.' }, { status: 403 });
    }
    return NextResponse.json({ pedido });
  }

  return NextResponse.json({ error: 'Acción no reconocida.' }, { status: 400 });
}
