import { query } from '@/db/client';
import { notificarNuevoPedido, notificarPedidoTomado } from './email';

// Select reusado por GET /api/admin/pedidos, GET /api/transportista/pedidos
// y el detalle de un pedido puntual — así todos devuelven la misma forma.
// Mismo patrón que TICKET_ADMIN_SELECT en Samply.
export const PEDIDO_SELECT = `
  p.id, p.codigo, p.tipo_servicio, p.origen, p.destino, p.descripcion,
  p.cotizacion, p.moneda, p.estado, p.fecha_creacion,
  p.verificado_en, p.tomado_en, p.completado_en, p.cobrado_en, p.cancelado_en,
  p.peso_kg, p.tipo_envio, p.tipo_vehiculo, p.horario_retiro,
  p.origen_calle, p.origen_altura, p.origen_barrio,
  p.destino_calle, p.destino_altura, p.destino_barrio, p.observaciones,
  p.detalle_extra, p.metodo_pago, p.monto_chofer, p.chofer_pago_confirmado, p.chofer_pago_confirmado_en,
  p.chofer_pago_metodo, p.chofer_pago_comprobante,
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
  ) AS cobrado_por,
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
    WHERE h.pedido_id = p.id AND h.campo = 'pago_chofer' AND h.valor_nuevo = 'Confirmado'
    ORDER BY h.fecha DESC LIMIT 1
  ) AS pago_chofer_por
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
  if (existente.rows[0]) {
    // Actualiza siempre con los datos más recientes — si alguien pide un
    // flete de nuevo con el mismo teléfono pero puso mal el nombre la
    // primera vez, o cambió de tipo de cliente, no queda pegado el dato viejo.
    await query(
      `UPDATE clientes SET nombre = $1, email = COALESCE($2, email), tipo = $3 WHERE id = $4`,
      [nombre, email || null, tipo, existente.rows[0].id]
    );
    return existente.rows[0].id;
  }
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
export async function crearPedido(datos) {
  const {
    nombre, telefono, email, tipoServicio, descripcion,
    pesoKg, tipoEnvio, tipoVehiculo, horarioRetiro,
    origenCalle, origenAltura, origenBarrio,
    destinoCalle, destinoAltura, destinoBarrio, observaciones,
    detalleExtra, metodoPago,
  } = datos;
  const clienteId = await upsertCliente({ nombre, telefono, email, tipo: tipoServicio });
  const codigo = await generarCodigo();
  const origen = [origenCalle, origenAltura, origenBarrio].filter(Boolean).join(' ');
  const destino = [destinoCalle, destinoAltura, destinoBarrio].filter(Boolean).join(' ');
  const { rows } = await query(
    `INSERT INTO pedidos (
       codigo, cliente_id, tipo_servicio, origen, destino, descripcion, estado,
       peso_kg, tipo_envio, tipo_vehiculo, horario_retiro,
       origen_calle, origen_altura, origen_barrio,
       destino_calle, destino_altura, destino_barrio, observaciones, detalle_extra, metodo_pago
     )
     VALUES ($1,$2,$3,$4,$5,$6,'Nuevo',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     RETURNING id, codigo`,
    [
      codigo, clienteId, tipoServicio, origen || null, destino || null, descripcion || null,
      pesoKg || null, tipoEnvio || null, tipoVehiculo || null, horarioRetiro || null,
      origenCalle || null, origenAltura || null, origenBarrio || null,
      destinoCalle || null, destinoAltura || null, destinoBarrio || null, observaciones || null,
      detalleExtra ? JSON.stringify(detalleExtra) : null, metodoPago || null,
    ]
  );
  await registrarHistorial(rows[0].id, 'estado', null, 'Nuevo', 'sistema', null);

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

const ORDEN_VEHICULO = ['Hasta 500 kg', '500 kg - 1.5 ton', '1.5 - 3 ton', '3 - 10 ton', 'Mas de 10 ton'];

/** Pedidos "Verificado" (disponibles para tomar, filtrados por capacidad del
 *  vehículo del chofer) + los que ya tomó este transportista. Si el pedido
 *  no tiene tipo_vehiculo cargado, o el chofer no tiene capacidad declarada,
 *  se muestra igual (fallback permisivo para no esconder pedidos por datos
 *  faltantes). */
export async function listarPedidosTransportista(transportistaId) {
  const { rows: choferRows } = await query(`SELECT capacidad_vehiculo FROM transportistas WHERE id = $1`, [transportistaId]);
  const capacidad = choferRows[0]?.capacidad_vehiculo || null;
  const idxCapacidad = capacidad ? ORDEN_VEHICULO.indexOf(capacidad) : -1;

  const { rows } = await query(
    `SELECT ${PEDIDO_SELECT} ${PEDIDO_FROM}
     WHERE p.estado = 'Verificado' OR p.transportista_id = $1
     ORDER BY p.fecha_creacion DESC`,
    [transportistaId]
  );

  return rows.filter((r) => {
    if (r.transportista_id === transportistaId) return true; // siempre ve lo suyo
    if (r.estado !== 'Verificado') return true;
    if (!r.tipo_vehiculo || idxCapacidad === -1) return true; // dato incompleto -> no se esconde
    const idxRequerido = ORDEN_VEHICULO.indexOf(r.tipo_vehiculo);
    if (idxRequerido === -1) return true;
    return idxCapacidad >= idxRequerido; // el camión del chofer alcanza
  });
}

/**
 * Admin empieza a revisar un pedido "Nuevo" — lo pasa a "En proceso" mientras
 * cotiza y habla con el cliente. Todavía NO es visible para los choferes.
 */
export async function iniciarRevision(id, adminId) {
  const anterior = await pedidoCompleto(id);
  await query(
    `UPDATE pedidos SET estado = 'En proceso', updated_at = now() WHERE id = $1 AND estado = 'Nuevo'`,
    [id]
  );
  await registrarHistorial(id, 'estado', anterior.estado, 'En proceso', 'admin', adminId);
  return pedidoCompleto(id);
}

/**
 * Guarda cotización/origen/destino mientras el pedido sigue "En proceso"
 * (sin cambiar de estado) — para ir ajustando datos mientras se habla con
 * el cliente, antes de que confirme.
 */
export async function actualizarDatosPedido(id, { cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer }) {
  await query(
    `UPDATE pedidos
     SET cotizacion = COALESCE($1, cotizacion), moneda = COALESCE($2, moneda),
         origen = COALESCE($3, origen), destino = COALESCE($4, destino),
         tipo_vehiculo = COALESCE($5, tipo_vehiculo), peso_kg = COALESCE($6, peso_kg),
         monto_chofer = COALESCE($7, monto_chofer), updated_at = now()
     WHERE id = $8`,
    [cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer, id]
  );
  return pedidoCompleto(id);
}

/**
 * El cliente confirmó: pasa el pedido a "Verificado" y ahí sí queda
 * disponible para los transportistas cuyo vehículo alcance.
 */
export async function verificarPedido(id, { cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer }, adminId) {
  const anterior = await pedidoCompleto(id);
  await query(
    `UPDATE pedidos
     SET cotizacion = COALESCE($1, cotizacion), moneda = COALESCE($2, moneda), origen = COALESCE($3, origen),
         destino = COALESCE($4, destino), tipo_vehiculo = COALESCE($5, tipo_vehiculo), peso_kg = COALESCE($6, peso_kg),
         monto_chofer = COALESCE($7, monto_chofer),
         estado = 'Verificado', verificado_en = now(), updated_at = now()
     WHERE id = $8`,
    [cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer, id]
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

/**
 * Para Corporativo / Empresas / Utilitarios y Maquinas — operaciones más
 * grandes que el admin negocia y asigna a mano, NUNCA se publican al pool
 * general de choferes (nunca pasan por "Verificado"). El admin elige un
 * chofer puntual y el pedido pasa directo a "Tomado", saltando el paso de
 * autoservicio que sí usa Personas.
 */
export async function asignarChoferDirecto(id, transportistaId, { cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer }, adminId) {
  const anterior = await pedidoCompleto(id);
  await query(
    `UPDATE pedidos
     SET cotizacion = COALESCE($1, cotizacion), moneda = COALESCE($2, moneda), origen = COALESCE($3, origen),
         destino = COALESCE($4, destino), tipo_vehiculo = COALESCE($5, tipo_vehiculo), peso_kg = COALESCE($6, peso_kg),
         monto_chofer = COALESCE($7, monto_chofer),
         transportista_id = $8, estado = 'Tomado', verificado_en = now(), tomado_en = now(), updated_at = now()
     WHERE id = $9`,
    [cotizacion, moneda, origen, destino, tipoVehiculo, pesoKg, montoChofer, transportistaId, id]
  );
  await registrarHistorial(id, 'estado', anterior.estado, 'Tomado', 'admin', adminId);

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

/**
 * El CHOFER confirma que ya recibió su pago (monto_chofer) de parte de
 * RAMICOR. Totalmente independiente del estado "Cobrado" del pedido, que
 * es información interna del admin sobre si el CLIENTE le pagó a RAMICOR.
 * Un chofer no puede tocar esto de otro pedido que no sea suyo.
 */
export async function confirmarPagoChofer(id, transportistaId, extra = {}) {
  const actual = await pedidoCompleto(id);
  if (!actual || actual.transportista_id !== transportistaId) return null;
  return marcarPagoChofer(id, true, 'transportista', transportistaId, extra);
}

/**
 * El ADMIN marca (o desmarca) el pago al chofer — para cuando le paga en
 * mano y no depende de que el chofer entre a confirmarlo desde su panel.
 * Mismo campo que usa confirmarPagoChofer, pero sin restricción de dueño.
 * `extra` puede traer { metodo, comprobante } — comprobante es una imagen
 * o PDF en base64 (data URI), guardado tal cual, sin storage externo.
 */
export async function marcarPagoChofer(id, confirmado, autorTipo, autorId, extra = {}) {
  const anterior = await pedidoCompleto(id);
  const { metodo, comprobante } = extra;
  await query(
    `UPDATE pedidos
     SET chofer_pago_confirmado = $1, chofer_pago_confirmado_en = ${confirmado ? 'now()' : 'NULL'},
         chofer_pago_metodo = COALESCE($2, chofer_pago_metodo),
         chofer_pago_comprobante = COALESCE($3, chofer_pago_comprobante),
         updated_at = now()
     WHERE id = $4`,
    [confirmado, metodo || null, comprobante || null, id]
  );
  await registrarHistorial(
    id, 'pago_chofer',
    anterior.chofer_pago_confirmado ? 'Confirmado' : 'Pendiente',
    confirmado ? 'Confirmado' : 'Pendiente',
    autorTipo, autorId
  );
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
