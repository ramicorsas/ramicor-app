import { query } from '@/db/client';
import { notificarNuevoPedido, notificarPedidoTomado } from './email';

// Select reusado por GET /api/admin/pedidos, GET /api/transportista/pedidos
// y el detalle de un pedido puntual — así todos devuelven la misma forma.
// Mismo patrón que TICKET_ADMIN_SELECT en Samply.
export const PEDIDO_SELECT = `
  p.id, p.codigo, p.tipo_servicio, p.origen, p.destino, p.descripcion,
  p.cotizacion, p.moneda, p.estado, p.fecha_creacion,
  p.verificado_en, p.tomado_en, p.completado_en, p.cobrado_en, p.cancelado_en,
  p.cliente_id, c.nombre AS cliente_nombre, c.telefono AS cliente_telefono,
  p.transportista_id, t.nombre AS transportista_nombre,
  (
    SELECT json_build_object(
      'tipo', h.autor_tipo,
      'nombre', CASE WHEN h.autor_tipo = 'admin' THEN adm.nombre
                     WHEN h.autor_tipo = 'transportista' THEN tr.nombre
                     ELSE 'Sistema' END
    )
    FROM pedidos_historial h
    LEFT JOIN admins adm ON h.autor_tipo = 'admin' AND adm.id = h.autor_id
    LEFT JOIN transportistas tr ON h.autor_tipo = 'transportista' AND tr.id = h.autor_id
    WHERE h.pedido_id = p.id AND h.campo = 'estado' AND h.valor_nuevo = 'Cobrado'
    ORDER BY h.fecha DESC LIMIT 1
  ) AS cobrado_por
`;

const PEDIDO_FROM = `
  FROM pedidos p
  JOIN clientes c ON c.id = p.cliente_id
  LEFT JOIN transportistas t ON t.id = p.transportista_id
`;

/** Genera el próximo código correlativo, ej. RAM-0001, RAM-0002... */
async function generarCodigo() {
  const { rows } = await query(`SELECT nextval(pg_get_serial_sequence('pedidos', 'id')) AS n`);
  return `RAM-${String(rows[0].n).padStart(4, '0')}`;
}

/** Crea un cliente si no existe (matchea por teléfono) y devuelve su id. */
async function upsertCliente({ nombre, telefono, email, tipo }) {
  const existente = await query(`SELECT id FROM clientes WHERE telefono = $1`, [telefono]);
  if (existente.rows[0]) return existente.rows[0].id;
  const { rows } = await query(
    `INSERT INTO clientes (nombre, telefono, email, tipo) VALUES ($1,$2,$3,$4) RETURNING id`,
    [nombre, telefono, email || null, tipo]
  );
  return rows[0].id;
}

/**
 * Crea un pedido nuevo directo desde la landing pública, estado "Nuevo".
 * Reemplaza lo que antes hacía el form -> Apps Script -> Sheet.
 */
export async function crearPedido({ nombre, telefono, email, tipoServicio, origen, destino, descripcion }) {
  const clienteId = await upsertCliente({ nombre, telefono, email, tipo: tipoServicio });
  const codigo = await generarCodigo();
  const { rows } = await query(
    `INSERT INTO pedidos (codigo, cliente_id, tipo_servicio, origen, destino, descripcion, estado)
     VALUES ($1,$2,$3,$4,$5,$6,'Nuevo') RETURNING id, codigo`,
    [codigo, clienteId, tipoServicio, origen || null, destino || null, descripcion || null]
  );
  await registrarHistorial(rows[0].id, 'estado', null, 'Nuevo', 'sistema', null);

  // Aviso a RAMICOR por mail — nunca tira abajo la creación del pedido si el
  // envío falla (mismo criterio que en Samply).
  notificarNuevoPedido(rows[0], nombre, telefono).catch((err) =>
    console.log('[email] No se notificó el pedido nuevo:', err.message)
  );

  return rows[0];
}

export async function registrarHistorial(pedidoId, campo, anterior, nuevo, autorTipo, autorId) {
  await query(
    `INSERT INTO pedidos_historial (pedido_id, campo, valor_anterior, valor_nuevo, autor_tipo, autor_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [pedidoId, campo, anterior != null ? String(anterior) : null, nuevo != null ? String(nuevo) : null, autorTipo, autorId || null]
  );
}

export async function pedidoCompleto(id) {
  const { rows } = await query(`SELECT ${PEDIDO_SELECT} ${PEDIDO_FROM} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

export async function listarPedidosAdmin() {
  const { rows } = await query(`SELECT ${PEDIDO_SELECT} ${PEDIDO_FROM} ORDER BY p.fecha_creacion DESC`);
  return rows;
}

/** Pedidos "Verificado" (disponibles para tomar) + los que ya tomó este transportista. */
export async function listarPedidosTransportista(transportistaId) {
  const { rows } = await query(
    `SELECT ${PEDIDO_SELECT} ${PEDIDO_FROM}
     WHERE p.estado = 'Verificado' OR p.transportista_id = $1
     ORDER BY p.fecha_creacion DESC`,
    [transportistaId]
  );
  return rows;
}

/**
 * Admin carga la cotización y los datos del viaje, y pasa el pedido a
 * "Verificado" para que quede disponible para los transportistas.
 */
export async function verificarPedido(id, { cotizacion, moneda, origen, destino }, adminId) {
  const anterior = await pedidoCompleto(id);
  await query(
    `UPDATE pedidos
     SET cotizacion = $1, moneda = COALESCE($2, moneda), origen = COALESCE($3, origen),
         destino = COALESCE($4, destino), estado = 'Verificado', verificado_en = now(), updated_at = now()
     WHERE id = $5`,
    [cotizacion, moneda, origen, destino, id]
  );
  await registrarHistorial(id, 'estado', anterior.estado, 'Verificado', 'admin', adminId);
  return pedidoCompleto(id);
}

/** Transportista toma un pedido "Verificado" — queda bloqueado para los demás. */
export async function tomarPedido(id, transportistaId) {
  const { rows } = await query(
    `UPDATE pedidos SET estado = 'Tomado', transportista_id = $1, tomado_en = now(), updated_at = now()
     WHERE id = $2 AND estado = 'Verificado' RETURNING id`,
    [transportistaId, id]
  );
  if (!rows[0]) return null; // ya lo había tomado otro — condición de carrera
  await registrarHistorial(id, 'estado', 'Verificado', 'Tomado', 'transportista', transportistaId);

  const pedido = await pedidoCompleto(id);
  notificarPedidoTomado(pedido, pedido.transportista_nombre).catch((err) =>
    console.log('[email] No se notificó la asignación:', err.message)
  );

  return pedido;
}

/** Cambia el estado a Completado, Cobrado o Cancelado. */
export async function cambiarEstadoPedido(id, nuevoEstado, autorTipo, autorId) {
  const anterior = await pedidoCompleto(id);
  const columnaFecha = { Completado: 'completado_en', Cobrado: 'cobrado_en', Cancelado: 'cancelado_en' }[nuevoEstado];
  const setFecha = columnaFecha ? `, ${columnaFecha} = now()` : '';
  await query(`UPDATE pedidos SET estado = $1, updated_at = now() ${setFecha} WHERE id = $2`, [nuevoEstado, id]);
  await registrarHistorial(id, 'estado', anterior.estado, nuevoEstado, autorTipo, autorId);
  return pedidoCompleto(id);
}

export async function historialPedido(id) {
  const { rows } = await query(
    `SELECT id, campo, valor_anterior, valor_nuevo, autor_tipo, autor_id, fecha
     FROM pedidos_historial WHERE pedido_id = $1 ORDER BY fecha ASC`,
    [id]
  );
  return rows;
}

// ── Chat interno (admin ⇄ transportista) ────────────────────────────────
export async function mensajesPedido(id) {
  const { rows } = await query(
    `SELECT id, autor_tipo, autor_id, mensaje, fecha FROM pedidos_mensajes
     WHERE pedido_id = $1 ORDER BY fecha ASC`,
    [id]
  );
  return rows;
}

export async function enviarMensajePedido(id, autorTipo, autorId, mensaje) {
  const { rows } = await query(
    `INSERT INTO pedidos_mensajes (pedido_id, autor_tipo, autor_id, mensaje)
     VALUES ($1,$2,$3,$4) RETURNING id, autor_tipo, autor_id, mensaje, fecha`,
    [id, autorTipo, autorId, mensaje]
  );
  return rows[0];
}
