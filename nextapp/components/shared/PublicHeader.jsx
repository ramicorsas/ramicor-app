import Link from 'next/link';

export function PublicHeader() {
  return (
    <header style={{
      background: 'var(--samply-navy)', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          RAMICOR
        </span>
      </Link>
      <Link href="/postularme" style={{ color: '#B9C6D9', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
        Sumate como chofer
      </Link>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer style={{ background: 'var(--samply-navy)', padding: '28px 24px', textAlign: 'center' }}>
      <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        RAMICOR
      </span>
      <p style={{ color: '#8FA3BE', fontSize: 12, margin: '8px 0 0' }}>
        © {new Date().getFullYear()} RAMICOR · Argentina
      </p>
    </footer>
  );
}
