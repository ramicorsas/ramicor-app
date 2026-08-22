import { NextResponse } from 'next/server';
import { getAdminSessionFromRequest, getTransportistaSessionFromRequest } from '@/lib/auth';
import { mensajesPedido, enviarMensajePedido, pedidoCompleto } from '@/lib/pedidos';

// Chat interno del pedido — lo puede usar tanto el admin como el
// transportista asignado. Se identifica solas por la cookie que traiga
// cada uno (mismo pedido, dos roles distintos), igual que el chat de
// respuestas en un ticket de Samply.
async function identificar(req, pedidoId) {
  const admin = await getAdminSessionFromRequest(req);
  if (admin) return { tipo: 'admin', id: admin.adminId, nombre: admin.nombre };

  const transportista = await getTransportistaSessionFromRequest(req);
  if (transportista) {
    const pedido = await pedidoCompleto(pedidoId);
    if (!pedido || pedido.transportista_id !== transportista.transportistaId) return null;
    return { tipo: 'transportista', id: transportista.transportistaId, nombre: transportista.nombre };
  }
  return null;
}

export async function GET(req, { params }) {
  const id = Number(params.id);
  const autor = await identificar(req, id);
  if (!autor) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const mensajes = await mensajesPedido(id);
  return NextResponse.json({ mensajes });
}

export async function POST(req, { params }) {
  const id = Number(params.id);
  const autor = await identificar(req, id);
  if (!autor) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  const { mensaje } = await req.json().catch(() => ({}));
  if (!mensaje?.trim()) return NextResponse.json({ error: 'Mensaje vacío.' }, { status: 400 });

  const guardado = await enviarMensajePedido(id, autor.tipo, autor.id, mensaje.trim());
  return NextResponse.json({ mensaje: guardado }, { status: 201 });
}
