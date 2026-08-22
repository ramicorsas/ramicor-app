import { SignJWT, jwtVerify } from 'jose';

// Dos sesiones separadas, mismo patrón que Samply (cliente/agente): acá es
// admin (vos/staff RAMICOR) y transportista (chofer). Cookies distintas para
// que no se pisen si alguna vez conviven en el mismo browser.
export const ADMIN_SESSION_COOKIE = 'ramicor_admin_session';
export const TRANSPORTISTA_SESSION_COOKIE = 'ramicor_transportista_session';
const SESSION_TTL = '7d';

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Falta AUTH_SECRET en las variables de entorno (generar con: openssl rand -base64 32).');
  }
  return new TextEncoder().encode(secret);
}

async function sign(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecretKey());
}

async function verify(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

/** Firma un JWT de sesión de admin con { adminId, nombre, usuario }. */
export async function signAdminSession(payload) {
  return sign({ ...payload, kind: 'admin' });
}

/** Firma un JWT de sesión de transportista con { transportistaId, nombre, usuario }. */
export async function signTransportistaSession(payload) {
  return sign({ ...payload, kind: 'transportista' });
}

export async function verifySession(token) {
  return verify(token);
}

/** Lee y verifica la sesión de ADMIN desde la cookie de un NextRequest. */
export async function getAdminSessionFromRequest(req) {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}

/** Lee y verifica la sesión de TRANSPORTISTA desde la cookie de un NextRequest. */
export async function getTransportistaSessionFromRequest(req) {
  const token = req.cookies.get(TRANSPORTISTA_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verify(token);
}
