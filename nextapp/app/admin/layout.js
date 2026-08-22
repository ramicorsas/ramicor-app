'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === '/admin/login') return children;

  async function salir() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  const links = [
    { href: '/admin/pedidos', label: 'Pedidos' },
    { href: '/admin/choferes', label: 'Choferes' },
  ];

  return (
    <div>
      <div style={{
        height: 56, background: 'var(--samply-navy)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <strong style={{ fontSize: 16, letterSpacing: 0.3 }}>RAMICOR</strong>
          <nav style={{ display: 'flex', gap: 18 }}>
            {links.map((l) => (
              <Link key={l.href} href={l.href} style={{
                color: pathname.startsWith(l.href) ? 'var(--samply-blue-light)' : '#fff',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
              }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <button onClick={salir} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13 }}>
          Salir
        </button>
      </div>
      {children}
    </div>
  );
}
