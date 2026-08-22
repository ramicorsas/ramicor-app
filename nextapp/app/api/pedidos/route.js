import { NextResponse } from 'next/server';
import { crearPedido } from '@/lib/pedidos';

// POST público — reemplaza al form que antes escribía directo en el Sheet
// vía Apps Script. Cualquiera puede pedir un flete desde la landing.
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.nombre || !body?.telefono || !body?.tipoServicio) {
    return NextResponse.json({ error: 'Faltan datos obligatorios (nombre, teléfono, tipo de servicio).' }, { status: 400 });
  }

  const pedido = await crearPedido({
    nombre: body.nombre,
    telefono: body.telefono,
    email: body.email,
    tipoServicio: body.tipoServicio,
    origen: body.origen,
    destino: body.destino,
    descripcion: body.descripcion,
  });

  return NextResponse.json({ ok: true, codigo: pedido.codigo }, { status: 201 });
}
