'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ds/Modal';
import { Button } from '@/components/ds/Button';
import { Badge } from '@/components/ds/Badge';
import { Input } from '@/components/ds/Input';
import { Tabs } from '@/components/ds/Tabs';
import { STATE_BADGE, formatMoneda } from '@/components/shared/constants';
import { ChatPedido } from '@/components/shared/ChatPedido';

// El detalle completo del pedido desde el panel admin: acá es donde vos
// cotizás, informás origen/destino, cambiás el estado, y hablás por el
// chat interno con el transportista — todo lo que antes se hacía a mano
// en el Sheet + WhatsApp aparte.
export function PedidoDetailModal({ pedido, onClose, onActualizado }) {
  const [tab, setTab] = useState('datos');
  const [cotizacion, setCotizacion] = useState(pedido?.cotizacion || '');
  const [origen, setOrigen] = useState(pedido?.origen || '');
  const [destino, setDestino] = useState(pedido?.destino || '');
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

  function verificar() {
    patch({ accion: 'verificar', cotizacion: Number(cotizacion) || null, moneda: 'ARS', origen, destino });
  }
  function cambiarEstado(estado) {
    patch({ accion: 'cambiarEstado', estado });
  }

  const [tone, variant] = STATE_BADGE[pedido.estado] || ['neutral', 'soft'];

  return (
    <Modal open onClose={onClose} title={`Pedido ${pedido.id}`} width={560}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Badge tone={tone} variant={variant}>{pedido.estado}</Badge>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{pedido.clienteNombre} · {pedido.clienteTelefono}</span>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'datos', label: 'Datos y cotización' },
          { id: 'chat', label: 'Chat con transportista' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'datos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Origen" value={origen} onChange={(e) => setOrigen(e.target.value)} />
          <Input label="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} />
          <Input label="Cotización (ARS)" type="number" value={cotizacion} onChange={(e) => setCotizacion(e.target.value)} />
          {pedido.desc && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Detalle del pedido: {pedido.desc}</p>}
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

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {pedido.estado === 'Nuevo' && (
              <Button onClick={verificar} disabled={guardando}>Acondicionar y marcar disponible</Button>
            )}
            {pedido.estado === 'Tomado' && (
              <Button onClick={() => cambiarEstado('Completado')} disabled={guardando}>Marcar completado</Button>
            )}
            {pedido.estado === 'Completado' && (
              <Button onClick={() => cambiarEstado('Cobrado')} disabled={guardando}>Marcar cobrado</Button>
            )}
            {!['Cobrado', 'Cancelado'].includes(pedido.estado) && (
              <Button variant="danger" onClick={() => cambiarEstado('Cancelado')} disabled={guardando}>Cancelar pedido</Button>
            )}
          </div>
        </div>
      )}

      {tab === 'chat' && <ChatPedido pedidoId={pedido.dbId} autorTipo="admin" />}
    </Modal>
  );
}
