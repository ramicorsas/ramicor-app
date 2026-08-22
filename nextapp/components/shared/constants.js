// RAMICOR — constantes compartidas entre panel admin y panel transportista.
// Mismo patrón que components/support/constants.js en Samply.

export const TIPOS_SERVICIO = ['Personas', 'Corporativo', 'Empresas', 'Utilitarios y Maquinas'];

export const ESTADOS = ['Nuevo', 'Verificado', 'Tomado', 'Completado', 'Cobrado', 'Cancelado'];

export const STATE_BADGE = {
  Nuevo: ['neutral', 'soft'],
  Verificado: ['info', 'soft'],
  Tomado: ['info', 'solid'],
  Completado: ['success', 'soft'],
  Cobrado: ['success', 'solid'],
  Cancelado: ['danger', 'outline'],
};

export function formatFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatFechaHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function formatMoneda(valor, moneda = 'ARS') {
  if (valor == null) return '—';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: moneda }).format(valor);
}

/** Mapea el pedido tal como viene de la API (campos en castellano de la DB)
 *  a la forma que espera la UI. */
export function mapPedido(p) {
  return {
    dbId: p.id,
    id: p.codigo,
    tipoServicio: p.tipo_servicio,
    origen: p.origen,
    destino: p.destino,
    desc: p.descripcion || '',
    cotizacion: p.cotizacion,
    moneda: p.moneda,
    estado: p.estado,
    fecha: formatFecha(p.fecha_creacion),
    fechaCreacionRaw: p.fecha_creacion,
    clienteId: p.cliente_id,
    clienteNombre: p.cliente_nombre,
    clienteTelefono: p.cliente_telefono,
    transportistaId: p.transportista_id,
    transportistaNombre: p.transportista_nombre,
    cobradoPor: p.cobrado_por || null, // { tipo: 'admin'|'transportista', nombre }
  };
}
