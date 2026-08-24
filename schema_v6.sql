-- RAMICOR · Migración v6
-- El mail pasa a ser obligatorio en las postulaciones de chofer, para
-- usarlo como usuario de login (en vez del teléfono) cuando el admin aprueba.

ALTER TABLE postulaciones_transportistas
  ADD COLUMN IF NOT EXISTS email TEXT;
