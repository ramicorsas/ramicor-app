import Link from 'next/link';
import { RouteLine, RouteDot } from '@/components/shared/RouteLine';
import { PublicHeader, PublicFooter } from '@/components/shared/PublicHeader';

const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' };

const SERVICIOS = [
  { emoji: '📦', titulo: 'Para personas', desc: 'Mudanzas chicas, muebles y electrodomésticos, sin arriesgar el auto de un amigo ni buscar un flete desconocido.' },
  { emoji: '🚛', titulo: 'Alquiler corporativo', desc: 'Camión más chofer certificado, combustible y seguro incluidos. Por horas, mínimo 4 hs.' },
  { emoji: '🏢', titulo: 'Partner para empresas', desc: 'Tu departamento de logística sin flota propia ni costos fijos.' },
  { emoji: '🏗️', titulo: 'Maquinaria pesada', desc: 'Bobcat, retroexcavadora, mini grúa y más, con maquinista incluido.' },
];

const PARADAS = [
  { t: 'Elegís tu situación', d: 'Persona, alquiler corporativo o empresa — cada una con sus propias preguntas.' },
  { t: 'Confirmamos por WhatsApp', d: 'En minutos recibís el resumen de tu pedido.' },
  { t: 'Un transportista acepta', d: 'De nuestra red de independientes verificados.' },
  { t: 'Gestionamos el pago', d: 'Se cobra al confirmar la entrega. Con factura si la necesitás.' },
];

const BENEFICIOS = [
  { emoji: '🧑‍✈️', titulo: 'Choferes con experiencia', desc: 'Profesionales capacitados y verificados en cada viaje.' },
  { emoji: '🚚', titulo: 'Vehículos en condiciones y presencia', desc: 'Unidades mantenidas y prolijas, listas para cualquier entrega.' },
  { emoji: '⏱️', titulo: 'Mayor gestión del tiempo', desc: 'Coordinamos todo para que no pierdas tiempo esperando.' },
  { emoji: '💳', titulo: 'Múltiples formas de pago', desc: 'Efectivo, tarjeta o transferencia, como te resulte más cómodo.' },
  { emoji: '📄', titulo: 'Documentación completa', desc: 'Remito, factura y seguro en cada operación.' },
  { emoji: '🛡️', titulo: 'Respuesta ante emergencias', desc: 'Disponibilidad 24/7 para lo urgente, sin costos ocultos.' },
];

const STATS = [
  { v: '+5', l: 'Años en el mercado' },
  { v: '100%', l: 'Costos incluidos' },
  { v: '24/7', l: 'Disponibilidad urgencias' },
  { v: 'A/B', l: 'Facturación completa' },
];

const TICKER = ['PERSONA', 'CORPORATIVO', 'EMPRESA', 'MAQUINARIA', 'PERSONA', 'CORPORATIVO', 'EMPRESA', 'MAQUINARIA'];

export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden', width: '100%' }}>
      <PublicHeader />

      {/* HERO — gradiente con resplandor naranja detrás del título */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 400px at 50% 0%, rgba(232,89,12,0.28), transparent 70%), var(--samply-navy)',
        color: '#fff', padding: '64px 0 0', position: 'relative',
      }}>
        <div style={{ ...wrap, textAlign: 'center', position: 'relative' }} className="ramicor-fade-up">
          <h1 style={{
            fontSize: 'clamp(48px, 10vw, 84px)', fontWeight: 800, letterSpacing: 1, margin: 0,
            lineHeight: 1, textTransform: 'uppercase',
          }}>
            RAMICOR
          </h1>
          <p style={{
            fontSize: 15, letterSpacing: 3, color: 'var(--samply-blue-light)', margin: '10px 0 28px',
            textTransform: 'uppercase', fontWeight: 600,
          }}>
            Soluciones Logísticas
          </p>
          <p style={{ fontSize: 12, letterSpacing: 1.5, color: '#8FA3BE', marginBottom: 14, textTransform: 'uppercase', fontWeight: 600 }}>
            +5 años en Argentina · Certificados · Confiables
          </p>
          <p style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, margin: '0 auto 16px', lineHeight: 1.15, maxWidth: 640, color: '#fff' }}>
            Movemos lo que necesitás, cuando lo necesitás.
          </p>
          <p style={{ fontSize: 16, color: '#B9C6D9', margin: '0 auto 32px', maxWidth: 480 }}>
            Conectamos a quienes necesitan transportar algo con choferes verificados, en toda la región.
          </p>
          <Link href="/cotizar" style={{
            display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
            padding: '15px 36px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(232,89,12,0.45)',
          }}>
            Solicitar ahora →
          </Link>
        </div>

        <div style={{ ...wrap, maxWidth: 640, marginTop: 52, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <RouteDot color="#fff" />
          <div style={{ flex: 1 }}><RouteLine height={2} /></div>
          <RouteDot color="var(--samply-blue-light)" />
        </div>
        <div style={{ ...wrap, maxWidth: 640, marginTop: 6, paddingBottom: 40, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8FA3BE', position: 'relative' }}>
          <span>Tu pedido</span>
          <span>Entrega confirmada</span>
        </div>
      </section>

      {/* TICKER — cinta en movimiento, refuerza los 4 caminos de /cotizar */}
      <div style={{ background: 'var(--samply-blue)', overflow: 'hidden', padding: '10px 0' }}>
        <div className="ramicor-marquee-track" style={{ display: 'flex', width: 'max-content' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{
              color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 2, padding: '0 28px',
              display: 'flex', alignItems: 'center', gap: 28, whiteSpace: 'nowrap',
            }}>
              {t} <span style={{ opacity: 0.5 }}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* SERVICIOS — 4 tarjetas parejas, con hover y un toque de personalidad */}
      <section style={{ ...wrap, padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--samply-navy)' }}>Nuestros servicios</h2>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginTop: 0, marginBottom: 32 }}>Elegí el que se ajusta a lo que necesitás mover.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SERVICIOS.map((s) => (
            <div key={s.titulo} className="ramicor-card-hover" style={{
              background: '#fff', border: '1px solid var(--samply-border)', borderRadius: 14,
              padding: '24px 22px', display: 'flex', flexDirection: 'column', minHeight: 168,
              borderTop: '3px solid var(--samply-blue)',
            }}>
              <span style={{ fontSize: 26, marginBottom: 10 }}>{s.emoji}</span>
              <h3 style={{ fontSize: 16, margin: '0 0 8px', color: 'var(--samply-navy)', fontWeight: 700 }}>{s.titulo}</h3>
              <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--samply-border)', borderBottom: '1px solid var(--samply-border)', padding: '64px 0' }}>
        <div style={wrap}>
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

      {/* BENEFICIOS — tarjetas con ícono, sobre fondo con tinte naranja */}
      <section style={{ background: 'var(--samply-blue-50)', padding: '64px 0' }}>
        <div style={wrap}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', margin: '0 0 8px', color: 'var(--samply-navy)' }}>Más de 5 años moviéndolo todo</h2>
          <p style={{ fontSize: 14, color: 'var(--samply-text-2)', textAlign: 'center', margin: '0 0 40px' }}>Los beneficios de trabajar con RAMICOR</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid var(--samply-blue-100)' }}>
                <span style={{ fontSize: 24, marginBottom: 10, display: 'block' }}>{b.emoji}</span>
                <h3 style={{ fontSize: 14.5, margin: '0 0 6px', fontWeight: 700, color: 'var(--samply-navy)' }}>{b.titulo}</h3>
                <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--samply-navy)', padding: '48px 0' }}>
        <div style={{ ...wrap, maxWidth: 780, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20, textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 34, fontWeight: 800, color: 'var(--samply-blue-light)' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#8FA3BE' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA CHOFERES */}
      <section style={{ ...wrap, padding: '64px 24px' }}>
        <div style={{
          background: '#FDEDE2', border: '1px solid var(--samply-blue-100)', borderRadius: 16,
          padding: '36px 32px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: 19, margin: '0 0 6px', color: 'var(--samply-navy)', fontWeight: 700 }}>¿Tenés un vehículo y querés trabajar con nosotros?</h2>
            <p style={{ fontSize: 13.5, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>
              Contanos qué tipo de vehículo tenés — camioneta, utilitario o camión — y te sumamos a nuestra red de transportistas.
            </p>
          </div>
          <Link href="/postularme" style={{
            display: 'inline-block', background: 'var(--samply-navy)', color: '#fff',
            padding: '13px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Sumarme como chofer →
          </Link>
        </div>
      </section>

      <section style={{ padding: '16px 24px 64px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginBottom: 20 }}>¿Y vos, qué necesitás mover?</p>
        <Link href="/cotizar" style={{
          display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
          padding: '15px 36px', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none',
        }}>
          Pedir un flete ahora
        </Link>
      </section>

      <PublicFooter />
    </main>
  );
}
