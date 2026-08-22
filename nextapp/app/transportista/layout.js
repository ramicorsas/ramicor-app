'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function TransportistaLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/transportista/login') return children;

  async function salir() {
    await fetch('/api/transportista/auth/logout', { method: 'POST' });
    router.push('/transportista/login');
  }

  return (
    <div>
      <div style={{
        height: 56, background: 'var(--samply-navy)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <strong style={{ fontSize: 16, letterSpacing: 0.3 }}>RAMICOR</strong>
        <button onClick={salir} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
          Salir
        </button>
      </div>
      {children}
    </div>
  );
}
