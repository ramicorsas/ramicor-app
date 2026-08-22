'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Input } from '@/components/ds/Input';
import { Modal } from '@/components/ds/Modal';

// Alta y gestión de choferes desde el panel — reemplaza el "editar el HTML
// a mano" que teníamos antes en RAMICOR. El admin crea el usuario/contraseña
// acá mismo y el chofer ya puede entrar a su panel.
export function ChoferesScreen() {
  const [choferes, setChoferes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', usuario: '', password: '', whatsapp: '', vehiculo: '' });
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch('/api/admin/choferes');
    if (res.ok) {
      const data = await res.json();
      setChoferes(data.choferes || []);
    }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function crear(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const res = await fetch('/api/admin/choferes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'No se pudo crear el chofer.');
      return;
    }
    setForm({ nombre: '', usuario: '', password: '', whatsapp: '', vehiculo: '' });
    setModalAbierto(false);
    cargar();
  }

  async function toggleActivo(chofer) {
    await fetch(`/api/admin/choferes/${chofer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !chofer.activo }),
    });
    cargar();
  }

  async function eliminar(chofer) {
    if (!confirm(`¿Eliminar a ${chofer.nombre}? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/choferes/${chofer.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'No se pudo eliminar.');
      return;
    }
    cargar();
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>Choferes</h1>
        <Button onClick={() => setModalAbierto(true)}>+ Nuevo chofer</Button>
      </div>

      <Card pad="none">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: 12 }}>Nombre</th>
              <th style={{ padding: 12 }}>Usuario</th>
              <th style={{ padding: 12 }}>WhatsApp</th>
              <th style={{ padding: 12 }}>Vehículo</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}></th>
            </tr>
          </thead>
          <tbody>
            {cargando && <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>Cargando...</td></tr>}
            {!cargando && choferes.length === 0 && <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>Todavía no hay choferes cargados.</td></tr>}
            {choferes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{c.nombre}</td>
                <td style={{ padding: 12 }}>{c.usuario}</td>
                <td style={{ padding: 12 }}>{c.whatsapp || '—'}</td>
                <td style={{ padding: 12 }}>{c.vehiculo || '—'}</td>
                <td style={{ padding: 12 }}>
                  <Badge tone={c.activo ? 'success' : 'neutral'} variant="soft">{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                </td>
                <td style={{ padding: 12 }}>
                  <Button size="sm" variant="ghost" onClick={() => toggleActivo(c)}>
                    {c.activo ? 'Desactivar' : 'Reactivar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => eliminar(c)} style={{ color: 'var(--color-danger)' }}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Nuevo chofer" width={440}>
        <form onSubmit={crear} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Nombre completo" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <Input label="Usuario (para ingresar)" required value={form.usuario} onChange={(e) => set('usuario', e.target.value)} />
          <Input label="Contraseña" type="password" required value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          <Input label="Vehículo (opcional)" value={form.vehiculo} onChange={(e) => set('vehiculo', e.target.value)} />
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}
          <Button type="submit" disabled={guardando} fullWidth>{guardando ? 'Creando...' : 'Crear chofer'}</Button>
        </form>
      </Modal>
    </div>
  );
}
