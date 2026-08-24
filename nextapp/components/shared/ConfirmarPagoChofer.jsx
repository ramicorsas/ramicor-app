'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ds/Button';
import { Select } from '@/components/ds/Select';
import { METODOS_PAGO_CHOFER } from '@/components/shared/constants';

const MAX_BYTES = 4 * 1024 * 1024; // 4MB — se guarda como base64 en la base, sin storage externo

/** Formulario para confirmar el pago al chofer: método + comprobante opcional. */
export function ConfirmarPagoChofer({ onConfirm, disabled, textoBoton = 'Confirmar que ya cobré mi pago' }) {
  const [abierto, setAbierto] = useState(false);
  const [metodo, setMetodo] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [error, setError] = useState(null);

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError('El archivo pesa mucho (máx 4MB) — probá con una foto más liviana o una captura de pantalla.');
      return;
    }
    setError(null);
    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onload = () => setComprobante(reader.result);
    reader.readAsDataURL(file);
  }

  function confirmar() {
    if (!metodo) { setError('Elegí cómo se pagó.'); return; }
    onConfirm(metodo, comprobante);
  }

  if (!abierto) {
    return <Button variant="secondary" onClick={() => setAbierto(true)} disabled={disabled}>{textoBoton}</Button>;
  }

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Select label="¿Cómo se pagó?" required value={metodo} onChange={(e) => setMetodo(e.target.value)}
        options={METODOS_PAGO_CHOFER.map((m) => ({ value: m, label: m }))} placeholder="Elegí un método" />
      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
          Comprobante (foto o captura, opcional)
        </label>
        <input type="file" accept="image/*,application/pdf" onChange={onFile} style={{ fontSize: 13 }} />
        {nombreArchivo && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>📎 {nombreArchivo}</p>}
      </div>
      {error && <p style={{ color: 'var(--color-danger)', fontSize: 12, margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={confirmar} disabled={disabled}>Confirmar pago</Button>
        <Button variant="ghost" onClick={() => setAbierto(false)} disabled={disabled}>Cancelar</Button>
      </div>
    </div>
  );
}

/** Muestra el método y el link al comprobante ya guardados, si hay. */
export function ComprobanteChofer({ metodo, comprobante }) {
  if (!metodo && !comprobante) return null;
  return (
    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
      {metodo && <span>Pagado por {metodo}. </span>}
      {comprobante && (
        <a href={comprobante} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--samply-blue)' }}>
          Ver comprobante
        </a>
      )}
    </div>
  );
}
