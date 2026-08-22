# RAMICOR App — Setup

## 1. Neon (Postgres)
Corré `schema.sql` en el SQL Editor de tu proyecto Neon. Crea todas las tablas
(clientes, transportistas, admins, pedidos, pedidos_historial, pedidos_mensajes).

## 2. Alta de tu usuario admin
No hay usuarios admin por defecto — se cargan a mano una vez en Neon (el alta
de choferes sí se hace después desde el panel, sin tocar SQL).

Corré local: `node generar-hash.js "TuContraseña"` y con el hash que te da,
ejecutá en el SQL Editor de Neon:

```sql
INSERT INTO admins (nombre, usuario, password_hash)
VALUES ('Tu Nombre', 'tuusuario', '<hash generado>');
```

## 3. Variables de entorno (Netlify / .env)

```
DATABASE_URL=<connection string de Neon>
DATABASE_SSL=true
AUTH_SECRET=<generar con: openssl rand -base64 32>

# Notificaciones por mail a RAMICOR (pedido nuevo + pedido tomado)
ADMIN_NOTIFICATION_EMAIL=correo-de-ramicor@ejemplo.com
RESEND_API_KEY=
EMAIL_FROM=RAMICOR <pedidos@tudominio.com>
APP_URL=https://tu-sitio.netlify.app
```

**Sobre el mail:** mientras `RESEND_API_KEY` esté vacío, los avisos se
loguean en la consola del servidor (no fallan, no se pierden pedidos) — así
podés probar todo el flujo antes de conectar Resend de verdad. Cuando
quieras activarlo: creás cuenta gratis en resend.com, verificás tu dominio
(o usás el de prueba de ellos para arrancar), y pegás la API key acá.

## 4. Deploy
Conectá el repo de GitHub a Netlify, cargá las variables de arriba, y
cada push a `main` hace deploy automático.

## Flujo completo
1. Cliente pide flete en la landing (`/`) → mail a RAMICOR → pedido "Nuevo"
2. Admin entra a `/admin/pedidos`, abre el pedido, carga cotización/origen/destino
   → "Acondicionar y marcar disponible" → pasa a "Verificado"
3. Todos los choferes activos lo ven en `/transportista` → uno toca "Tomar"
   → mail a RAMICOR avisando quién lo tomó → pasa a "Tomado", queda bloqueado
   para el resto
4. Admin y chofer coordinan por el chat interno del pedido
5. Chofer marca "Completado" → admin marca "Cobrado" (o "Cancelado" en
   cualquier punto)

## Alta de choferes
Desde `/admin/choferes` → "+ Nuevo chofer". No hace falta tocar código ni SQL.
