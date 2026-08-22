'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Button } from '@/components/ds/Button';

const inicial = { nombre: '', telefono: '', tipoVehiculo: '', capacidadCarga: '', zona: '', disponibilidad: '' };

export default function PostularmePage() {
  const [form, setForm] = useState(inicial);
  const [estado, setEstado] = useState('idle');

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function enviar(e) {
    e.preventDefault();
    setEstado('enviando');
    try {
      const res = await fetch('/api/postulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setEstado('ok');
    } catch {
      setEstado('error');
    }
  }

  if (estado === 'ok') {
    return (
      <main style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
        <Card>
          <h2 style={{ marginTop: 0 }}>¡Gracias, {form.nombre.split(' ')[0]}!</h2>
          <p>Recibimos tu postulación. Nuestro equipo la revisa y te contactamos por WhatsApp si todo está en orden.</p>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Sumate como transportista</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 24 }}>Registrate en nuestra red y empezá a recibir pedidos de carga.</p>
      <Card>
        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Nombre completo" required value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          <Input label="Teléfono / WhatsApp" required value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
          <Select label="Tipo de vehículo" value={form.tipoVehiculo} onChange={(e) => set('tipoVehiculo', e.target.value)}
            options={['Camioneta pick-up', 'Camioneta con caja', 'Utilitario / furgón', 'Camión chico (hasta 3 ton)', 'Camión mediano (3–10 ton)', 'Camión grande (+10 ton)'].map((v) => ({ value: v, label: v }))} />
          <Select label="Capacidad de carga" value={form.capacidadCarga} onChange={(e) => set('capacidadCarga', e.target.value)}
            options={['Hasta 500 kg', '500 kg – 1.5 ton', '1.5 – 3 ton', '3 – 10 ton', 'Más de 10 ton'].map((v) => ({ value: v, label: v }))} />
          <Input label="Zona de operación" value={form.zona} onChange={(e) => set('zona', e.target.value)} />
          <Select label="Disponibilidad horaria" value={form.disponibilidad} onChange={(e) => set('disponibilidad', e.target.value)}
            options={['Mañanas', 'Tardes', 'Todo el día', 'Fines de semana también', 'Variable'].map((v) => ({ value: v, label: v }))} />
          {estado === 'error' && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>Hubo un error. Probá de nuevo.</p>}
          <Button type="submit" disabled={estado === 'enviando'} fullWidth>
            {estado === 'enviando' ? 'Enviando...' : 'Registrarme como transportista →'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
