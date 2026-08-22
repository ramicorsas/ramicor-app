'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Button } from '@/components/ds/Button';
import { TIPOS_SERVICIO } from '@/components/shared/constants';

// Landing pública de RAMICOR. Reemplaza a fleteya-landing.html: en vez de
// mandar el form a Apps Script/Sheet, pega directo a POST /api/pedidos.
export default function LandingPage() {
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', tipoServicio: 'Personas', origen: '', destino: '', descripcion: '' });
  const [estado, setEstado] = useState('idle'); // idle | enviando | ok | error
  const [codigo, setCodigo] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function enviar(e) {
    e.preventDefault();
    setEstado('enviando');
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar el pedido.');
      setCodigo(data.codigo);
      setEstado('ok');
    } catch (err) {
      setEstado('error');
    }
  }

  if (estado === 'ok') {
    return (
      <main style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>¡Listo, {form.nombre.split(' ')[0]}!</h2>
          <p>Tu pedido quedó registrado con el código <strong>{codigo}</strong>. En breve nos contactamos para confirmar la cotización.</p>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>RAMICOR — Pedir un flete</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 24 }}>Completá tus datos y nos ponemos en contacto para cotizar.</p>
      <Card>
        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nombre completo" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <Input label="Teléfono / WhatsApp" required value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
          <Input label="Email (opcional)" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Select label="Tipo de servicio" required value={form.tipoServicio} onChange={(e) => set('tipoServicio', e.target.value)}
            options={TIPOS_SERVICIO.map((t) => ({ value: t, label: t }))} />
          <Input label="Origen" value={form.origen} onChange={(e) => set('origen', e.target.value)} />
          <Input label="Destino" value={form.destino} onChange={(e) => set('destino', e.target.value)} />
          <Input label="Detalles del pedido" value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
          {estado === 'error' && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>Hubo un error al enviar. Probá de nuevo.</p>}
          <Button type="submit" disabled={estado === 'enviando'} fullWidth>
            {estado === 'enviando' ? 'Enviando...' : 'Pedir flete'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
