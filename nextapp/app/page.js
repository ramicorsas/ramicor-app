import Link from 'next/link';
import { RouteLine, RouteDot } from '@/components/shared/RouteLine';

const SERVICIOS = [
  { titulo: 'Para personas', desc: 'Mudanzas chicas, muebles y electrodomésticos, sin arriesgar el auto de un amigo ni buscar un flete desconocido.', destacado: true },
  { titulo: 'Alquiler corporativo', desc: 'Camión más chofer certificado, combustible y seguro incluidos. Por horas, mínimo 4 hs.' },
  { titulo: 'Partner para empresas', desc: 'Tu departamento de logística sin flota propia ni costos fijos.' },
  { titulo: 'Maquinaria pesada', desc: 'Bobcat, retroexcavadora, mini grúa y más, con maquinista incluido.' },
];

const PARADAS = [
  { t: 'Elegís tu situación', d: 'Persona, alquiler corporativo o empresa — cada una con sus propias preguntas.' },
  { t: 'Confirmamos por WhatsApp', d: 'En minutos recibís el resumen de tu pedido.' },
  { t: 'Un transportista acepta', d: 'De nuestra red de independientes verificados.' },
  { t: 'Gestionamos el pago', d: 'Se cobra al confirmar la entrega. Con factura si la necesitás.' },
];

const STATS = [
  { v: '+5', l: 'Años en el mercado' },
  { v: '100%', l: 'Costos incluidos' },
  { v: '24/7', l: 'Disponibilidad urgencias' },
  { v: 'A/B', l: 'Facturación completa' },
];

export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden' }}>
      {/* HERO — la ruta es el thesis visual: origen a la izquierda, destino a la derecha */}
      <section style={{ background: 'var(--samply-navy)', color: '#fff', padding: '72px 24px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }} className="ramicor-fade-up">
          <p style={{ fontSize: 12, letterSpacing: 2, color: 'var(--samply-blue-light)', marginBottom: 14, textTransform: 'uppercase', fontWeight: 600 }}>
            +5 años en Argentina · Certificados · Confiables
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: -0.5, margin: '0 0 16px', lineHeight: 1.08 }}>
            Movemos lo que necesitás,<br />cuando lo necesitás.
          </h1>
          <p style={{ fontSize: 17, color: '#B9C6D9', margin: '0 0 32px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Conectamos a quienes necesitan transportar algo con choferes verificados, en toda la región.
          </p>
          <Link href="/cotizar" style={{
            display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
            padding: '15px 36px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(232,89,12,0.35)',
          }}>
            Solicitar ahora →
          </Link>
        </div>

        {/* La ruta: origen (navy/vos) --------> destino (naranja/RAMICOR) */}
        <div style={{ maxWidth: 640, margin: '52px auto 0', display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px' }}>
          <RouteDot color="#fff" />
          <div style={{ flex: 1 }}><RouteLine height={2} /></div>
          <RouteDot color="var(--samply-blue-light)" />
        </div>
        <div style={{ maxWidth: 640, margin: '6px auto 0', display: 'flex', justifyContent: 'space-between', padding: '0 24px 40px', fontSize: 12, color: '#8FA3BE' }}>
          <span>Tu pedido</span>
          <span>Entrega confirmada</span>
        </div>
      </section>

      {/* SERVICIOS — layout asimétrico: uno destacado + tres compactos, no la grilla pareja de siempre */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--samply-navy)' }}>Nuestros servicios</h2>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginTop: 0, marginBottom: 32 }}>Elegí el que se ajusta a lo que necesitás mover.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          {SERVICIOS.filter((s) => s.destacado).map((s) => (
            <div key={s.titulo} style={{
              background: 'var(--samply-navy)', color: '#fff', borderRadius: 14, padding: '28px 26px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 220,
            }}>
              <h3 style={{ fontSize: 19, margin: '0 0 8px', fontWeight: 700 }}>{s.titulo}</h3>
              <p style={{ fontSize: 14, color: '#B9C6D9', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
          <div style={{ display: 'grid', gap: 16 }}>
            {SERVICIOS.filter((s) => !s.destacado).slice(0, 2).map((s) => (
              <div key={s.titulo} style={{ background: '#fff', border: '1px solid var(--samply-border)', borderRadius: 14, padding: '20px 22px' }}>
                <h3 style={{ fontSize: 15, margin: '0 0 6px', color: 'var(--samply-blue)', fontWeight: 700 }}>{s.titulo}</h3>
                <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16, background: '#fff', border: '1px solid var(--samply-border)', borderRadius: 14, padding: '20px 22px' }}>
          <h3 style={{ fontSize: 15, margin: '0 0 6px', color: 'var(--samply-blue)', fontWeight: 700 }}>{SERVICIOS[3].titulo}</h3>
          <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{SERVICIOS[3].desc}</p>
        </div>
      </section>

      {/* CÓMO FUNCIONA — paradas reales sobre la línea de ruta, no números decorativos */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--samply-border)', borderBottom: '1px solid var(--samply-border)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 48, color: 'var(--samply-navy)' }}>El recorrido de tu pedido</h2>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 6, left: '12.5%', right: '12.5%' }}>
                <RouteLine height={2} />
              </div>
              {PARADAS.map((p) => (
                <div key={p.t} style={{ padding: '0 12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <RouteDot />
                  </div>
                  <h3 style={{ fontSize: 14, margin: '0 0 6px', color: 'var(--samply-navy)', fontWeight: 700 }}>{p.t}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--samply-navy)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20, textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--samply-blue-light)' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#8FA3BE' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginBottom: 20 }}>¿Listo para mover algo?</p>
        <Link href="/cotizar" style={{
          display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
          padding: '15px 36px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none',
        }}>
          Pedir un flete ahora
        </Link>
      </section>
    </main>
  );
}
