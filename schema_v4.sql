-- RAMICOR · Migración v4
-- Postulaciones de choferes desde la landing. El admin las revisa y decide
-- si las aprueba (y ahí sí crea el usuario real en /admin/choferes) o las
-- rechaza — nunca se activa un chofer solo.

CREATE TABLE IF NOT EXISTS postulaciones_transportistas (
  id              SERIAL PRIMARY KEY,
  nombre          TEXT NOT NULL,
  telefono        TEXT NOT NULL,
  tipo_vehiculo   TEXT,
  capacidad_carga TEXT,
  zona            TEXT,
  disponibilidad  TEXT,
  estado          TEXT NOT NULL DEFAULT 'Pendiente', -- Pendiente | Aprobada | Rechazada
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
