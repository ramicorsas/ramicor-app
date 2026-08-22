'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { mapPedido, STATE_BADGE, formatMoneda } from '@/components/shared/constants';
import { PedidoDetailModal } from './PedidoDetailModal';

export function PedidosScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const res = await fetch('/api/admin/pedidos');
    if (res.ok) {
      const data = await res.json();
      setPedidos((data.pedidos || []).map(mapPedido));
    }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  function abrir(p) { setSeleccionado(p); }
  function cerrar() { setSeleccionado(null); }
  function refrescar() { cargar(); cerrar(); }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Pedidos</h1>
      <Card pad="none">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: 12 }}>Código</th>
              <th style={{ padding: 12 }}>Cliente</th>
              <th style={{ padding: 12 }}>Servicio</th>
              <th style={{ padding: 12 }}>Ruta</th>
              <th style={{ padding: 12 }}>Cotización</th>
              <th style={{ padding: 12 }}>Transportista</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {cargando && <tr><td colSpan={8} style={{ padding: 16, textAlign: 'center' }}>Cargando...</td></tr>}
            {!cargando && pedidos.length === 0 && <tr><td colSpan={8} style={{ padding: 16, textAlign: 'center' }}>No hay pedidos todavía.</td></tr>}
            {pedidos.map((p) => {
              const [tone, variant] = STATE_BADGE[p.estado] || ['neutral', 'soft'];
              return (
                <tr key={p.dbId} onClick={() => abrir(p)} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: 12 }}>{p.clienteNombre}</td>
                  <td style={{ padding: 12 }}>{p.tipoServicio}</td>
                  <td style={{ padding: 12 }}>{p.origen || '—'} → {p.destino || '—'}</td>
                  <td style={{ padding: 12 }}>{formatMoneda(p.cotizacion, p.moneda)}</td>
                  <td style={{ padding: 12 }}>
                    {p.transportistaNombre ? (
                      <Badge tone="info" variant="soft">Asignado: {p.transportistaNombre}</Badge>
                    ) : '—'}
                  </td>
                  <td style={{ padding: 12 }}><Badge tone={tone} variant={variant}>{p.estado}</Badge></td>
                  <td style={{ padding: 12 }}>{p.fecha}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {seleccionado && (
        <PedidoDetailModal pedido={seleccionado} onClose={cerrar} onActualizado={refrescar} />
      )}
    </div>
  );
}
