'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Tabs } from '@/components/ds/Tabs';
import { mapPedido, STATE_BADGE, formatMoneda } from '@/components/shared/constants';
import { PedidoDetailModal } from './PedidoDetailModal';

// Personas: circuito de autoservicio (Por asignar / En proceso / Finalizados).
const GRUPOS_PERSONAS = {
  asignar: ['Nuevo'],
  proceso: ['En proceso', 'Verificado', 'Tomado'],
  finalizados: ['Completado', 'Cobrado', 'Cancelado'],
};

export function PedidosScreen() {
  const [pedidos, setPedidos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState('asignar');

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

  const personas = pedidos.filter((p) => p.tipoServicio === 'Personas');
  const especiales = pedidos.filter((p) => p.tipoServicio !== 'Personas'); // Corporativo, Empresas, Utilitarios y Maquinas

  const contadores = useMemo(() => ({
    total: pedidos.length,
    asignar: personas.filter((p) => GRUPOS_PERSONAS.asignar.includes(p.estado)).length,
    proceso: personas.filter((p) => GRUPOS_PERSONAS.proceso.includes(p.estado)).length,
    finalizados: personas.filter((p) => GRUPOS_PERSONAS.finalizados.includes(p.estado)).length,
    especialesPendientes: especiales.filter((p) => !['Cobrado', 'Cancelado'].includes(p.estado)).length,
    cobrado: pedidos.filter((p) => p.estado === 'Cobrado').reduce((acc, p) => acc + (Number(p.cotizacion) || 0), 0),
  }), [pedidos, personas, especiales]);

  const visibles = tab === 'especiales' ? especiales : personas.filter((p) => GRUPOS_PERSONAS[tab].includes(p.estado));

  function renderTabla(lista) {
    return (
      <Card pad="none">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: 12 }}>Código</th>
              <th style={{ padding: 12 }}>Cliente</th>
              <th style={{ padding: 12 }}>Servicio</th>
              <th style={{ padding: 12 }}>Ruta</th>
              <th style={{ padding: 12 }}>Cliente paga</th>
              <th style={{ padding: 12 }}>Chofer cobra</th>
              <th style={{ padding: 12 }}>Transportista</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {cargando && <tr><td colSpan={9} style={{ padding: 16, textAlign: 'center' }}>Cargando...</td></tr>}
            {!cargando && lista.length === 0 && <tr><td colSpan={9} style={{ padding: 16, textAlign: 'center' }}>No hay pedidos en esta categoría.</td></tr>}
            {lista.map((p) => {
              const [tone, variant] = STATE_BADGE[p.estado] || ['neutral', 'soft'];
              return (
                <tr key={p.dbId} onClick={() => abrir(p)} style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                  <td style={{ padding: 12, fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: 12 }}>{p.clienteNombre}</td>
                  <td style={{ padding: 12 }}>{p.tipoServicio}</td>
                  <td style={{ padding: 12 }}>{p.origen || '—'} → {p.destino || '—'}</td>
                  <td style={{ padding: 12 }}>{formatMoneda(p.cotizacion, p.moneda)}</td>
                  <td style={{ padding: 12 }}>{p.montoChofer ? formatMoneda(p.montoChofer) : '—'}</td>
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
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>Pedidos</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total', value: contadores.total },
          { label: 'Por asignar', value: contadores.asignar },
          { label: 'En proceso', value: contadores.proceso },
          { label: 'Finalizados', value: contadores.finalizados },
          { label: 'Cobrado total', value: formatMoneda(contadores.cobrado) },
        ].map((k) => (
          <div key={k.label} style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--samply-navy)' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'asignar', label: `Por asignar (${contadores.asignar})` },
          { id: 'proceso', label: `En proceso (${contadores.proceso})` },
          { id: 'finalizados', label: `Finalizados (${contadores.finalizados})` },
          { id: 'especiales', label: `Corporativo / Empresas / Maquinaria (${contadores.especialesPendientes})` },
        ]}
        style={{ marginBottom: 16 }}
      />

      {tab === 'especiales' && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 0, marginBottom: 12 }}>
          Estos pedidos no se publican al pool general — vos asignás el chofer directamente cuando esté todo cerrado con el cliente.
        </p>
      )}

      {renderTabla(visibles)}

      {seleccionado && (
        <PedidoDetailModal pedido={seleccionado} onClose={cerrar} onActualizado={refrescar} />
      )}
    </div>
  );
}
