import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { verificarPedido, cambiarEstadoPedido, pedidoCompleto, iniciarRevision, actualizarDatosPedido, asignarChoferDirecto, marcarPagoChofer } from '@/lib/pedidos';

// PATCH — acciones posibles desde el panel admin:
//   1) { accion: 'revisar' } -> pasa el pedido de "Nuevo" a "En proceso"
//   2) { accion: 'actualizarDatos', ... } -> guarda cambios sin cambiar de estado
//   3) { accion: 'verificar', ... } -> PERSONAS: publica al pool de choferes
//   4) { accion: 'asignarChofer', transportistaId, ... } -> CORPORATIVO / EMPRESAS /
//      UTILITARIOS: asigna directo a un chofer puntual, sin pasar por el pool
//   5) { accion: 'cambiarEstado', estado: 'Completado'|'Cobrado'|'Cancelado' }
//   6) { accion: 'marcarPagoChofer', confirmado: true|false } -> el admin marca
//      (o desmarca) si ya le pagó al chofer, sin depender de que él lo confirme
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
      tipoVehiculo: body.tipoVehiculo, pesoKg: body.pesoKg, montoChofer: body.montoChofer,
    });
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'verificar') {
    const pedido = await verificarPedido(
      id,
      { cotizacion: body.cotizacion, moneda: body.moneda, origen: body.origen, destino: body.destino, tipoVehiculo: body.tipoVehiculo, pesoKg: body.pesoKg, montoChofer: body.montoChofer },
      session.adminId
    );
    return NextResponse.json({ pedido });
  }

  if (body.accion === 'asignarChofer') {
    if (!body.transportistaId) {
      return NextResponse.json({ error: 'Elegí un chofer para asignar.' }, { status: 400 });
    }
    const pedido = await asignarChoferDirecto(
      id, Number(body.transportistaId),
      { cotizacion: body.cotizacion, moneda: body.moneda, origen: body.origen, destino: body.destino, tipoVehiculo: body.tipoVehiculo, pesoKg: body.pesoKg, montoChofer: body.montoChofer },
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

  if (body.accion === 'marcarPagoChofer') {
    const pedido = await marcarPagoChofer(id, !!body.confirmado, 'admin', session.adminId, { metodo: body.metodo, comprobante: body.comprobante });
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
