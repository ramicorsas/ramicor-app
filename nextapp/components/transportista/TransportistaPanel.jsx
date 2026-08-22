'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Modal } from '@/components/ds/Modal';
import { mapPedido, STATE_BADGE, formatMoneda } from '@/components/shared/constants';
import { ChatPedido } from '@/components/shared/ChatPedido';

// Panel del transportista: pestaña de pedidos "Verificado" disponibles
// para tomar, y sus propios pedidos en curso con chat + marcar completado.
export function TransportistaPanel() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [aviso, setAviso] = useState(null);

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

  async function cobrar(p) {
    await fetch(`/api/transportista/pedidos/${p.dbId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'cobrar' }),
    });
    setSeleccionado(null);
    cargar();
  }

  const disponibles = pedidos.filter((p) => p.estado === 'Verificado');
  const propios = pedidos.filter((p) => p.transportistaId != null);

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Pedidos disponibles</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 20 }}>Tocá "Tomar" para asignarte un pedido. Se bloquea para los demás apenas lo tomás.</p>

      {aviso && <p style={{ color: 'var(--color-danger)', fontSize: 13, marginBottom: 12 }}>{aviso}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {!cargando && disponibles.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay pedidos disponibles ahora.</p>}
        {disponibles.map((p) => (
          <Card key={p.dbId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{p.id}</strong> · {p.tipoServicio} · {p.origen || '—'} → {p.destino || '—'}
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatMoneda(p.cotizacion, p.moneda)}</div>
            </div>
            <Button onClick={() => tomar(p)}>Tomar pedido</Button>
          </Card>
        ))}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Mis pedidos</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!cargando && propios.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Todavía no tomaste ningún pedido.</p>}
        {propios.map((p) => {
          const [tone, variant] = STATE_BADGE[p.estado] || ['neutral', 'soft'];
          const pendiente = p.estado === 'Tomado';
          return (
            <Card key={p.dbId} interactive onClick={() => setSeleccionado(p)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{p.id}</strong> · {p.origen || '—'} → {p.destino || '—'}
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatMoneda(p.cotizacion, p.moneda)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {pendiente && <Badge tone="warning" variant="soft">Pendiente</Badge>}
                <Badge tone={tone} variant={variant}>{p.estado}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {seleccionado && (
        <Modal open onClose={() => setSeleccionado(null)} title={`Pedido ${seleccionado.id}`} width={520}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0 }}>
            {seleccionado.origen || '—'} → {seleccionado.destino || '—'} · {formatMoneda(seleccionado.cotizacion, seleccionado.moneda)}
          </p>
          <ChatPedido pedidoId={seleccionado.dbId} autorTipo="transportista" />
          {seleccionado.cobradoPor && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10 }}>
              Cobrado por: {seleccionado.cobradoPor.nombre} ({seleccionado.cobradoPor.tipo === 'admin' ? 'admin' : 'chofer'})
            </p>
          )}
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            {seleccionado.estado === 'Tomado' && (
              <Button onClick={() => completar(seleccionado)}>Marcar como entregado</Button>
            )}
            {['Tomado', 'Completado'].includes(seleccionado.estado) && (
              <Button variant="secondary" onClick={() => cobrar(seleccionado)}>Marcar como cobrado</Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
