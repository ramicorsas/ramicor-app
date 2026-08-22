'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Select } from '@/components/ds/Select';
import { Button } from '@/components/ds/Button';

const CAMINOS = [
  {
    id: 'Personas',
    titulo: 'Soy persona',
    desc: 'Pedido puntual — en el día o cuando puedas.',
    preguntas: [
      { key: 'queNecesita', label: '¿Qué necesitás mover?', options: ['Heladera / lavarropas / cocina', 'Muebles (sillón, cama, ropero...)', 'Mudanza chica (cajas + muebles)', 'Materiales de construcción', 'Compra de tienda (mueblería, electro...)', 'Otro'] },
      { key: 'cuando', label: '¿Cuándo lo necesitás?', options: ['Hoy mismo (urgente)', 'Esta semana', 'La semana que viene', 'Tengo fecha específica'] },
    ],
  },
  {
    id: 'Corporativo',
    titulo: 'Alquiler corporativo',
    desc: 'Camión + chofer + combustible. Mínimo 4 hs/día.',
    preguntas: [
      { key: 'tipoVehiculo', label: 'Tipo de vehículo necesario', options: ['Camión chico (hasta 3 ton)', 'Camión mediano (3–10 ton)', 'Camión grande (+10 ton)', 'No estoy seguro — necesito asesoramiento'] },
      { key: 'horasEstimadas', label: '¿Cuántas horas estimadas?', options: ['4 horas mínimo', '8 horas (jornada completa)', 'Más de 8 horas', 'Varios días', 'Emergencia — lo antes posible'] },
    ],
  },
  {
    id: 'Empresas',
    titulo: 'Somos empresa',
    desc: 'Partner logístico certificado para tu operación.',
    preguntas: [
      { key: 'rubro', label: 'Rubro', options: ['Corralón / materiales', 'Ferretería', 'Mueblería', 'Tecnología / electrodomésticos', 'Distribuidora', 'E-commerce', 'Sanitarios / aberturas', 'Otro'] },
      { key: 'volumen', label: 'Volumen estimado de entregas', options: ['1–5 entregas por semana', '5–20 entregas por semana', 'Más de 20 por semana', 'Variable según temporada'] },
    ],
  },
];

const contactoInicial = { nombre: '', telefono: '', email: '', origen: '', destino: '', observaciones: '' };

export default function CotizarPage() {
  const [camino, setCamino] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [contacto, setContacto] = useState(contactoInicial);
  const [estado, setEstado] = useState('idle');
  const [codigo, setCodigo] = useState(null);

  function setContactoField(k, v) { setContacto((c) => ({ ...c, [k]: v })); }
  function setRespuesta(k, v) { setRespuestas((r) => ({ ...r, [k]: v })); }

  async function enviar(e) {
    e.preventDefault();
    setEstado('enviando');
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: contacto.nombre,
          telefono: contacto.telefono,
          email: contacto.email,
          tipoServicio: camino.id,
          origenCalle: contacto.origen,
          destinoCalle: contacto.destino,
          observaciones: contacto.observaciones,
          detalleExtra: respuestas,
        }),
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
          <h2 style={{ marginTop: 0 }}>¡Listo, {contacto.nombre.split(' ')[0]}!</h2>
          <p>Tu pedido quedó registrado con el código <strong>{codigo}</strong>. En breve nos contactamos para confirmar la cotización.</p>
        </Card>
      </main>
    );
  }

  if (!camino) {
    return (
      <main style={{ maxWidth: 720, margin: '48px auto', padding: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>¿Por dónde empezamos?</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 28 }}>Elegí la opción que corresponde a tu situación.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {CAMINOS.map((c) => (
            <Card key={c.id} interactive onClick={() => setCamino(c)}>
              <h3 style={{ fontSize: 16, margin: '0 0 8px', color: 'var(--samply-blue)' }}>{c.titulo}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{c.desc}</p>
            </Card>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <button onClick={() => setCamino(null)} style={{ background: 'none', border: 'none', color: 'var(--samply-blue)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12 }}>
        ← Elegir otra opción
      </button>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>{camino.titulo}</h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 0, marginBottom: 24 }}>{camino.desc}</p>
      <Card>
        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {camino.preguntas.map((p) => (
            <Select
              key={p.key}
              label={p.label}
              required
              value={respuestas[p.key] || ''}
              onChange={(e) => setRespuesta(p.key, e.target.value)}
              options={p.options.map((o) => ({ value: o, label: o }))}
              placeholder="Elegí una opción"
            />
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '6px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Nombre completo" required value={contacto.nombre} onChange={(e) => setContactoField('nombre', e.target.value)} />
            <Input label="Teléfono / WhatsApp" required value={contacto.telefono} onChange={(e) => setContactoField('telefono', e.target.value)} />
          </div>
          <Input label="Email (opcional)" type="email" value={contacto.email} onChange={(e) => setContactoField('email', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Origen" value={contacto.origen} onChange={(e) => setContactoField('origen', e.target.value)} />
            <Input label="Destino" value={contacto.destino} onChange={(e) => setContactoField('destino', e.target.value)} />
          </div>
          <Input label="Observaciones" value={contacto.observaciones} onChange={(e) => setContactoField('observaciones', e.target.value)} />

          {estado === 'error' && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>Hubo un error al enviar. Probá de nuevo.</p>}
          <Button type="submit" disabled={estado === 'enviando'} fullWidth>
            {estado === 'enviando' ? 'Enviando...' : 'Solicitar flete →'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
