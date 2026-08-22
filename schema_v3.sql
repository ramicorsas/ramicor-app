-- RAMICOR · Migración v3
-- Suma una columna flexible para las preguntas que cambian según el tipo de
-- cotización (persona / corporativo / empresa) sin tener que migrar la tabla
-- cada vez que se agrega una pregunta nueva.

ALTER TABLE pedidos
  ADD COLUMN IF NOT EXISTS detalle_extra JSONB;
