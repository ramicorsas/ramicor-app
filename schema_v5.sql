-- RAMICOR · Migración v5
-- Capacidad de carga del chofer, para filtrar qué pedidos le aparecen
-- disponibles según el tipo de vehículo que el admin definió al cotizar.

ALTER TABLE transportistas
  ADD COLUMN IF NOT EXISTS capacidad_vehiculo TEXT; -- Hasta 1 tn | Hasta 3 tn | Hasta 5 tn | Mas de 5 tn
