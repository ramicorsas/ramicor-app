'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ds/Button';
import { formatFechaHora } from '@/components/shared/constants';

// Chat interno de un pedido — el mismo endpoint (/api/pedidos/:id/mensajes)
// lo usan tanto el admin como el transportista asignado; cada uno se
// identifica por su propia cookie de sesión.
export function ChatPedido({ pedidoId, autorTipo }) {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const scrollRef = useRef(null);

  async function cargar() {
    const res = await fetch(`/api/pedidos/${pedidoId}/mensajes`);
    if (res.ok) {
      const data = await res.json();
      setMensajes(data.mensajes || []);
    }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, [pedidoId]);
  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [mensajes]);

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim()) return;
    const res = await fetch(`/api/pedidos/${pedidoId}/mensajes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje: texto.trim() }),
    });
    if (res.ok) {
      setTexto('');
      cargar();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 320, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--color-surface-2)' }}>
        {cargando && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cargando chat...</p>}
        {!cargando && mensajes.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Todavía no hay mensajes.</p>}
        {mensajes.map((m) => {
          const propio = m.autor_tipo === autorTipo;
          return (
            <div key={m.id} style={{ alignSelf: propio ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{
                background: propio ? 'var(--color-primary)' : '#fff',
                color: propio ? '#fff' : 'var(--text-primary)',
                border: propio ? 'none' : '1px solid var(--color-border)',
                borderRadius: 10, padding: '8px 12px', fontSize: 14,
              }}>
                {m.mensaje}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, textAlign: propio ? 'right' : 'left' }}>
                {m.autor_tipo === 'admin' ? 'RAMICOR' : 'Transportista'} · {formatFechaHora(m.fecha)}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={enviar} style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--color-border)' }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribir mensaje..."
          style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '0 10px', height: 36, fontSize: 14 }}
        />
        <Button type="submit" size="sm">Enviar</Button>
      </form>
    </div>
  );
}
