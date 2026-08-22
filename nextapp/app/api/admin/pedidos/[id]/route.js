import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { verificarPedido, cambiarEstadoPedido, pedidoCompleto, iniciarRevision, actualizarDatosPedido } from '@/lib/pedidos';

// PATCH — acciones posibles desde el panel admin:
//   1) { accion: 'revisar' } -> pasa el pedido de "Nuevo" a "En proceso"
//      (todavía no es visible para los choferes).
//   2) { accion: 'actualizarDatos', cotizacion, moneda, origen, destino } ->
//      guarda cambios mientras el pedido sigue "En proceso", sin cambiar de estado.
//   3) { accion: 'verificar', cotizacion, moneda, origen, destino } -> el
//      cliente confirmó: pasa a "Verificado" y ahí sí queda visible para los choferes.
//   4) { accion: 'cambiarEstado', estado: 'Completado'|'Cobrado'|'Cancelado' }
export async function PATCH(req, { params }) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const id = Number(params.id);
  const body = await req.json().catch(() => ({}));

  if (body.accion === 'revisar') {
    const pedido = await iniciarRevision(id, session.adminId);
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'actualizarDatos') {
    const pedido = await actualizarDatosPedido(id, {
      cotizacion: body.cotizacion, moneda: body.moneda, origen: body.origen, destino: body.destino,
      tipoVehiculo: body.tipoVehiculo, pesoKg: body.pesoKg,
    });
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'verificar') {
    const pedido = await verificarPedido(
      id,
      { cotizacion: body.cotizacion, moneda: body.moneda, origen: body.origen, destino: body.destino, tipoVehiculo: body.tipoVehiculo, pesoKg: body.pesoKg },
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
