// Envío de emails con Resend — mismo patrón que usamos en Samply. Mientras
// no tengas RESEND_API_KEY configurada, esto NO falla: loguea el email a
// consola en vez de mandarlo, así podés seguir probando el resto del flujo
// sin la credencial. Apenas la sumes a las env vars, empieza a mandar de verdad.

let resendClient = null;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    const { Resend } = require('resend');
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function enviarEmail({ to, subject, html }) {
  const from = process.env.EMAIL_FROM || 'RAMICOR <pedidos@ramicorsolucioneslogisticas.com>';
  const resend = getResend();

  if (!resend) {
    console.log('[email] RESEND_API_KEY no configurada — simulando envío:');
    console.log(`  Para: ${to}`);
    console.log(`  Asunto: ${subject}`);
    console.log(`  ---`);
    console.log(`  ${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
    return { enviado: false, motivo: 'RESEND_API_KEY no configurada (simulado en consola)' };
  }

  try {
    await resend.emails.send({ from, to, subject, html });
    return { enviado: true };
  } catch (err) {
    console.error('[email] Error enviando email:', err.message);
    return { enviado: false, motivo: err.message };
  }
}

// ---------------------------------------------------------------------------
// Plantilla visual — misma identidad que el panel (navy + naranja RAMICOR).
// ---------------------------------------------------------------------------
const RAMICOR_NAVY = '#0B2A4A';
const RAMICOR_ORANGE = '#E8590C';
const RAMICOR_BG = '#F7F8FA';
const RAMICOR_GREEN = '#1E8E5A';

function emailLayout({ acento = RAMICOR_ORANGE, bodyHtml, ctaLabel, ctaUrl }) {
  return `
  <div style="font-family: 'Poppins', 'Helvetica Neue', Arial, sans-serif; background:${RAMICOR_BG}; padding: 32px 16px; margin:0;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 1px 4px rgba(11,42,74,0.08);">
      <div style="background:${RAMICOR_NAVY}; padding:22px 32px;">
        <span style="color:#ffffff; font-size:20px; font-weight:700; letter-spacing:0.3px;">RAMICOR</span>
      </div>
      <div style="height:4px; background:${acento};"></div>
      <div style="padding:32px; color:#1A2233; font-size:15px; line-height:1.65;">
        ${bodyHtml}
        ${ctaUrl ? `
        <div style="margin-top:28px;">
          <a href="${ctaUrl}" style="background:${RAMICOR_ORANGE}; color:#ffffff; padding:12px 26px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; display:inline-block;">
            ${ctaLabel}
          </a>
        </div>` : ''}
      </div>
      <div style="background:${RAMICOR_BG}; padding:16px 32px; color:#6B7A99; font-size:12px;">
        RAMICOR Soluciones Logísticas — este es un email automático, no hace falta que lo respondas.
      </div>
    </div>
  </div>`;
}

function adminEmails() {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL || '';
  return raw.split(',').map((e) => e.trim()).filter(Boolean);
}

/** Email a RAMICOR cuando un cliente pide un flete nuevo desde la landing. */
export async function notificarNuevoPedido(pedido, clienteNombre, clienteTelefono) {
  const destinatarios = adminEmails();
  if (destinatarios.length === 0) {
    console.log('[email] ADMIN_NOTIFICATION_EMAIL no configurado — no se notifica el pedido nuevo.');
    return { enviado: false, motivo: 'ADMIN_NOTIFICATION_EMAIL no configurado' };
  }
  const urlPanel = `${process.env.APP_URL || 'http://localhost:3000'}/admin/pedidos`;
  return enviarEmail({
    to: destinatarios,
    subject: `Pedido nuevo ${pedido.codigo} — ${clienteNombre}`,
    html: emailLayout({
      acento: RAMICOR_ORANGE,
      bodyHtml: `
        <p style="margin:0 0 16px;">Llegó un pedido de flete nuevo desde la web.</p>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:4px 0; color:#6B7A99;">Pedido</td><td style="padding:4px 0; font-weight:600;">${pedido.codigo}</td></tr>
          <tr><td style="padding:4px 0; color:#6B7A99;">Cliente</td><td style="padding:4px 0; font-weight:600;">${clienteNombre}</td></tr>
          <tr><td style="padding:4px 0; color:#6B7A99;">Teléfono</td><td style="padding:4px 0;">${clienteTelefono || '—'}</td></tr>
        </table>
        <p style="margin:16px 0 0;">Entrá al panel para cotizarlo y publicarlo para los choferes.</p>
      `,
      ctaLabel: 'Ver en el panel',
      ctaUrl: urlPanel,
    }),
  });
}

/** Email a RAMICOR cuando un chofer toma un pedido publicado. */
export async function notificarPedidoTomado(pedido, choferNombre) {
  const destinatarios = adminEmails();
  if (destinatarios.length === 0) {
    console.log('[email] ADMIN_NOTIFICATION_EMAIL no configurado — no se notifica la asignación.');
    return { enviado: false, motivo: 'ADMIN_NOTIFICATION_EMAIL no configurado' };
  }
  const urlPanel = `${process.env.APP_URL || 'http://localhost:3000'}/admin/pedidos`;
  return enviarEmail({
    to: destinatarios,
    subject: `${choferNombre} tomó el pedido ${pedido.codigo}`,
    html: emailLayout({
      acento: RAMICOR_GREEN,
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:16px; font-weight:600; color:${RAMICOR_NAVY};">Pedido asignado</p>
        <p style="margin:0;">El pedido <strong>${pedido.codigo}</strong> fue tomado por <strong>${choferNombre}</strong>.</p>
      `,
      ctaLabel: 'Ver en el panel',
      ctaUrl: urlPanel,
    }),
  });
}
