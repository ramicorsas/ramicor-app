import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, TRANSPORTISTA_SESSION_COOKIE, verifySession } from '@/lib/auth';

// Protege /admin/* (salvo /admin/login) y /transportista (salvo su login),
// redirigiendo a la pantalla de login correspondiente si no hay sesión
// válida. Mismo patrón que middleware.js en Samply.
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (pathname.startsWith('/transportista') && pathname !== '/transportista/login') {
    const token = req.cookies.get(TRANSPORTISTA_SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) return NextResponse.redirect(new URL('/transportista/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/transportista/:path*'],
};
