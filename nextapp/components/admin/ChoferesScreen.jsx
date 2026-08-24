'use client';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { IconButton } from '@/components/ds/IconButton';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Modal } from '@/components/ds/Modal';
import { TIPOS_VEHICULO } from '@/components/shared/constants';

const formVacio = { nombre: '', usuario: '', password: '', whatsapp: '', vehiculo: '', capacidadVehiculo: '' };

// Alta y gestión de choferes desde el panel — reemplaza el "editar el HTML
// a mano" que teníamos antes en RAMICOR. El admin crea el usuario/contraseña
// acá mismo y el chofer ya puede entrar a su panel.
export function ChoferesScreen() {
  const [choferes, setChoferes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // chofer siendo editado, o null
  const [form, setForm] = useState(formVacio);
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

  function abrirNuevo() {
    setEditando(null);
    setForm(formVacio);
    setError(null);
    setModalAbierto(true);
  }

  function abrirEditar(chofer) {
    setEditando(chofer);
    setForm({
      nombre: chofer.nombre || '', usuario: chofer.usuario || '', password: '',
      whatsapp: chofer.whatsapp || '', vehiculo: chofer.vehiculo || '', capacidadVehiculo: chofer.capacidad_vehiculo || '',
    });
    setError(null);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    if (editando) {
      // Edición: el usuario no se puede cambiar acá (evita romper el login);
      // la contraseña solo se actualiza si se escribe una nueva.
      const body = {
        nombre: form.nombre, whatsapp: form.whatsapp, vehiculo: form.vehiculo, capacidadVehiculo: form.capacidadVehiculo,
      };
      if (form.password) body.password = form.password;
      const res = await fetch(`/api/admin/choferes/${editando.id}`, {
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
    } else {
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
    }

    setForm(formVacio);
    setModalAbierto(false);
    setEditando(null);
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
        <Button onClick={abrirNuevo}>+ Nuevo chofer</Button>
      </div>

      <Card pad="none">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: 12 }}>Nombre</th>
              <th style={{ padding: 12 }}>Usuario</th>
              <th style={{ padding: 12 }}>WhatsApp</th>
              <th style={{ padding: 12 }}>Vehículo</th>
              <th style={{ padding: 12 }}>Capacidad</th>
              <th style={{ padding: 12 }}>Estado</th>
              <th style={{ padding: 12 }}></th>
            </tr>
          </thead>
          <tbody>
            {cargando && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center' }}>Cargando...</td></tr>}
            {!cargando && choferes.length === 0 && <tr><td colSpan={7} style={{ padding: 16, textAlign: 'center' }}>Todavía no hay choferes cargados.</td></tr>}
            {choferes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{c.nombre}</td>
                <td style={{ padding: 12 }}>{c.usuario}</td>
                <td style={{ padding: 12 }}>{c.whatsapp || '—'}</td>
                <td style={{ padding: 12 }}>{c.vehiculo || '—'}</td>
                <td style={{ padding: 12 }}>{c.capacidad_vehiculo ? <Badge tone="info" variant="soft">{c.capacidad_vehiculo}</Badge> : '—'}</td>
                <td style={{ padding: 12 }}>
                  <Badge tone={c.activo ? 'success' : 'neutral'} variant="soft">{c.activo ? 'Activo' : 'Inactivo'}</Badge>
                </td>
                <td style={{ padding: 12, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <IconButton icon="edit" title="Editar" onClick={() => abrirEditar(c)} />
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

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title={editando ? `Editar a ${editando.nombre}` : 'Nuevo chofer'} width={440}>
        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label="Nombre completo" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          {!editando && (
            <Input label="Usuario (para ingresar)" required value={form.usuario} onChange={(e) => set('usuario', e.target.value)} />
          )}
          <Input
            label={editando ? 'Nueva contraseña (dejar vacío para no cambiarla)' : 'Contraseña'}
            type="password" required={!editando} value={form.password} onChange={(e) => set('password', e.target.value)}
          />
          <Input label="WhatsApp" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          <Input label="Vehículo (opcional, ej. Ford Cargo)" value={form.vehiculo} onChange={(e) => set('vehiculo', e.target.value)} />
          <Select label="Capacidad máxima de carga" required value={form.capacidadVehiculo} onChange={(e) => set('capacidadVehiculo', e.target.value)}
            options={TIPOS_VEHICULO} placeholder="Elegí una capacidad" />
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}
          <Button type="submit" disabled={guardando} fullWidth>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear chofer'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
