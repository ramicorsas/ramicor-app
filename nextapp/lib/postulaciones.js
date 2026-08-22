import { query } from '@/db/client';
import { enviarEmail } from './email';

const RAMICOR_NAVY = '#0B2A4A';
const RAMICOR_ORANGE = '#E8590C';

function adminEmails() {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL || '';
  return raw.split(',').map((e) => e.trim()).filter(Boolean);
}

export async function crearPostulacion({ nombre, telefono, tipoVehiculo, capacidadCarga, zona, disponibilidad }) {
  const { rows } = await query(
    `INSERT INTO postulaciones_transportistas (nombre, telefono, tipo_vehiculo, capacidad_carga, zona, disponibilidad)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [nombre, telefono, tipoVehiculo || null, capacidadCarga || null, zona || null, disponibilidad || null]
  );

  const destinatarios = adminEmails();
  if (destinatarios.length > 0) {
    enviarEmail({
      to: destinatarios,
      subject: `Nueva postulación de chofer — ${nombre}`,
      html: `
        <div style="font-family:sans-serif;background:#F7F8FA;padding:24px;">
          <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
            <div style="background:${RAMICOR_NAVY};padding:18px 24px;color:#fff;font-weight:700;">RAMICOR</div>
            <div style="padding:24px;color:#1A2233;">
              <p>Se postuló un nuevo transportista, pendiente de revisión.</p>
              <p><strong>${nombre}</strong> — ${telefono}</p>
              <p>Vehículo: ${tipoVehiculo || '—'}<br/>Capacidad: ${capacidadCarga || '—'}<br/>Zona: ${zona || '—'}<br/>Disponibilidad: ${disponibilidad || '—'}</p>
              <a href="${process.env.APP_URL || ''}/admin/postulaciones" style="background:${RAMICOR_ORANGE};color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px;">Ver postulación</a>
            </div>
          </div>
        </div>
      `,
    }).catch((err) => console.log('[email] No se notificó la postulación:', err.message));
  }

  return rows[0];
}

export async function listarPostulaciones() {
  const { rows } = await query(`SELECT * FROM postulaciones_transportistas ORDER BY created_at DESC`);
  return rows;
}

export async function actualizarEstadoPostulacion(id, estado) {
  if (!['Pendiente', 'Aprobada', 'Rechazada'].includes(estado)) throw new Error('Estado inválido.');
  const { rows } = await query(
    `UPDATE postulaciones_transportistas SET estado = $1 WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  return rows[0] || null;
}
