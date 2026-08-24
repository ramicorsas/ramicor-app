import { query } from '@/db/client';
import { enviarEmail } from './email';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const RAMICOR_NAVY = '#0B2A4A';
const RAMICOR_ORANGE = '#E8590C';

function adminEmails() {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL || '';
  return raw.split(',').map((e) => e.trim()).filter(Boolean);
}

export async function crearPostulacion({ nombre, telefono, email, tipoVehiculo, capacidadCarga, zona, disponibilidad }) {
  const { rows } = await query(
    `INSERT INTO postulaciones_transportistas (nombre, telefono, email, tipo_vehiculo, capacidad_carga, zona, disponibilidad)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [nombre, telefono, email, tipoVehiculo || null, capacidadCarga || null, zona || null, disponibilidad || null]
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

function generarPassword() {
  return crypto.randomBytes(6).toString('base64url'); // ej. "Kx9fQ2Zt"
}

/**
 * Aprueba la postulación Y crea el chofer automáticamente en la tabla
 * transportistas — pero INACTIVO (activo = false). Genera usuario/contraseña
 * provisorios (a partir del teléfono) para que quede algo cargado; el admin
 * después entra a "Choferes", confirma la capacidad de carga correcta
 * (la escala de la postulación es en kg, la de RAMICOR es en toneladas — no
 * son 1 a 1) y recién ahí lo activa.
 */
export async function aprobarPostulacion(id) {
  const { rows: postRows } = await query(`SELECT * FROM postulaciones_transportistas WHERE id = $1`, [id]);
  const postulacion = postRows[0];
  if (!postulacion) return null;

  let usuario = postulacion.email || postulacion.telefono.replace(/\D/g, '') || `chofer${id}`;
  let intento = 0;
  let creado = null;
  const passwordPlano = generarPassword();
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  while (!creado && intento < 5) {
    const usuarioIntento = intento === 0
      ? usuario
      : usuario.includes('@')
        ? usuario.replace('@', `${intento}@`)
        : `${usuario}${intento}`;
    try {
      const { rows } = await query(
        `INSERT INTO transportistas (nombre, usuario, password_hash, whatsapp, vehiculo, capacidad_vehiculo, activo)
         VALUES ($1,$2,$3,$4,$5,$6,false) RETURNING id, nombre, usuario`,
        [postulacion.nombre, usuarioIntento, passwordHash, postulacion.telefono, postulacion.tipo_vehiculo, postulacion.capacidad_carga]
      );
      creado = rows[0];
    } catch (err) {
      if (err.code === '23505') { intento++; continue; } // usuario duplicado, reintentar
      throw err;
    }
  }

  await query(`UPDATE postulaciones_transportistas SET estado = 'Aprobada' WHERE id = $1`, [id]);

  return { chofer: creado, usuario: creado?.usuario, passwordPlano };
}
