import Link from 'next/link';
import { RouteLine, RouteDot } from '@/components/shared/RouteLine';
import { PublicHeader, PublicFooter } from '@/components/shared/PublicHeader';
import { IconBox, IconTruck, IconBuilding, IconCrane } from '@/components/shared/Icons';

const wrap = { maxWidth: 1080, margin: '0 auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' };

const SERVICIOS = [
  { Icon: IconBox, titulo: 'Para personas', desc: 'Mudanzas chicas, muebles y electrodomésticos, sin arriesgar el auto de un amigo ni buscar un flete desconocido.' },
  { Icon: IconTruck, titulo: 'Alquiler corporativo', desc: 'Camión más chofer certificado, combustible y seguro incluidos. Por horas, mínimo 4 hs.' },
  { Icon: IconBuilding, titulo: 'Partner para empresas', desc: 'Tu departamento de logística sin flota propia ni costos fijos.' },
  { Icon: IconCrane, titulo: 'Maquinaria pesada', desc: 'Bobcat, retroexcavadora, mini grúa y más, con maquinista incluido.' },
];

const PARADAS = [
  { t: 'Elegís tu situación', d: 'Persona, alquiler corporativo o empresa — cada una con sus propias preguntas.' },
  { t: 'Confirmamos por WhatsApp', d: 'En minutos recibís el resumen de tu pedido.' },
  { t: 'Un transportista acepta', d: 'De nuestra red de independientes verificados.' },
  { t: 'Gestionamos el pago', d: 'Se cobra al confirmar la entrega. Con factura si la necesitás.' },
];

const BENEFICIOS = [
  { titulo: 'Choferes con experiencia', desc: 'Profesionales capacitados y verificados en cada viaje.' },
  { titulo: 'Vehículos en condiciones y presencia', desc: 'Unidades mantenidas y prolijas, listas para cualquier entrega.' },
  { titulo: 'Mayor gestión del tiempo', desc: 'Coordinamos todo para que no pierdas tiempo esperando.' },
  { titulo: 'Múltiples formas de pago', desc: 'Efectivo, tarjeta o transferencia, como te resulte más cómodo.' },
  { titulo: 'Documentación completa', desc: 'Remito, factura y seguro en cada operación.' },
  { titulo: 'Respuesta ante emergencias', desc: 'Disponibilidad 24/7 para lo urgente, sin costos ocultos.' },
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
      <PublicHeader />

      {/* HERO — plano, sin efectos de resplandor, con dato concreto (Córdoba) en vez de genérico */}
      <section style={{ background: 'var(--samply-navy)', color: '#fff', padding: '64px 0 0' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(44px, 9vw, 76px)', fontWeight: 800, letterSpacing: 1, margin: 0,
            lineHeight: 1, textTransform: 'uppercase',
          }}>
            RAMICOR
          </h1>
          <p style={{
            fontSize: 14, letterSpacing: 3, color: 'var(--samply-blue-light)', margin: '10px 0 24px',
            textTransform: 'uppercase', fontWeight: 600,
          }}>
            Soluciones Logísticas
          </p>
          <p style={{ fontSize: 13, color: '#8FA3BE', marginBottom: 16 }}>
            Con base en Córdoba, operando en toda la región · +5 años en el mercado
          </p>
          <p style={{ fontSize: 'clamp(19px, 2.6vw, 25px)', fontWeight: 700, margin: '0 auto 14px', lineHeight: 1.2, maxWidth: 600 }}>
            Movemos lo que necesitás, cuando lo necesitás.
          </p>
          <p style={{ fontSize: 15, color: '#B9C6D9', margin: '0 auto 30px', maxWidth: 460 }}>
            Conectamos a quienes necesitan transportar algo con choferes verificados.
          </p>
          <Link href="/cotizar" style={{
            display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
            padding: '14px 34px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none',
          }}>
            Solicitar ahora →
          </Link>
        </div>

        <div style={{ ...wrap, maxWidth: 640, marginTop: 48, display: 'flex', alignItems: 'center', gap: 10 }}>
          <RouteDot color="#fff" />
          <div style={{ flex: 1 }}><RouteLine height={2} /></div>
          <RouteDot color="var(--samply-blue-light)" />
        </div>
        <div style={{ ...wrap, maxWidth: 640, marginTop: 6, paddingBottom: 40, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8FA3BE' }}>
          <span>Tu pedido</span>
          <span>Entrega confirmada</span>
        </div>
      </section>

      {/* SERVICIOS — íconos de línea propios, sin emoji */}
      <section style={{ ...wrap, padding: '60px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--samply-navy)' }}>Nuestros servicios</h2>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginTop: 0, marginBottom: 28 }}>Elegí el que se ajusta a lo que necesitás mover.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: 'var(--samply-border)', border: '1px solid var(--samply-border)' }}>
          {SERVICIOS.map((s) => (
            <div key={s.titulo} style={{ background: '#fff', padding: '26px 22px' }}>
              <s.Icon />
              <h3 style={{ fontSize: 15, margin: '14px 0 8px', color: 'var(--samply-navy)', fontWeight: 700 }}>{s.titulo}</h3>
              <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--samply-border)', borderBottom: '1px solid var(--samply-border)', padding: '60px 0' }}>
        <div style={wrap}>
          <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 44, color: 'var(--samply-navy)' }}>El recorrido de tu pedido</h2>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 6, left: '12.5%', width: '75%' }}>
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

      {/* BENEFICIOS — sin íconos, tratamiento editorial más sobrio */}
      <section style={{ padding: '60px 0' }}>
        <div style={wrap}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--samply-navy)' }}>Más de 5 años moviéndolo todo</h2>
          <p style={{ fontSize: 14, color: 'var(--samply-text-2)', margin: '0 0 32px' }}>Los beneficios de trabajar con RAMICOR</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', columnGap: 40, rowGap: 24 }}>
            {BENEFICIOS.map((b) => (
              <div key={b.titulo} style={{ borderLeft: '2px solid var(--samply-blue)', paddingLeft: 16 }}>
                <h3 style={{ fontSize: 14.5, margin: '0 0 4px', fontWeight: 700, color: 'var(--samply-navy)' }}>{b.titulo}</h3>
                <p style={{ fontSize: 13, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: 'var(--samply-navy)', padding: '44px 0' }}>
        <div style={{ ...wrap, maxWidth: 780, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 20, textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.l}>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--samply-blue-light)' }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#8FA3BE' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA CHOFERES */}
      <section style={{ ...wrap, padding: '60px 24px' }}>
        <div style={{
          background: '#fff', border: '1px solid var(--samply-border)', borderLeft: '3px solid var(--samply-blue)',
          padding: '32px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, margin: '0 0 6px', color: 'var(--samply-navy)', fontWeight: 700 }}>¿Tenés un vehículo y querés trabajar con nosotros?</h2>
            <p style={{ fontSize: 13.5, color: 'var(--samply-text-2)', margin: 0, lineHeight: 1.5 }}>
              Contanos qué tipo de vehículo tenés — camioneta, utilitario o camión — y te sumamos a nuestra red de transportistas.
            </p>
          </div>
          <Link href="/postularme" style={{
            display: 'inline-block', background: 'var(--samply-navy)', color: '#fff',
            padding: '12px 26px', borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            Sumarme como chofer →
          </Link>
        </div>
      </section>

      <section style={{ padding: '8px 24px 60px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--samply-text-2)', marginBottom: 18 }}>¿Y vos, qué necesitás mover?</p>
        <Link href="/cotizar" style={{
          display: 'inline-block', background: 'var(--samply-blue)', color: '#fff',
          padding: '14px 34px', borderRadius: 6, fontWeight: 700, fontSize: 15, textDecoration: 'none',
        }}>
          Pedir un flete ahora
        </Link>
      </section>

      <PublicFooter />
    </main>
  );
}
