-- RAMICOR · Migración v2
-- Suma los campos nuevos que pediste: peso, tipo de envío, tipo de vehículo,
-- horario de retiro, y la dirección desglosada (calle/altura/barrio/observaciones).
-- Es seguro correrlo sobre la base que ya tenés — no borra ni toca los pedidos existentes.

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS peso_kg NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS tipo_envio TEXT,              -- Paquetería | Palet | Carga completa | Mudanza | Otro
  ADD COLUMN IF NOT EXISTS tipo_vehiculo TEXT,           -- Utilitario | Camión chico | Camión mediano | Camión grande
  ADD COLUMN IF NOT EXISTS horario_retiro TEXT,
  ADD COLUMN IF NOT EXISTS origen_calle TEXT,
  ADD COLUMN IF NOT EXISTS origen_altura TEXT,
  ADD COLUMN IF NOT EXISTS origen_barrio TEXT,
  ADD COLUMN IF NOT EXISTS destino_calle TEXT,
  ADD COLUMN IF NOT EXISTS destino_altura TEXT,
  ADD COLUMN IF NOT EXISTS destino_barrio TEXT,
  ADD COLUMN IF NOT EXISTS observaciones TEXT;
