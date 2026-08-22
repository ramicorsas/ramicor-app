-- RAMICOR · Schema Neon (Postgres)
-- Adaptado del modelo de Samply Soporte: mismos patrones (historial, sesiones
-- separadas, chat interno), aplicados a pedidos de flete en vez de tickets.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Clientes (quien pide el flete) ─────────────────────────────────────────
CREATE TABLE clientes (
  id            SERIAL PRIMARY KEY,
  nombre        TEXT NOT NULL,
  telefono      TEXT,
  email         TEXT,
  tipo          TEXT NOT NULL DEFAULT 'Personas', -- Personas | Corporativo | Empresas | Utilitarios y Maquinas
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Transportistas (choferes) ──────────────────────────────────────────────
CREATE TABLE transportistas (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  usuario        TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  whatsapp       TEXT,
  vehiculo       TEXT,
  activo         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Admins (vos / staff RAMICOR) ───────────────────────────────────────────
CREATE TABLE admins (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  usuario        TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Pedidos (equivalente a "tickets" en Samply) ────────────────────────────
CREATE TABLE pedidos (
  id                 SERIAL PRIMARY KEY,
  codigo             TEXT UNIQUE NOT NULL,          -- ej. RAM-0001
  cliente_id         INTEGER NOT NULL REFERENCES clientes(id),
  tipo_servicio      TEXT NOT NULL,                 -- Personas | Corporativo | Empresas | Utilitarios y Maquinas
  origen             TEXT,
  destino            TEXT,
  descripcion        TEXT,
  cotizacion         NUMERIC(12,2),
  moneda             TEXT DEFAULT 'ARS',
  estado             TEXT NOT NULL DEFAULT 'Nuevo',
    -- Nuevo -> Verificado -> Tomado -> Completado -> Cobrado (o Cancelado en cualquier punto)
  transportista_id   INTEGER REFERENCES transportistas(id),
  fecha_creacion     TIMESTAMPTZ NOT NULL DEFAULT now(),
  verificado_en      TIMESTAMPTZ,
  tomado_en          TIMESTAMPTZ,
  completado_en      TIMESTAMPTZ,
  cobrado_en         TIMESTAMPTZ,
  cancelado_en       TIMESTAMPTZ,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_transportista ON pedidos(transportista_id);

-- ── Historial (igual que tickets_historial en Samply) ──────────────────────
CREATE TABLE pedidos_historial (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  campo           TEXT NOT NULL,          -- 'estado', 'cotizacion', 'transportista', etc.
  valor_anterior  TEXT,
  valor_nuevo     TEXT,
  autor_tipo      TEXT,                   -- 'admin' | 'transportista' | 'sistema'
  autor_id        INTEGER,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Chat interno del pedido (admin ⇄ transportista) ────────────────────────
CREATE TABLE pedidos_mensajes (
  id           SERIAL PRIMARY KEY,
  pedido_id    INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  autor_tipo   TEXT NOT NULL,             -- 'admin' | 'transportista'
  autor_id     INTEGER NOT NULL,
  mensaje      TEXT NOT NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Seed inicial: tus dos usuarios actuales, migrados como admins ──────────
-- OJO: estos password_hash son placeholders. Antes de correr esto en Neon,
-- avisame y te genero los hashes reales (bcrypt) para Ramicor1234 / Chalo1234
-- (o las contraseñas nuevas que quieras usar).
-- INSERT INTO admins (nombre, usuario, password_hash) VALUES
--   ('administradorramicor', 'adminramicor', '<hash>'),
--   ('Gonzalo Javier Ramirez', 'gonramirez', '<hash>');
