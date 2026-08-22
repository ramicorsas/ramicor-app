'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ds/Modal';
import { Button } from '@/components/ds/Button';
import { Badge } from '@/components/ds/Badge';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Tabs } from '@/components/ds/Tabs';
import { STATE_BADGE, formatMoneda, TIPOS_VEHICULO } from '@/components/shared/constants';
import { ChatPedido } from '@/components/shared/ChatPedido';

// El detalle completo del pedido desde el panel admin.
// Flujo de estados relevante acá:
//   Nuevo -> (revisar) -> En proceso -> (cliente confirma) -> Verificado (ya visible a choferes)
export function PedidoDetailModal({ pedido, onClose, onActualizado }) {
  const [tab, setTab] = useState('datos');
  const [cotizacion, setCotizacion] = useState(pedido?.cotizacion || '');
  const [origen, setOrigen] = useState(pedido?.origen || '');
  const [destino, setDestino] = useState(pedido?.destino || '');
  const [tipoVehiculo, setTipoVehiculo] = useState(pedido?.tipoVehiculo || '');
  const [pesoKg, setPesoKg] = useState(pedido?.pesoKg || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

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
    patch({ accion: 'actualizarDatos', cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino, tipoVehiculo, pesoKg: Number(pesoKg) || null });
  }
  function confirmarYPublicar() {
    if (!tipoVehiculo) {
      setError('Elegí el tipo de vehículo requerido antes de publicar — es lo que filtra qué choferes lo ven.');
      return;
    }
    patch({ accion: 'verificar', cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino, tipoVehiculo, pesoKg: Number(pesoKg) || null });
  }
  function cambiarEstado(estado) {
    patch({ accion: 'cambiarEstado', estado });
  }

  const [tone, variant] = STATE_BADGE[pedido.estado] || ['neutral', 'soft'];

  return (
    <Modal open onClose={onClose} title={`Pedido ${pedido.id}`} width={600}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Badge tone={tone} variant={variant}>{pedido.estado}</Badge>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pedido.clienteNombre} · {pedido.clienteTelefono}</span>
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
          {pedido.observaciones && <p style={{ fontSize: 13, margin: 0 }}><span style={{ color: 'var(--text-secondary)' }}>Observaciones:</span> {pedido.observaciones}</p>}
          {pedido.desc && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Detalle: {pedido.desc}</p>}

          {pedido.transportistaNombre && (
            <div style={{ background: 'var(--samply-blue-50)', border: '1px solid var(--samply-blue-100)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13 }}>
              🚛 Asignado a <strong>{pedido.transportistaNombre}</strong>
            </div>
          )}
          {pedido.cobradoPor && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Cobrado por: {pedido.cobradoPor.nombre} ({pedido.cobradoPor.tipo === 'admin' ? 'admin' : 'chofer'})
            </p>
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
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Mientras hablás con el cliente, podés ir guardando estos datos. Todavía NO es visible para los choferes.</p>
              <Input label="Origen (a publicar)" value={origen} onChange={(e) => setOrigen(e.target.value)} />
              <Input label="Destino (a publicar)" value={destino} onChange={(e) => setDestino(e.target.value)} />
              <Select label="Tipo de vehículo requerido" required value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value)}
                options={TIPOS_VEHICULO} placeholder="Elegí una capacidad" />
              <Input label="Peso aproximado (kg, opcional)" type="number" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} />
              <Input label="Cotización (ARS)" type="number" value={cotizacion} onChange={(e) => setCotizacion(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={guardarDatos} disabled={guardando}>Guardar sin publicar</Button>
                <Button onClick={confirmarYPublicar} disabled={guardando}>Cliente confirmó — publicar a choferes</Button>
                <Button variant="danger" onClick={() => cambiarEstado('Cancelado')} disabled={guardando}>Cancelar pedido</Button>
              </div>
            </>
          )}

          {/* Resto de estados */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {pedido.estado === 'Tomado' && (
              <Button onClick={() => cambiarEstado('Completado')} disabled={guardando}>Marcar completado</Button>
            )}
            {pedido.estado === 'Completado' && (
              <Button onClick={() => cambiarEstado('Cobrado')} disabled={guardando}>Marcar cobrado</Button>
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
