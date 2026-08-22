import Link from 'next/link';
import { RouteLine, RouteDot } from '@/components/shared/RouteLine';

const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' };

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

const PORQUES = [
  'Choferes certificados para ingresar a cualquier planta o corporación',
  'Respuesta inmediata ante emergencias logísticas',
  'Toda la documentación: remito, factura, seguro',
  'Sin costos ocultos — precio cerrado desde el inicio',
];

const STATS = [
  { v: '+5', l: 'Años en el mercado' },
  { v: '100%', l: 'Costos incluidos' },
  { v: '24/7', l: 'Disponibilidad urgencias' },
  { v: 'A/B', l: 'Facturación completa' },
];

export default function LandingPage() {
  return (
    <main style={{ overflowX: 'hidden', width: '100%' }}>
      {/* HERO */}
      <section style={{ background: 'var(--samply-navy)', color: '#fff', padding: '72px 0 0' }}>
        <div style={{ ...wrap, textAlign: 'center' }} className="ramicor-fade-up">
          <p style={{ fontSize: 12, letterSpacing: 2, color: 'var(--samply-blue-light)', marginBottom: 14, textTransform: 'uppercase', fontWeight: 600 }}>
            +5 años en Argentina · Certificados · Confiables
          </p>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, letterSpacing: -0.5, margin: '0 auto 16px', lineHeight: 1.08, maxWidth: 700 }}>
            Movemos lo que necesitás,<br />cuando lo necesitás.
          </h1>
          <p style={{ fontSize: 17, color: '#B9C6D9', margin: '0 auto 32px', maxWidth: 480 }}>
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

        <div style={{ ...wrap, maxWidth: 640, marginTop: 52, display: 'flex', alignItems: 'center', gap: 10 }}>
          <RouteDot color="#fff" />
          <div style={{ flex: 1 }}><RouteLine height={2} /></div>
          <RouteDot color="var(--samply-blue-light)" />
        </div>
        <div style={{ ...wrap, maxWidth: 640, marginTop: 6, paddingBottom: 40, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8FA3BE' }}>
          <span>Tu pedido</span>
          <span>Entrega confirmada</span>
        </div>
      </section>

      {/* SERVICIOS */}
      <section style={{ ...wrap, padding: '64px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--samply-navy)' }}>Nuestros servicios</h2>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginTop: 0, marginBottom: 32 }}>Elegí el que se ajusta a lo que necesitás mover.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          {SERVICIOS.map((s, i) => (
            <div key={s.titulo} style={{
              background: i === 0 ? 'var(--samply-navy)' : '#fff',
              color: i === 0 ? '#fff' : 'var(--samply-navy)',
              border: i === 0 ? 'none' : '1px solid var(--samply-border)',
              borderRadius: 14, padding: '24px 22px', display: 'flex', flexDirection: 'column',
              justifyContent: i === 0 ? 'flex-end' : 'flex-start', minHeight: i === 0 ? 220 : 'auto',
            }}>
              <h3 style={{ fontSize: 16, margin: '0 0 8px', color: i === 0 ? '#fff' : 'var(--samply-blue)', fontWeight: 700 }}>{s.titulo}</h3>
              <p style={{ fontSize: 13, color: i === 0 ? '#B9C6D9' : 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
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

      {/* POR QUÉ NOS ELIGEN */}
      <section style={{ ...wrap, padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--samply-navy)' }}>Más de 5 años moviéndolo todo</h2>
            <p style={{ fontSize: 14, color: 'var(--samply-text-2)', lineHeight: 1.6 }}>
              RAMICOR nació para que las empresas puedan mover lo que necesitan, cuando lo necesitan, sin los costos de tener flota propia.
              Hoy expandimos ese mismo estándar de servicio para que cualquier persona o negocio pueda acceder a transporte profesional, certificado y confiable.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PORQUES.map((p) => (
              <div key={p} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <RouteDot />
                <span style={{ fontSize: 13.5, color: 'var(--samply-navy)' }}>{p}</span>
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
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--samply-blue-light)' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#8FA3BE' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA CHOFERES — punto que faltaba */}
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
    </main>
  );
}
