'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { IconButton } from '@/components/ds/IconButton';
import { Modal } from '@/components/ds/Modal';
import { Tabs } from '@/components/ds/Tabs';
import { mapPedido, STATE_BADGE, formatMoneda } from '@/components/shared/constants';
import { ChatPedido } from '@/components/shared/ChatPedido';
import { ConfirmarPagoChofer, ComprobanteChofer } from '@/components/shared/ConfirmarPagoChofer';

// El chofer NUNCA ve "cotizacion" (eso es lo que le cobramos al cliente,
// información interna del admin). Solo ve su propio monto y el método de
// pago del cliente, como referencia operativa (ej. si es efectivo, va a
// tener que coordinar el cobro en el momento).
function DetallePedido({ p, mostrarCliente }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
      {mostrarCliente && (p.clienteNombre || p.clienteTelefono) && (
        <div style={{ background: 'var(--samply-blue-50)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginBottom: 2 }}>Contacto del cliente</div>
          <strong>{p.clienteNombre || '—'}</strong>{p.clienteTelefono && <span> · {p.clienteTelefono}</span>}
        </div>
      )}
      <p style={{ margin: 0 }}>
        <strong>{p.origen || '—'} → {p.destino || '—'}</strong>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Badge tone="success" variant="soft">Tu pago: {p.montoChofer ? formatMoneda(p.montoChofer) : 'a coordinar'}</Badge>
        {p.metodoPago && <Badge tone="neutral" variant="outline">Cliente paga: {p.metodoPago}</Badge>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {p.tipoEnvio && <div><span style={{ color: 'var(--text-secondary)' }}>Tipo de envío</span><br /><strong>{p.tipoEnvio}</strong></div>}
        {p.pesoKg && <div><span style={{ color: 'var(--text-secondary)' }}>Peso</span><br /><strong>{p.pesoKg} kg</strong></div>}
        {p.tipoVehiculo && <div><span style={{ color: 'var(--text-secondary)' }}>Vehículo requerido</span><br /><strong>{p.tipoVehiculo}</strong></div>}
      </div>
      {p.horarioRetiro && <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Horario de retiro:</span> {p.horarioRetiro}</p>}
      <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Observaciones:</span> {p.observaciones || '—'}</p>
      {p.desc && <p style={{ margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Detalle:</span> {p.desc}</p>}
      {p.detalleExtra && Object.keys(p.detalleExtra).length > 0 && (
        <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
          {Object.entries(p.detalleExtra).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 2 }}><span style={{ color: 'var(--text-secondary)' }}>{k}:</span> <strong>{v}</strong></div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TransportistaPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [previsualizado, setPrevisualizado] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [tab, setTab] = useState('disponibles');

  async function cargar() {
    setCargando(true);
    const res = await fetch('/api/transportista/pedidos');
    if (res.ok) {
      const data = await res.json();
      setPedidos((data.pedidos || []).map(mapPedido));
    }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function tomar(p) {
    const res = await fetch(`/api/transportista/pedidos/${p.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'tomar' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setAviso(data.error || 'No se pudo tomar el pedido.');
    }
    setPrevisualizado(null);
    cargar();
  }

  async function completar(p) {
    await fetch(`/api/transportista/pedidos/${p.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'completar' }),
    });
    setSeleccionado(null);
    cargar();
  }

  async function confirmarPago(p, metodo, comprobante) {
    await fetch(`/api/transportista/pedidos/${p.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'confirmarPago', metodo, comprobante }),
    });
    setSeleccionado(null);
    cargar();
  }

  const disponibles = pedidos.filter((p) => p.estado === 'Verificado');
  const propios = pedidos.filter((p) => p.transportistaId != null);
  // Activos: todavía hay algo pendiente (entregar, o RAMICOR le debe pagar).
  const activos = propios.filter((p) => p.estado !== 'Cancelado' && !p.choferPagoConfirmado);
  // Finalizados: ya cobró su parte, o el pedido se canceló (no hay nada más que hacer).
  const finalizados = propios.filter((p) => p.estado === 'Cancelado' || p.choferPagoConfirmado);

  const reporte = useMemo(() => {
    const pendientesEntrega = propios.filter((p) => p.estado === 'Tomado').length;
    const entregados = propios.filter((p) => ['Completado', 'Cobrado'].includes(p.estado)).length;
    const pagosConfirmados = propios.filter((p) => p.choferPagoConfirmado).length;
    const totalCobrado = propios.filter((p) => p.choferPagoConfirmado).reduce((acc, p) => acc + (Number(p.montoChofer) || 0), 0);
    return { pendientesEntrega, entregados, pagosConfirmados, totalCobrado, total: propios.length };
  }, [propios]);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Panel de transportista</h1>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'disponibles', label: `Pedidos disponibles (${disponibles.length})` },
          { id: 'mios', label: `Mis pedidos (${activos.length})` },
          { id: 'reporte', label: 'Reporte' },
        ]}
        style={{ marginBottom: 20 }}
      />

      {aviso && <p style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{aviso}</p>}

      {tab === 'disponibles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0, fontSize: 13 }}>Tocá el ícono para ver el detalle antes de tomar. Se bloquea para los demás apenas lo tomás.</p>
          {!cargando && disponibles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay pedidos disponibles ahora.</p>}
          {disponibles.map((p) => (
            <Card key={p.dbId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{p.id}</strong> · {p.tipoServicio} · {p.origen || '—'} → {p.destino || '—'}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {p.montoChofer ? `Tu pago: ${formatMoneda(p.montoChofer)}` : 'Pago a coordinar'}
                  {p.tipoVehiculo ? ` · Requiere: ${p.tipoVehiculo}` : ''}
                  {p.tipoEnvio ? ` · ${p.tipoEnvio}` : ''}
                  {p.pesoKg ? ` · ${p.pesoKg}kg` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <IconButton icon="eye" title="Ver detalle" onClick={() => setPrevisualizado(p)} />
                <Button onClick={() => tomar(p)}>Tomar pedido</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'mios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!cargando && activos.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No tenés pedidos activos ahora — los finalizados quedan en "Reporte".</p>}
          {activos.map((p) => {
            const [tone, variant] = STATE_BADGE[p.estado] || ['neutral', 'soft'];
            const pendienteEntrega = p.estado === 'Tomado';
            return (
              <Card key={p.dbId} interactive onClick={() => setSeleccionado(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{p.id}</strong> · {p.origen || '—'} → {p.destino || '—'}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.montoChofer ? formatMoneda(p.montoChofer) : 'Pago a coordinar'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {pendienteEntrega && <Badge tone="warning" variant="soft">Pendiente de entrega</Badge>}
                  {!pendienteEntrega && !p.choferPagoConfirmado && <Badge tone="warning" variant="soft">Pago pendiente</Badge>}
                  <Badge tone={tone} variant={variant}>{p.estado}</Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'reporte' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total tomados', value: reporte.total },
              { label: 'Pendientes de entrega', value: reporte.pendientesEntrega },
              { label: 'Entregados', value: reporte.entregados },
              { label: 'Pagos confirmados', value: reporte.pagosConfirmados },
              { label: 'Total cobrado', value: formatMoneda(reporte.totalCobrado) },
            ].map((k) => (
              <div key={k.label} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--samply-navy)' }}>{k.value}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 16, marginBottom: 10 }}>Pedidos finalizados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {finalizados.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Todavía no tenés pedidos finalizados.</p>}
            {finalizados.map((p) => {
              const [tone, variant] = STATE_BADGE[p.estado] || ['neutral', 'soft'];
              return (
                <Card key={p.dbId} interactive onClick={() => setSeleccionado(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{p.id}</strong> · {p.origen || '—'} → {p.destino || '—'}
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.montoChofer ? formatMoneda(p.montoChofer) : '—'}</div>
                  </div>
                  <Badge tone="success" variant="soft">Pago recibido</Badge>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Ver detalle ANTES de tomar */}
      {previsualizado && (
        <Modal open onClose={() => setPrevisualizado(null)} title={`Pedido ${previsualizado.id}`} width={520}>
          <DetallePedido p={previsualizado} mostrarCliente={false} />
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => tomar(previsualizado)}>Tomar pedido</Button>
          </div>
        </Modal>
      )}

      {/* Detalle + chat DESPUÉS de tomar */}
      {seleccionado && (
        <Modal open onClose={() => setSeleccionado(null)} title={`Pedido ${seleccionado.id}`} width={520}>
          <DetallePedido p={seleccionado} mostrarCliente={true} />
          <div style={{ marginTop: 16 }}>
            <ChatPedido pedidoId={seleccionado.dbId} autorTipo="transportista" />
          </div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
            {seleccionado.estado === 'Tomado' && (
              <Button onClick={() => completar(seleccionado)}>Marcar como entregado</Button>
            )}
            {!seleccionado.choferPagoConfirmado && (
              <ConfirmarPagoChofer onConfirm={(metodo, comprobante) => confirmarPago(seleccionado, metodo, comprobante)} />
            )}
            {seleccionado.choferPagoConfirmado && (
              <div>
                <Badge tone="success" variant="soft">✅ Ya cobraste este viaje</Badge>
                <div style={{ marginTop: 6 }}>
                  <ComprobanteChofer metodo={seleccionado.choferPagoMetodo} comprobante={seleccionado.choferPagoComprobante} />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
