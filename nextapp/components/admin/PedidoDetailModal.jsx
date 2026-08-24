'use client';
import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ds/Modal';
import { Button } from '@/components/ds/Button';
import { Badge } from '@/components/ds/Badge';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Tabs } from '@/components/ds/Tabs';
import { STATE_BADGE, formatMoneda, TIPOS_VEHICULO, ORDEN_VEHICULO } from '@/components/shared/constants';
import { ChatPedido } from '@/components/shared/ChatPedido';
import { ConfirmarPagoChofer, ComprobanteChofer } from '@/components/shared/ConfirmarPagoChofer';

const ES_PERSONA = (tipo) => tipo === 'Personas';

// El detalle completo del pedido desde el panel admin.
//
// Dos circuitos distintos según el tipo de servicio:
//   - Personas: se publica al pool y cualquier chofer disponible lo toma
//     (autoservicio, igual que siempre).
//   - Corporativo / Empresas / Utilitarios y Maquinas: operaciones más
//     grandes — el admin asigna un chofer puntual a mano, nunca se publica
//     al pool general.
//
// Y separado de todo eso, la plata: "cotizacion"+"Cobrado" es lo que le
// cobramos al CLIENTE (solo lo ve el admin). "monto_chofer" + su propia
// confirmación (o la del admin) es lo que le corresponde a ÉL — no tiene
// relación con la cotización total.
export function PedidoDetailModal({ pedido, onClose, onActualizado }) {
  const [tab, setTab] = useState('datos');
  const [cotizacion, setCotizacion] = useState(pedido?.cotizacion || '');
  const [origen, setOrigen] = useState(pedido?.origen || '');
  const [destino, setDestino] = useState(pedido?.destino || '');
  const [tipoVehiculo, setTipoVehiculo] = useState(pedido?.tipoVehiculo || '');
  const [pesoKg, setPesoKg] = useState(pedido?.pesoKg || '');
  const [montoChofer, setMontoChofer] = useState(pedido?.montoChofer || '');
  const [choferElegido, setChoferElegido] = useState('');
  const [choferes, setChoferes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const esPersona = pedido ? ES_PERSONA(pedido.tipoServicio) : true;

  useEffect(() => {
    if (!pedido || esPersona) return;
    fetch('/api/admin/choferes')
      .then((r) => r.json())
      .then((data) => setChoferes(data.choferes || []))
      .catch(() => {});
  }, [pedido?.dbId, esPersona]);

  if (!pedido) return null;

  async function patch(body) {
    setGuardando(true);
    setError(null);
    const res = await fetch(`/api/admin/pedidos/${pedido.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'No se pudo guardar.');
      return;
    }
    onActualizado?.();
  }

  function revisar() {
    patch({ accion: 'revisar' });
  }
  function guardarDatos() {
    patch({ accion: 'actualizarDatos', cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino, tipoVehiculo, pesoKg: Number(pesoKg) || null, montoChofer: Number(montoChofer) || null });
  }
  function confirmarYPublicar() {
    if (!tipoVehiculo) {
      setError('Elegí el tipo de vehículo requerido antes de publicar — es lo que filtra qué choferes lo ven.');
      return;
    }
    patch({ accion: 'verificar', cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino, tipoVehiculo, pesoKg: Number(pesoKg) || null, montoChofer: Number(montoChofer) || null });
  }
  function asignarChofer() {
    if (!choferElegido) {
      setError('Elegí qué chofer va a hacer este trabajo.');
      return;
    }
    patch({
      accion: 'asignarChofer', transportistaId: choferElegido,
      cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino, tipoVehiculo, pesoKg: Number(pesoKg) || null, montoChofer: Number(montoChofer) || null,
    });
  }
  function cambiarEstado(estado) {
    patch({ accion: 'cambiarEstado', estado });
  }
  function togglePagoChofer() {
    patch({ accion: 'marcarPagoChofer', confirmado: !pedido.choferPagoConfirmado });
  }
  function marcarPagado(metodo, comprobante) {
    patch({ accion: 'marcarPagoChofer', confirmado: true, metodo, comprobante });
  }

  const [tone, variant] = STATE_BADGE[pedido.estado] || ['neutral', 'soft'];

  // Choferes activos con capacidad suficiente para lo que pide este pedido
  // (si ya se eligió tipo de vehículo) — sugerencia inteligente, no restrictiva.
  const idxRequerido = tipoVehiculo ? ORDEN_VEHICULO.indexOf(tipoVehiculo) : -1;
  const choferesSugeridos = choferes.filter((c) => {
    if (!c.activo) return false;
    if (idxRequerido === -1 || !c.capacidad_vehiculo) return true;
    return ORDEN_VEHICULO.indexOf(c.capacidad_vehiculo) >= idxRequerido;
  });

  return (
    <Modal open onClose={onClose} title={`Pedido ${pedido.id}`} width={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Badge tone={tone} variant={variant}>{pedido.estado}</Badge>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pedido.clienteNombre} · {pedido.clienteTelefono}</span>
        {pedido.metodoPago && <Badge tone="neutral" variant="outline">Paga con: {pedido.metodoPago}</Badge>}
        {!esPersona && <Badge tone="warning" variant="soft">{pedido.tipoServicio} — asignación directa</Badge>}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'datos', label: 'Detalle del pedido' },
          { id: 'chat', label: 'Chat con transportista' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'datos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pedido.detalleExtra && Object.keys(pedido.detalleExtra).length > 0 && (
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 12, fontSize: 13 }}>
              {Object.entries(pedido.detalleExtra).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 4 }}><span style={{ color: 'var(--text-secondary)' }}>{k}:</span> <strong>{v}</strong></div>
              ))}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 13 }}>
            {pedido.tipoEnvio && <div><span style={{ color: 'var(--text-secondary)' }}>Tipo de envío</span><br /><strong>{pedido.tipoEnvio}</strong></div>}
            {pedido.pesoKg && <div><span style={{ color: 'var(--text-secondary)' }}>Peso</span><br /><strong>{pedido.pesoKg} kg</strong></div>}
            {pedido.tipoVehiculo && <div><span style={{ color: 'var(--text-secondary)' }}>Vehículo sugerido</span><br /><strong>{pedido.tipoVehiculo}</strong></div>}
          </div>
          {pedido.horarioRetiro && <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Horario de retiro:</span> {pedido.horarioRetiro}</p>}

          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Origen original:</span>{' '}
            {[pedido.origenCalle, pedido.origenAltura, pedido.origenBarrio].filter(Boolean).join(' ') || pedido.origen || '—'}
          </div>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Destino original:</span>{' '}
            {[pedido.destinoCalle, pedido.destinoAltura, pedido.destinoBarrio].filter(Boolean).join(' ') || pedido.destino || '—'}
          </div>
          {pedido.observaciones !== undefined && <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Observaciones:</span> {pedido.observaciones || '—'}</p>}
          {pedido.desc && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Detalle: {pedido.desc}</p>}

          {pedido.transportistaNombre && (
            <div style={{ background: 'var(--samply-blue-50)', border: '1px solid var(--samply-blue-100)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13 }}>
              🚛 Asignado a <strong>{pedido.transportistaNombre}</strong>
            </div>
          )}

          {/* Estado financiero — separado en dos, a propósito */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>Cliente → RAMICOR</div>
              <strong>{pedido.estado === 'Cobrado' ? '✅ Cobrado' : 'Pendiente'}</strong>
              {pedido.cobradoPor && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>por {pedido.cobradoPor.nombre}</div>}
            </div>
            <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>RAMICOR → Chofer</div>
              <strong>{pedido.choferPagoConfirmado ? '✅ Pagado' : 'Pendiente'}</strong>
              {pedido.montoChofer && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{formatMoneda(pedido.montoChofer)}</div>}
              {pedido.pagoChoferPor && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>por {pedido.pagoChoferPor.nombre}</div>}
              {pedido.choferPagoConfirmado && (
                <>
                  <div style={{ marginTop: 4 }}><ComprobanteChofer metodo={pedido.choferPagoMetodo} comprobante={pedido.choferPagoComprobante} /></div>
                  {pedido.transportistaNombre && (
                    <button onClick={togglePagoChofer} disabled={guardando} style={{
                      marginTop: 6, background: 'none', border: 'none', color: 'var(--samply-blue)',
                      cursor: 'pointer', fontSize: 12, padding: 0, textDecoration: 'underline',
                    }}>
                      Marcar como pendiente
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {pedido.transportistaNombre && !pedido.choferPagoConfirmado && (
            <ConfirmarPagoChofer onConfirm={marcarPagado} disabled={guardando} textoBoton="Marcar como pagado" />
          )}

          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}

          {/* Nuevo: todavía sin revisar */}
          {pedido.estado === 'Nuevo' && (
            <Button onClick={revisar} disabled={guardando}>Empezar a revisar</Button>
          )}

          {/* En proceso: cotizando / hablando con el cliente */}
          {pedido.estado === 'En proceso' && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {esPersona
                  ? 'Mientras hablás con el cliente, podés ir guardando estos datos. Todavía NO es visible para los choferes.'
                  : 'Esta operación no se publica al pool general — cuando esté todo cerrado, elegís vos qué chofer la hace.'}
              </p>
              <Input label="Origen (a publicar)" value={origen} onChange={(e) => setOrigen(e.target.value)} />
              <Input label="Destino (a publicar)" value={destino} onChange={(e) => setDestino(e.target.value)} />
              <Select label="Tipo de vehículo requerido" required value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)}
                options={TIPOS_VEHICULO} placeholder="Elegí una capacidad" />
              <Input label="Peso aproximado (kg, opcional)" type="number" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} />
              <Input label="Cotización al cliente (ARS)" type="number" value={cotizacion} onChange={(e) => setCotizacion(e.target.value)} />
              <Input label="Monto para el chofer (ARS, opcional)" type="number" value={montoChofer} onChange={(e) => setMontoChofer(e.target.value)} />

              {esPersona ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant="secondary" onClick={guardarDatos} disabled={guardando}>Guardar sin publicar</Button>
                  <Button onClick={confirmarYPublicar} disabled={guardando}>Cliente confirmó — publicar a choferes</Button>
                  <Button variant="danger" onClick={() => cambiarEstado('Cancelado')} disabled={guardando}>Cancelar pedido</Button>
                </div>
              ) : (
                <>
                  <Select label={`Chofer para asignar${tipoVehiculo ? ' (sugeridos según capacidad)' : ''}`} required
                    value={choferElegido} onChange={(e) => setChoferElegido(e.target.value)}
                    options={choferesSugeridos.map((c) => ({ value: String(c.id), label: `${c.nombre}${c.capacidad_vehiculo ? ` — ${c.capacidad_vehiculo}` : ''}` }))}
                    placeholder="Elegí un chofer" />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={guardarDatos} disabled={guardando}>Guardar sin asignar</Button>
                    <Button onClick={asignarChofer} disabled={guardando}>Confirmar y asignar chofer</Button>
                    <Button variant="danger" onClick={() => cambiarEstado('Cancelado')} disabled={guardando}>Cancelar pedido</Button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Resto de estados */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {pedido.estado === 'Tomado' && (
              <Button onClick={() => cambiarEstado('Completado')} disabled={guardando}>Marcar completado</Button>
            )}
            {pedido.estado === 'Completado' && (
              <Button onClick={() => cambiarEstado('Cobrado')} disabled={guardando}>Marcar cobrado (cliente → RAMICOR)</Button>
            )}
            {['Verificado', 'Tomado', 'Completado'].includes(pedido.estado) && (
              <Button variant="danger" onClick={() => cambiarEstado('Cancelado')} disabled={guardando}>Cancelar pedido</Button>
            )}
          </div>
        </div>
      )}

      {tab === 'chat' && <ChatPedido pedidoId={pedido.dbId} autorTipo="admin" />}
    </Modal>
  );
}
