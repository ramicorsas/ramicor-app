import './globals.css';

export const metadata = {
  title: 'RAMICOR — Soluciones Logísticas',
  description: 'Plataforma que conecta clientes con transportistas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
