'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ds/Card';
import { Input } from '@/components/ds/Input';
import { Button } from '@/components/ds/Button';

export default function TransportistaLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError(null);
    const res = await fetch('/api/transportista/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });
    setCargando(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'No se pudo iniciar sesión.');
      return;
    }
    router.push('/transportista');
  }

  return (
    <main style={{ maxWidth: 380, margin: '100px auto', padding: 24 }}>
      <h1 style={{ fontSize: 22, marginBottom: 20 }}>RAMICOR · Panel transportista</h1>
      <Card>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Usuario" required value={usuario} onChange={(e) => setUsuario(e.target.value)} />
          <Input label="Contraseña" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}
          <Button type="submit" disabled={cargando} fullWidth>{cargando ? 'Ingresando...' : 'Ingresar'}</Button>
        </form>
      </Card>
    </main>
  );
}
