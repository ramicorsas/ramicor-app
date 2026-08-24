'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';

export function PostulacionesScreen() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargar() {
    setCargando(true);
    const res = await fetch('/api/admin/postulaciones');
    if (res.ok) {
      const data = await res.json();
      setPostulaciones(data.postulaciones || []);
    }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function actualizar(id, estado) {
    const res = await fetch(`/api/admin/postulaciones/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    if (estado === 'Aprobada' && res.ok) {
      const data = await res.json();
      alert(
        `Chofer creado (INACTIVO por ahora).\n\nUsuario: ${data.usuario}\nContraseña provisoria: ${data.passwordPlano}\n\n` +
        `La capacidad de carga ya quedó cargada. Andá a "Choferes" y activalo cuando esté listo.`
      );
    }
    cargar();
  }

  const badge = { Pendiente: ['warning', 'soft'], Aprobada: ['success', 'soft'], Rechazada: ['danger', 'outline'] };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Postulaciones de choferes</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 20, fontSize: 13 }}>
        Al aprobar, se crea el chofer automáticamente en "Choferes" con su capacidad de carga ya cargada, pero INACTIVO — activalo cuando esté listo.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {cargando && <p>Cargando...</p>}
        {!cargando && postulaciones.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No hay postulaciones todavía.</p>}
        {postulaciones.map((p) => {
          const [tone, variant] = badge[p.estado] || ['neutral', 'soft'];
          return (
            <Card key={p.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{p.nombre}</strong> · {p.telefono}
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {p.tipo_vehiculo || '—'} · Capacidad: {p.capacidad_carga || '—'} · Zona: {p.zona || '—'} · Disponibilidad: {p.disponibilidad || '—'}
                  </div>
                </div>
                <Badge tone={tone} variant={variant}>{p.estado}</Badge>
              </div>
              {p.estado === 'Pendiente' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button size="sm" onClick={() => actualizar(p.id, 'Aprobada')}>Aprobar</Button>
                  <Button size="sm" variant="danger" onClick={() => actualizar(p.id, 'Rechazada')}>Rechazar</Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
